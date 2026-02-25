# GORM Development Guidelines

> Objective: Define standards for using GORM safely, efficiently, and maintainably in Go applications, covering connection pooling, model definition, querying, transactions, and production migrations.

## 1. Connection & Configuration

### DB Initialization

- Initialize a **single `*gorm.DB` instance** per database connection and reuse it throughout the application. `*gorm.DB` is goroutine-safe — sharing a single instance is correct and expected.
- Configure the underlying `sql.DB` connection pool **explicitly** to prevent connection exhaustion in production:

  ```go
  db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
    PrepareStmt:                              true,    // cache prepared statements
    DisableForeignKeyConstraintWhenMigrating: true,    // manage FKs in migrations
    Logger:                                  logger.Default.LogMode(logger.Warn),
  })
  if err != nil { log.Fatalf("failed to connect database: %v", err) }

  sqlDB, _ := db.DB()
  sqlDB.SetMaxOpenConns(25)             // max simultaneous connections
  sqlDB.SetMaxIdleConns(10)             // idle connections to keep in pool
  sqlDB.SetConnMaxLifetime(5 * time.Minute)   // max time a connection can be reused
  sqlDB.SetConnMaxIdleTime(10 * time.Minute)  // max time an idle connection stays open
  ```

- Always call **`db.WithContext(ctx)`** to propagate the request context (deadline and cancellation) through all GORM operations. Never use the bare `db` instance directly in request handlers:

  ```go
  // ❌ No context — ignores request deadline/cancellation
  db.Find(&users)

  // ✅ Propagates context
  db.WithContext(ctx).Find(&users)
  ```

- Use `logger.Default.LogMode(logger.Info)` in development to log all SQL queries. Use `logger.Warn` or `logger.Silent` in production to reduce log volume.

## 2. Model Definition

### Struct Design

- Use **`gorm.Model`** (embeds `ID uint`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) for tables that benefit from soft delete and standard timestamps:
  ```go
  type Order struct {
    gorm.Model               // provides ID, CreatedAt, UpdatedAt, DeletedAt
    UserID    uint           `gorm:"not null;index"`
    Status    OrderStatus    `gorm:"type:varchar(32);not null;default:'pending'"`
    Total     decimal.Decimal `gorm:"type:decimal(10,2);not null"`
    User      User           `gorm:"foreignKey:UserID;references:ID"`
    Items     []OrderItem    `gorm:"foreignKey:OrderID"`
  }
  ```
