# Estate Management Platform

A production-oriented multi-role real-estate marketplace built as a monorepo with a React + Vite frontend and an Express + MongoDB backend. The platform is designed to support customer, agent, seller, and admin workflows across different countries, currencies, and languages.

## Overview

This application provides:

- Multi-role marketplace access for customers, agents, sellers, and administrators
- Role-aware dashboards and access control
- Property listings with approval workflows
- Search, filters, saved favorites, inquiries, and appointments
- Multi-country and multilingual support
- Multi-currency pricing and conversion helpers
- Secure authentication with JWT + refresh token handling
- MongoDB-backed persistence and seeded marketplace data

## Architecture

This repository is organized as a monorepo:

- `apps/web` — React + Vite frontend
- `apps/api` — Express API server
- `apps/api/src/models` — MongoDB schema layer
- `apps/api/src/services` — business logic and token/currency helpers
- `apps/api/src/middleware` — authentication and authorization middleware
- `apps/api/src/routes` — API route definitions
- `apps/api/test` — backend validation and security tests

## Tech Stack

Frontend:
- React 19
- Vite
- React Router
- React i18next
- Tailwind CSS

Backend:
- Node.js
- Express 5
- MongoDB via Mongoose
- JWT authentication
- bcrypt password hashing
- Helmet, CORS, rate limiting, and Morgan

## Role Model

The application follows the required permission hierarchy:

- Platform Admin: full platform management
- Agent: own listings, sellers, leads, appointments, analytics, profile
- Seller: own properties and info tied to their assigned agent
- Customer: search, compare, save, inquire, schedule visits, manage personal account

Public registration is restricted to Customer, Agent, and Seller. Admin creation is intentionally internal-only.

## Features

### Authentication and security
- Secure registration and login
- JWT access tokens and refresh token rotation
- Password hashing with bcrypt
- Password reset flow and email verification scaffolding
- Role-based protected routes and ownership checks
- Rate limiting and security headers
- Public admin registration disabled

### Real-estate marketplace
- Property browse, detail, and search views
- Listing lifecycle with draft and submission states
- Property approvals and moderation workflow
- Media and document upload support
- Favorites, inquiries, and appointment flows
- Seller-agent assignment workflow

### Internationalization and currencies
- English and Hindi support
- User preference persistence for language and currency
- Country-aware default currency selection
- Formatting and conversion helpers for user display pricing

## Prerequisites

Before you begin, make sure you have:

- Node.js 18+ recommended
- MongoDB running locally or a reachable MongoDB instance
- npm or pnpm

## Local Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables.

Copy the example environment configuration if available and update the values for your local environment:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

If the project does not yet have a `.env.example` in the root, use values similar to:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/estate_marketplace
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Start MongoDB.
5. Seed sample marketplace data:

```bash
npm --workspace apps/api run seed
```

6. Start the API and frontend in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

The frontend typically runs on:
- http://localhost:5173

The backend typically runs on:
- http://localhost:5000/api

## Available Scripts

Root scripts:
- `npm run dev:web` — start the frontend
- `npm run dev:api` — start the backend
- `npm run build:web` — build the frontend for production
- `npm run lint:web` — run frontend linting

API scripts:
- `npm --workspace apps/api run dev` — run backend in dev mode
- `npm --workspace apps/api run start` — run backend in production mode
- `npm --workspace apps/api run seed` — seed test dataset
- `npm --workspace apps/api run lint` — syntax validation
- `npm --workspace apps/api test` — run backend security and validation tests

## Default Seed Accounts

The seed script creates example marketplace records and accounts such as:

- Admin: `admin@example.com` / `Admin@123`
- Agent: `agent@example.com` / `Agent@123`
- Seller: `seller@example.com` / `Seller@123`
- Customer: `customer@example.com` / `Customer@123`

## Security Notes

This project is structured for production-oriented use and includes:

- bcrypt hashing for passwords
- JWT access tokens and refresh token rotation
- rate limiting across API routes
- protected route guards and RBAC enforcement
- file and upload validation for property media/documents
- role-specific ownership protections for private records
- no public admin registration path

Additional production hardening may still include:
- real email delivery provider integration
- object storage for media uploads
- full audit trails for moderation actions
- stronger analytics and report pipelines

## Testing

The project includes validation and security checks for:

- registration validation
- role enforcement
- authorization/ownership enforcement
- default currency behavior
- exchange-rate conversion logic

Run:

```bash
npm --workspace apps/api test
```

## Production Deployment Notes

For production, consider:

- hosting MongoDB in a managed cluster
- using environment-specific secrets and config
- enabling HTTPS and secure cookies where applicable
- using object storage for files and documents
- adding a proper email delivery service for verification and password reset flows
- configuring CI/CD and automated regression tests

## License

This project is currently a private internal implementation and is not published to a public package registry.

## Project Status

The platform includes the core architecture for a real-estate marketplace with multi-role access, property management, moderation, pricing, search, and auth flows. Remaining product hardening is primarily in the final production operations layer: deeper reporting, object storage, mail delivery, and extended operational security automation.
