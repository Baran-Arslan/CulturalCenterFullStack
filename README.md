
Cultural Center Full-Stack Prototype
===================================

This is a minimal full-stack prototype implementing the architecture specified in the assignment:
- Frontend: React + Vite (SPA)
- Backend: Node.js + Express REST API
- Database: PostgreSQL (via Docker Compose)
- Auth: JWT (simple admin login)
- Communication: frontend -> backend over HTTPS (local dev uses HTTP); backend -> Postgres via Docker network

How to run (prerequisites):
- Docker & Docker Compose installed
- Node.js and npm (for local builds) - optional if using Docker for both services

Start with Docker Compose (recommended):
1. cd CulturalCenterFullStack
2. docker-compose up --build
3. Backend will be on http://localhost:4000
4. Frontend dev server on http://localhost:5173

Notes:
- The DB is initialized using init-db/init.sql (creates tables and sample events).
- Admin login: email admin@example.com, password: adminpass (set in .env or docker-compose env)
- JWT secret is set in .env (or docker-compose). For demo purposes, it's in docker-compose.yml env section.
- Bookings are stored in the database.

Repository structure:
- backend/        Express API server
- frontend/       React Vite SPA
- docker-compose.yml
- init-db/init.sql  SQL to initialize the database

Commit & review suggestions are in CONTRIBUTING.md
