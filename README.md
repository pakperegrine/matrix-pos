# SaaS POS - Repository Scaffold

This repository contains scaffold files, an ERD (ASCII), OpenAPI spec, and initial SQL migration for the SaaS POS project discussed in the design document.

## Contents
- `openapi.yaml` - OpenAPI 3.0 spec (core endpoints)
- `migrations/001_init.sql` - Initial SQL schema (UUID primary keys where required)
- `erd/erd.txt` - ASCII Entity Relationship Diagram
- `frontend/README.md` - Frontend starter notes (Angular + components)
- `backend/README.md` - Backend starter notes (Node.js + Express)
- `docs/architecture.md` - Short architecture summary

Use this scaffold as the starting point for GitHub Copilot to generate code and for developers to implement modules incrementally.

## How to use
1. Extract the zip and open `frontend` and `backend` folders.
2. Follow `frontend/README.md` and `backend/README.md` to start local dev.
3. Run the SQL migration on a MySQL instance (create database first).
4. Load `openapi.yaml` into Swagger Editor to inspect and generate server/client stubs.

