# Backend (Node.js + Express) - Starter Notes

## Tech
- Node.js (LTS) + TypeScript recommended
- Express
- Knex.js or TypeORM for DB
- JWT for auth
- Bcrypt / argon2 for password hashing
- Jest for tests
- Dockerfile + docker-compose

## Initial tasks
1. Scaffold project and folder layout (controllers, services, models, middleware).
2. Implement auth (login) and JWT middleware.
3. Implement tenant middleware to extract business_id from JWT.
4. Implement products endpoints and stock_batches endpoints.
5. Implement POS /sync/offline-sale endpoint (idempotent).
6. Add migrations folder with 001_init.sql (this repo).

## Notes
- All queries must be scoped by business_id.
- Use UUIDs for PKs on critical tables.
