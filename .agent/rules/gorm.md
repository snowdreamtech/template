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
  ```
- Enable `PrepareStmt: true` in `gorm.Config{}` to cache prepared statements for better query performance. Disable in development if you need to inspect raw SQL frequently.
- Always call **`db.WithContext(ctx)`** to propagate request context (deadline and cancellation) through all GORM operations.

## 2. Model Definition

- Define models as Go structs. Use `gorm.Model` (embeds `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) for standard tables.
- Use GORM struct tags for explicit mapping: `gorm:"column:name;not null;uniqueIndex;default:0"`.
- Use **soft deletes** (via `DeletedAt gorm.DeletedAt`) for records that must be logically archived and retained for audit trails.
- Define relationships explicitly using GORM association tags. Use `foreignKey` and `references` to avoid GORM inferring incorrect foreign key names.

## 3. Querying

- Use the **method chaining** API: `db.WithContext(ctx).Where("status = ?", "active").Order("created_at DESC").Find(&users)`.
- **Never interpolate user input directly** into conditions. Always use `?` positional placeholders or named variables: `db.Where("email = ?", email)`.
- Use `Preload("Association")` for eager loading associations to prevent N+1 queries. Use `Joins` + `Select` for performance-critical read paths.
- Use `Select("id", "name", "email")` to limit column projection. Never `SELECT *` in production queries.

## 4. Transactions

- Use `db.Transaction(func(tx *gorm.DB) error { ... })` for atomic multi-step operations. Returning any error triggers automatic rollback.
- Always use the transaction `tx` variable (not `db`) for all operations within the transaction block.
- For long-running or complex transactions, use the manual `db.Begin()` / `tx.Commit()` / `tx.Rollback()` API and handle the rollback in a `defer`.

## 5. Migrations & Anti-Patterns

- Use **GORM's `AutoMigrate`** only in development or test environments. **Never rely on `AutoMigrate` in production** — it cannot handle destructive changes or complex migrations safely.
- Use a dedicated migration tool for production: **golang-migrate**, **Atlas**, or **Goose**. Commit all migration files to version control.
- Avoid **raw queries** with `db.Exec()` if user input is involved. Use parameterized forms: `db.Exec("UPDATE users SET name = ? WHERE id = ?", name, id)`.
- Avoid using GORM's magic (global DB, callbacks/hooks for side effects) — make data transformations explicit in service layer code.
