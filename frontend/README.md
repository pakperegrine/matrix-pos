# Frontend (Angular) - Minimal scaffold

This folder contains a minimal Angular scaffold for the POS frontend with a Dexie-based local DB service and a simple POS page.

Quick start:

1. Install dependencies:

```powershell
cd C:\pos_repo\frontend
npm install
```

2. Run dev server (requires Angular CLI or uses npx):

```powershell
npx ng serve --open
```

Notes:
- This is intentionally minimal — it includes a small AppShell and a `POS` component demonstrating products listing, cart, and a sync button that POSTs to `/sync/offline-sale`.
- You should run the backend (or mock `/sync/offline-sale`) to test sync.
# Frontend (Angular) - Starter Notes

## Tech
- Angular (latest LTS)
- TypeScript
- SCSS
- Dexie.js for IndexedDB
- Storybook for component library

## Initial tasks
1. Create AppShell with Header and Sidebar components.
2. Implement theme variables (SCSS) and theme toggle.
3. Implement component library:
   - Table (server-side pagination), Form primitives, Modal, Toast
   - POS components: POSGrid, POSProductCard, CartPanel, ReceiptPrint
4. Integrate Dexie local DB schema and simple sync demo that posts to /sync/offline-sale.

## Table contract
Expect server response:
{
  data: [...],
  page: 1,
  perPage: 25,
  total: 1023
}
