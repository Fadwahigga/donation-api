# Donation API

A backend API for a **Donation / Micro-Payments** application built with Node.js, TypeScript, Express.js, Prisma ORM, and MySQL.

This API allows users to donate to "causes" or "creators" using mobile money (MoMo) payments, and enables cause owners to receive payouts from collected donations.

## Features

- **Causes Management**: Create, read, update, and delete donation causes
- **Donations**: Accept donations via MoMo RequestToPay
- **Payouts**: Disburse funds to cause owners via MoMo Transfer
- **Payment Status Tracking**: Check and sync payment statuses from MoMo API
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling with custom error classes

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL
- **Payment Gateway**: MTN MoMo API

## Project Structure

```
donation-api/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── config/
│   │   ├── database.ts     # Prisma client singleton
│   │   └── env.ts          # Environment configuration
│   ├── controllers/
│   │   ├── causeController.ts
│   │   ├── donationController.ts
│   │   ├── payoutController.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── errorHandler.ts # Error handling middleware
│   │   ├── validators.ts   # Input validation middleware
│   │   └── index.ts
│   ├── routes/
│   │   ├── causeRoutes.ts
│   │   ├── donationRoutes.ts
│   │   ├── payoutRoutes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── causeService.ts
│   │   ├── donationService.ts
│   │   ├── payoutService.ts
│   │   ├── momoService.ts  # MoMo API integration
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── utils/
│   │   └── logger.ts       # Simple logger utility
│   └── index.ts            # Application entry point
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- MTN MoMo Developer Account (for API credentials)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd donation-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (MySQL)
DATABASE_URL="mysql://user:password@localhost:3306/donation_db"

# MoMo API Configuration
MOMO_BASE_URL="https://sandbox.momodeveloper.mtn.com"
MOMO_SUBSCRIPTION_KEY="your-subscription-key"
MOMO_API_USER_ID="your-api-user-id"
MOMO_API_KEY="your-api-key"
MOMO_TARGET_ENVIRONMENT="sandbox"
MOMO_COLLECTION_CALLBACK_URL="https://your-domain.com/webhooks/momo/collection"
MOMO_DISBURSEMENT_CALLBACK_URL="https://your-domain.com/webhooks/momo/disbursement"
```

### 4. Create the database

Create a MySQL database:

```sql
CREATE DATABASE donation_db;
```

### 5. Run Prisma migrations

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate
```

### 6. Start the server

**Development mode** (with hot reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Health Check

```
GET /api/v1/health
```

### Causes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/causes` | Get all causes |
| POST | `/api/v1/causes` | Create a new cause |
| GET | `/api/v1/causes/:id` | Get cause by ID |
| PUT | `/api/v1/causes/:id` | Update a cause |
| DELETE | `/api/v1/causes/:id` | Delete a cause |

### Donations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/donate` | Create a donation (initiate payment) |
| GET | `/api/v1/donations/:id` | Get donation by ID |
| GET | `/api/v1/donations/:id/status` | Check/sync donation status |
| GET | `/api/v1/causes/:causeId/donations` | Get donations for a cause |
| GET | `/api/v1/donor/:phone/donations` | Get donor's donation history |

### Payouts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payout` | Create a payout (initiate transfer) |
| GET | `/api/v1/payouts/:causeId` | Get payouts for a cause |
| GET | `/api/v1/payouts/:causeId/summary` | Get payout summary |
| GET | `/api/v1/payouts/detail/:id` | Get payout by ID |
| GET | `/api/v1/payouts/detail/:id/status` | Check/sync payout status |

## Testing the API

### Using cURL

**Create a cause:**

```bash
curl -X POST http://localhost:3000/api/v1/causes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Help Build a School",
    "description": "Raising funds to build a school in rural area",
    "ownerPhone": "+237670000001"
  }'
```

**Make a donation:**

```bash
curl -X POST http://localhost:3000/api/v1/donate \
  -H "Content-Type: application/json" \
  -d '{
    "causeId": "<cause-uuid>",
    "amount": "1000",
    "currency": "XAF",
    "donorPhone": "+237670000002",
    "payerMessage": "Happy to help!"
  }'
```

**Get donations for a cause:**

```bash
curl http://localhost:3000/api/v1/causes/<cause-uuid>/donations
```

**Create a payout:**

```bash
curl -X POST http://localhost:3000/api/v1/payout \
  -H "Content-Type: application/json" \
  -d '{
    "causeId": "<cause-uuid>",
    "amount": "500",
    "currency": "XAF"
  }'
```

### Using Postman

1. Import the API endpoints into Postman
2. Set the base URL to `http://localhost:3000/api/v1`
3. Test each endpoint with appropriate request bodies

## MoMo API Integration

### Sandbox vs Production

The API is configured to work with both MoMo Sandbox and Production environments.

**Sandbox Configuration:**
- Base URL: `https://sandbox.momodeveloper.mtn.com`
- Target Environment: `sandbox`

**Production Configuration:**
- Base URL: `https://momodeveloper.mtn.com` (or region-specific URL)
- Target Environment: Production environment name (e.g., `mtncameroon`)

### Getting MoMo Credentials

1. Sign up at [MTN MoMo Developer Portal](https://momodeveloper.mtn.com)
2. Subscribe to the **Collection** and **Disbursement** products
3. Get your Subscription Key from the portal
4. Create an API User and get the API Key

### Configuring Callbacks

For real-time payment status updates, configure callback URLs in your `.env`:

```env
MOMO_COLLECTION_CALLBACK_URL="https://your-domain.com/webhooks/momo/collection"
MOMO_DISBURSEMENT_CALLBACK_URL="https://your-domain.com/webhooks/momo/disbursement"
```

**Note**: For local development, use a tunnel service like ngrok to expose your local server.

## Database Commands

```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Deploy migrations to production
npm run prisma:migrate:prod

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `DATABASE_URL` | Yes | MySQL connection string |
| `MOMO_BASE_URL` | Yes | MoMo API base URL |
| `MOMO_SUBSCRIPTION_KEY` | Yes | MoMo subscription key |
| `MOMO_API_USER_ID` | Yes | MoMo API user ID |
| `MOMO_API_KEY` | Yes | MoMo API key |
| `MOMO_TARGET_ENVIRONMENT` | No | MoMo target environment (default: sandbox) |
| `MOMO_COLLECTION_CALLBACK_URL` | No | Callback URL for collection notifications |
| `MOMO_DISBURSEMENT_CALLBACK_URL` | No | Callback URL for disbursement notifications |

## Future Improvements

- [ ] Add webhook endpoints for MoMo callbacks
- [ ] Implement authentication/authorization (JWT)
- [ ] Add rate limiting
- [ ] Add request logging to file/external service
- [ ] Add unit and integration tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement retry logic for failed payments
- [ ] Add support for multiple payment providers

## License

MIT

