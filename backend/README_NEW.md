# Backend (NestJS + TypeORM) - Quick Start

## Tech
- NestJS 10 + TypeScript
- TypeORM (MySQL or SQLite for dev)
- JWT middleware for tenant (`business_id`)
- Basic modules: products, stock-batches, sync (offline-sale)

## Setup

1. Configure environment:

Create `.env` based on `.env.example`.

2. Install and run (dev):

```powershell
cd C:\pos_repo\backend
npm install
npm run start:dev
```

Backend will start on `http://localhost:3000/api`.

## Endpoints
- `GET /api/products` — list products (scoped by `business_id` when token provided)
- `POST /api/products` — create product (requires JWT with `business_id`)
- `GET /api/stock-batches?product_id=...` — FIFO batches for a product
- `POST /api/stock-batches` — create batch
- `POST /api/sync/offline-sale` — ingest offline sale (idempotency to be added)

## Notes
- For quick dev, set `DB_TYPE=sqlite` and `DB_DATABASE=./dev.sqlite`.
- For MySQL, set DB env vars and run migrations from `migrations/001_init.sql`.
- All queries should be scoped by `business_id`. The middleware attaches `req.businessId` if JWT is present.
