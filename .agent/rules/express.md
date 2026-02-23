# Express.js Development Guidelines

> Objective: Define standards for building maintainable, secure Node.js APIs and web apps with Express.

## 1. Project Structure

- Organize by feature/domain, not by type:
  ```
  src/
  ├── routes/       # Route definitions (thin, delegates to controllers)
  ├── controllers/  # Request handling, input validation
  ├── services/     # Business logic
  ├── middlewares/  # Custom Express middleware
  ├── models/       # Data models (Mongoose, Sequelize, etc.)
  └── app.js        # Express app factory (no listen() here)
  cmd/server.js     # Entry point (calls app.listen())
  ```
- Separate `app.js` (creates and configures the app) from `server.js` (starts it). This makes the app easily testable.

## 2. Routing & Controllers

- Use `express.Router()` to create modular route groups. Mount them with `app.use('/api/v1/users', userRouter)`.
- Keep route handlers thin. Validate input and delegate to a service function.
- Always use `async`/`await` in route handlers. Wrap with a `asyncHandler` helper or use `express-async-errors` to automatically forward errors to the error middleware.

## 3. Middleware

- Order matters: register middleware in this sequence: security headers → CORS → body parsing → logging → routes → 404 handler → global error handler.
- Use **Helmet** for security headers and **cors** package for CORS configuration.
- Define a centralized error-handling middleware with 4 parameters: `(err, req, res, next)`. Always register it last.

## 4. Security

- Use **express-rate-limit** to prevent brute-force attacks on auth endpoints.
- Validate and sanitize all request inputs with **Zod**, **Joi**, or **express-validator**.
- Never trust `req.body` without validation. Use `express.json({ limit: '10kb' })` to prevent payload attacks.

## 5. Testing

- Use **Supertest** with **Jest** or **Vitest** for integration tests. Import the `app` instance (not the server) for testing.
- Run `npm test` in CI. Use `nodemon` for local development hot-reload.
