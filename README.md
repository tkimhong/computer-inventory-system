# Computer Inventory System

INF 653 Backend Development · Group 2

A web-based internal tool for IT departments to manage the full lifecycle of computer hardware and peripherals: from procurement to assignment and reporting.

## Live demo

Hosted on Render: https://computer-inventory-system.onrender.com

> Admin credentials are provided separately in the submission.

## Tech stack

- **Backend**: Node.js + Express.js
- **View Engine**: Handlebars (HBS)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (cookie for UI, Bearer for API) + API Keys
- **File Storage**: Local filesystem (Multer)
- **Deployment**: Render

## Features

- Inventory CRUD: add, edit, soft-delete assets
- Check-in / Check-out with document upload
- Asset history: full transaction log with duration of use
- User management: roles (Admin/Technician), enable/disable accounts
- API Key management: generate, list, revoke
- Reporting: inventory status, asset aging, user audit
- RBAC: Admin-only endpoints enforced
- Rate limiting: 20 requests/min per IP

## Local setup

```bash
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, SEED_USERNAME, SEED_PASSWORD
npm install
npm start
```

## API endpoints

| Method | Endpoint                   | Description                 | Auth           |
| ------ | -------------------------- | --------------------------- | -------------- |
| POST   | /api/auth/login            | Get JWT token               | Public         |
| POST   | /api/users                 | Create user                 | JWT (Admin)    |
| PATCH  | /api/users/:id/role        | Update role                 | JWT (Admin)    |
| PATCH  | /api/users/:id/status      | Enable/Disable user         | JWT (Admin)    |
| GET    | /api/items                 | List all items              | JWT or API Key |
| POST   | /api/items                 | Create item                 | JWT            |
| PUT    | /api/items/:id             | Update item                 | JWT            |
| DELETE | /api/items/:id             | Soft delete item            | JWT (Admin)    |
| GET    | /api/items/:id/history     | Item transaction history    | JWT            |
| POST   | /api/transactions/checkout | Check out item + upload doc | JWT            |
| POST   | /api/transactions/checkin  | Check in item + upload doc  | JWT            |
| POST   | /api/keys                  | Generate API key            | JWT (Admin)    |
| GET    | /api/keys                  | List active API keys        | JWT (Admin)    |
| DELETE | /api/keys/:id              | Revoke API key              | JWT (Admin)    |

## API key testing

1. Log in as Admin and go to `/keys`
2. Generate a key and copy it (shown once)
3. Use it in requests:

```http
GET https://computer-inventory-system.onrender.com/api/items
x-api-key: your_raw_key_here
```
