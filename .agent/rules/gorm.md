# GORM Development Guidelines

> Objective: Define standards for using GORM safely, efficiently, and maintainably in Go applications.

## 1. Connection & Configuration

- Initialize a **single `*gorm.DB` instance** per database and reuse it throughout the application. `*gorm.DB` is goroutine-safe.
- Configure the underlying `sql.DB` connection pool explicitly to prevent connection exhaustion:

  ```go
  sqlDB, _ := db.DB()
  sqlDB.SetMaxOpenConns(25)
  sqlDB.SetMaxIdleConns(10)
  sqlDB.SetConnMaxLifetime(5 * time.Minute)
  sqlDB.SetConnMaxIdleTime(10 * time.Minute)
  ```

- Enable `PrepareStmt: true` in `gorm.Config{}` to cache prepared statements for better query performance.
- Always call **`db.WithContext(ctx)`** to propagate request context (deadline and cancellation) through all GORM operations. Never use the bare `db` instance in request handlers.
- Enable `Logger: logger.Default.LogMode(logger.Info)` in development to log all SQL queries for debugging. Use `logger.Warn` or `logger.Silent` in production.

## 2. Model Definition

- Define models as Go structs. Use `gorm.Model` (embeds `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) for standard tables that benefit from soft delete.
- Use GORM struct tags for explicit mapping: `gorm:"column:name;not null;uniqueIndex;default:0"`. Be explicit — do not rely on GORM's naming conventions silently.
- Use **soft deletes** (via `DeletedAt gorm.DeletedAt`) only for records that must be logically archived. Understand that all queries automatically filter soft-deleted records — use `Unscoped()` to bypass.
- Define relationships explicitly using GORM association tags. Use `foreignKey` and `references` to avoid GORM inferring incorrect names for non-standard column names.
- Prefer value objects (custom types with `Scan`/`Value` methods) over raw strings or `json.RawMessage` for structured column data.

## 3. Querying

- Use the **method chaining** API: `db.WithContext(ctx).Where("status = ?", "active").Order("created_at DESC").Find(&users)`.
- **Never interpolate user input directly** into conditions. Always use `?` positional placeholders or named variables: `db.Where("email = ?", email)`.
- Use `Preload("Association")` for eager loading associations to prevent N+1 queries. Use `Joins` + `Select` for performance-critical read paths where you need to filter by association.
- Use `Select("id", "name", "email")` to limit column projection. Avoid `SELECT *` — it fetches unnecessary data and breaks when columns are added/removed.
- Use `Count` and `Limit`/`Offset` together for pagination: `db.Model(&User{}).Count(&total); db.Limit(20).Offset(page*20).Find(&users)`.

## 4. Transactions

- Use `db.Transaction(func(tx *gorm.DB) error { ... })` for atomic multi-step operations. Returning any non-nil error triggers automatic rollback.
- Always use the transaction `tx` variable (not the global `db`) for all operations within the transaction block — otherwise operations bypass the transaction.
- For long-running or complex transactions, use the manual `db.Begin()` / `tx.Commit()` / `tx.Rollback()` API and handle rollback in a `defer`.
- Set a context with a deadline on long transactions to prevent them holding locks indefinitely: `db.WithContext(ctx).Transaction(...)`.

## 5. Migrations & Anti-Patterns

- Use **GORM's `AutoMigrate`** only in development or test environments. **Never rely on `AutoMigrate` in production** — it cannot handle destructive schema changes safely.
- Use a dedicated migration tool for production: **golang-migrate**, **Atlas**, or **Goose**. Commit all migration files to version control alongside code.
- Avoid raw queries with `db.Exec()` when user input is involved. Use parameterized forms: `db.Exec("UPDATE users SET name = ? WHERE id = ?", name, id)`.
- Avoid GORM **callbacks/hooks** (`BeforeCreate`, `AfterSave`) for business logic side effects. Make transformations explicit in the service layer.
- Avoid using the global `db.DB()` singleton in tests. Use an in-memory SQLite database or a test container with a real DB for integration tests.
