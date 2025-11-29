# Architecture Summary

- Single remote MySQL DB (multi-tenant by business_id)
- Angular frontend with local IndexedDB (Dexie) for offline
- Node.js backend with FIFO inventory engine
- UUIDs primary keys for offline-capable entities
- Human-readable invoice_no assigned by server
- Sync endpoint /sync/offline-sale for offline sales ingestion