- Use **explicit GORM struct tags** — do not rely on naming convention inference for non-standard configurations:

  ```go
  type User struct {
    ID        uint      `gorm:"primarykey;autoIncrement"`
    Email     string    `gorm:"column:email;not null;uniqueIndex;size:320"`
    Name      string    `gorm:"column:name;not null;size:100"`
    Role      string    `gorm:"column:role;not null;default:'viewer'"`
    CreatedAt time.Time `gorm:"column:created_at;not null;autoCreateTime"`
    UpdatedAt time.Time `gorm:"column:updated_at;not null;autoUpdateTime"`
    // Soft-delete: if you need it, add:
    DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index"`
  }

  func (User) TableName() string { return "users" }  // explicit table name
  ```

- Define **relationships explicitly** with `foreignKey` and `references` to avoid GORM inferring incorrect column names:
  ```go
  type Order struct {
    ID     uint   `gorm:"primarykey"`
    UserID uint   `gorm:"not null;index"`
    User   User   `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:RESTRICT;"`
  }
  ```
- Use **soft deletes** (`DeletedAt gorm.DeletedAt`) only for records that need logical archival. Understand that all GORM queries automatically filter soft-deleted records — use `.Unscoped()` to bypass for admin queries.

## 3. Querying

### Safe Query Building

- Use the **method chaining** API with explicit context propagation:
  ```go
  var users []User
  result := db.WithContext(ctx).
    Where("status = ? AND created_at > ?", "active", cutoff).
    Order("created_at DESC").
    Limit(20).
    Offset(page * 20).
    Find(&users)
  if result.Error != nil { return fmt.Errorf("list users: %w", result.Error) }
  ```
- **Never interpolate user input** into GORM conditions. Always use `?` positional placeholders or named parameters:

  ```go
  // ❌ SQL injection — never do this
  db.Where(fmt.Sprintf("email = '%s'", email)).First(&user)

  // ✅ Parameterized
  db.WithContext(ctx).Where("email = ?", email).First(&user)

  // ✅ Named map conditions
  db.WithContext(ctx).Where(map[string]any{"email": email, "status": "active"}).First(&user)
  ```

- Use **`Preload`** for eager loading associations to prevent N+1 queries:

  ```go
  // Load users and their orders in 2 queries (not N+1)
  db.WithContext(ctx).Preload("Orders.Items").Find(&users)

  // Use Joins + Select for filtering by associated fields (single query)
  db.WithContext(ctx).
    Joins("JOIN orders ON orders.user_id = users.id AND orders.status = ?", "pending").
    Select("users.*").
    Find(&users)
  ```

- Use **`Select`** to limit column projection. Avoid `SELECT *`:
  ```go
  db.WithContext(ctx).
    Select("id", "name", "email", "role").
    Where("status = ?", "active").
    Find(&users)
  ```
- Use **keyset pagination** for large datasets instead of `OFFSET`:

  ```go
  // First page
  db.WithContext(ctx).Where("status = ?", "active").Order("id ASC").Limit(20).Find(&items)

  // Next page (using last ID from previous page)
  db.WithContext(ctx).Where("status = ? AND id > ?", "active", lastID).Order("id ASC").Limit(20).Find(&items)
  ```

## 4. Transactions

- Use **`db.Transaction()`** for atomic multi-step operations. Returning non-nil error triggers automatic rollback:
  ```go
  err := db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&order).Error; err != nil { return err }
    if err := tx.Model(&user).Update("credits", gorm.Expr("credits - ?", amount)).Error; err != nil { return err }
    if user.Credits-amount < 0 { return ErrInsufficientCredits }
    return nil
  })
  ```
- Always use the **`tx` variable** (not the global `db`) for all operations inside the transaction — otherwise, operations bypass the transaction context:

  ```go
  db.Transaction(func(tx *gorm.DB) error {
    // ✅ Uses transaction
    tx.Create(&orderItem)

    // ❌ Bypasses transaction — commits independently!
    db.Create(&notification)

    return nil
  })
  ```

- For complex operations with explicit control, use `Begin()`/`Commit()`/`Rollback()` with a `defer`:

  ```go
  tx := db.WithContext(ctx).Begin()
  defer func() { if r := recover(); r != nil { tx.Rollback() } }()

  if err := tx.Create(&record).Error; err != nil { tx.Rollback(); return err }
  return tx.Commit().Error
  ```

## 5. Migrations & Anti-Patterns

### Production Migrations

- Use **GORM's `AutoMigrate`** ONLY in development/test environments. **NEVER in production** — it cannot handle destructive schema changes (column type changes, column drops) safely.
- Use a dedicated migration tool for production — commit migration files alongside code:
  - **golang-migrate** (`migrate -database postgres://... -path ./migrations up`)
  - **Atlas** (`atlas schema apply --url postgres://...`)
  - **Goose** (`goose postgres "$DATABASE_URL" up`)

### Anti-Patterns to Avoid

- **Avoid GORM hooks/callbacks** (`BeforeCreate`, `AfterSave`) for business logic side effects. Make transformations explicit in the service layer where they're visible and testable:

  ```go
  // ❌ Hidden side effect — password hashing in BeforeCreate hook
  func (u *User) BeforeCreate(tx *gorm.DB) error { u.Password = hash(u.Password); return nil }

  // ✅ Explicit in service
  user.HashedPassword = hashPassword(plaintext)
  db.Create(&user)
  ```

- **Avoid raw queries with `db.Exec`** when user input is involved — use parameterized forms:

  ```go
  // ❌ Potential injection
  db.Exec(fmt.Sprintf("UPDATE users SET name = '%s' WHERE id = %d", name, id))

  // ✅ Parameterized
  db.Exec("UPDATE users SET name = ? WHERE id = ?", name, id)
  ```

- **Testing**: Use Testcontainers with a real PostgreSQL container for integration testing — never rely on SQLite for testing PostgreSQL-specific features. Use `docker.NewDockerClientWithOpts()` via testcontainers-go.
