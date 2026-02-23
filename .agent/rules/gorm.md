# GORM Development Guidelines

> Objective: Define standards for using GORM safely and efficiently in Go applications.

## 1. Connection & Configuration

- Initialize a single `*gorm.DB` instance per database and reuse it. GORM's `*gorm.DB` is goroutine-safe.
- Configure the underlying `sql.DB` connection pool explicitly:
  ```go
  sqlDB, _ := db.DB()
  sqlDB.SetMaxOpenConns(25)
  sqlDB.SetMaxIdleConns(10)
  sqlDB.SetConnMaxLifetime(5 * time.Minute)
  ```
- Enable `PrepareStmt: true` in GORM config for better query performance via prepared statement caching.

## 2. Model Definition

- Define models as Go structs. Use `gorm.Model` (embeds `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) for standard tables.
- Use GORM struct tags for explicit control: `gorm:"column:name;not null;uniqueIndex"`.
- Use **soft deletes** (via `DeletedAt gorm.DeletedAt`) for records that should be logically deleted but retained for audit.

## 3. Querying

- Always use the **method chaining** API: `db.Where("status = ?", "active").Find(&users)`.
- **Never interpolate user input directly** into GORM conditions. Always use `?` placeholders or named variables: `db.Where("name = ?", name)`.
- Use `Preload()` for eager loading associations to avoid N+1 queries.
- Use `Select()` to limit columns returned: `db.Select("id", "name").Find(&users)`.
- Use `db.WithContext(ctx)` to propagate request context (deadlines, cancellation) through all queries.

## 4. Transactions

- Use `db.Transaction(func(tx *gorm.DB) error { ... })` for atomic multi-step operations. Return any error to trigger rollback.
- Pass the `tx *gorm.DB` variable (not the session `db`) to all operations within a transaction.

## 5. Migrations & Safety

- Use **GORM's AutoMigrate** (`db.AutoMigrate(&Model{})`) only in development or test environments. Never rely on it in production.
- Use a dedicated migration tool (golang-migrate, Atlas, goose) for production schema changes.
- Do not use `db.Exec()` with raw user input. If raw SQL is required, always use parameterized queries.
