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

# Authentication
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# MoMo API Configuration
MOMO_BASE_URL="https://sandbox.momodeveloper.mtn.com"
MOMO_SUBSCRIPTION_KEY="your-subscription-key"
MOMO_API_USER_ID="your-api-user-id"
MOMO_API_KEY="your-api-key"
MOMO_TARGET_ENVIRONMENT="sandbox"
MOMO_COLLECTION_CALLBACK_URL="https://your-domain.com/api/v1/webhooks/momo/collection"
MOMO_DISBURSEMENT_CALLBACK_URL="https://your-domain.com/api/v1/webhooks/momo/disbursement"
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

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register a new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |

**Authentication**: Most endpoints support optional authentication. Include JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

### Causes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/causes` | Get all causes | No |
| POST | `/api/v1/causes` | Create a new cause | Optional |
| GET | `/api/v1/causes/:id` | Get cause by ID | No |
| PUT | `/api/v1/causes/:id` | Update a cause | Optional |
| DELETE | `/api/v1/causes/:id` | Delete a cause | Optional |

### Donations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/donate` | Create a donation (initiate payment) | No |
| GET | `/api/v1/donations/:id` | Get donation by ID | No |
| GET | `/api/v1/donations/:id/status` | Check/sync donation status | No |
| GET | `/api/v1/causes/:causeId/donations` | Get donations for a cause | No |
| GET | `/api/v1/donor/:phone/donations` | Get donor's donation history | No |

### Payouts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/payout` | Create a payout (initiate transfer) | Optional |
| GET | `/api/v1/payouts/:causeId` | Get payouts for a cause | No |
| GET | `/api/v1/payouts/:causeId/summary` | Get payout summary | No |
| GET | `/api/v1/payouts/detail/:id` | Get payout by ID | No |
| GET | `/api/v1/payouts/detail/:id/status` | Check/sync payout status | No |

### Webhooks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/webhooks/momo/collection` | Handle MoMo collection callbacks | No |
| POST | `/api/v1/webhooks/momo/disbursement` | Handle MoMo disbursement callbacks | No |

**Note**: Webhook endpoints are called by MoMo API servers and should be publicly accessible.

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

**Register a user:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+237670000000"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
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

This API integrates with **MTN Mobile Money (MoMo) APIs** for processing payments. This integration allows you to:
- **Collect donations** via Request to Pay (Collection API)
- **Disburse funds** to cause owners via Transfer (Disbursement API)
- **Track payment status** in real-time via webhooks

### Getting Started with MTN MoMo Developer Portal

#### Step 1: Create Developer Account

1. Visit [MTN MoMo Developer Portal](https://momodeveloper.mtn.com)
2. Click **"Sign Up"** and create your developer account
3. Verify your email address

#### Step 2: Subscribe to Products

1. Log into the developer portal
2. Navigate to **"Products"** section
3. Subscribe to the following products:
   - **Collection** (for receiving donations)
   - **Disbursement** (for paying out to cause owners)

#### Step 3: Get Your Subscription Key

1. Go to **"Keys"** section in the portal
2. Copy your **Primary Key** (Subscription Key)
   - This is your `MOMO_SUBSCRIPTION_KEY` for environment variables
   - You'll need separate keys for Collection and Disbursement products

#### Step 4: Create API User

1. Navigate to **"Users"** section
2. Click **"Create API User"**
3. Select the appropriate **Provider Callback Host** (your server's domain)
4. After creation, you'll receive:
   - **API User ID** → `MOMO_API_USER_ID`
   - **API Key** → `MOMO_API_KEY`

**Important**: Save these credentials securely - you'll only see the API Key once!

### Sandbox vs Production

The API supports both **Sandbox** (for testing) and **Production** environments.

#### Sandbox Configuration (Recommended for Testing)

**For Testing/Practice:**
```env
MOMO_BASE_URL="https://sandbox.momodeveloper.mtn.com"
MOMO_TARGET_ENVIRONMENT="sandbox"
```

**Benefits:**
- ✅ Free to use
- ✅ No real money involved
- ✅ Perfect for development and testing
- ✅ Test phone numbers provided

#### Production Configuration

**For Live Applications:**
```env
MOMO_BASE_URL="https://momodeveloper.mtn.com"
# or region-specific URL like:
# MOMO_BASE_URL="https://momodeveloper.mtn.com/v1_0"
MOMO_TARGET_ENVIRONMENT="mtncameroon"  # or your specific environment
```

**Requirements:**
- Requires production API credentials from MTN
- Real money transactions
- Business verification may be required

### Complete Environment Setup

Add these variables to your `.env` file:

```env
# MoMo API Configuration
MOMO_BASE_URL="https://sandbox.momodeveloper.mtn.com"
MOMO_TARGET_ENVIRONMENT="sandbox"

# Get these from MTN Developer Portal
MOMO_SUBSCRIPTION_KEY="your-subscription-key-here"
MOMO_API_USER_ID="your-api-user-id-here"
MOMO_API_KEY="your-api-key-here"

# Webhook URLs (see Callbacks section below)
MOMO_COLLECTION_CALLBACK_URL="https://your-domain.com/api/v1/webhooks/momo/collection"
MOMO_DISBURSEMENT_CALLBACK_URL="https://your-domain.com/api/v1/webhooks/momo/disbursement"
```

### Testing with Sandbox

#### Test Phone Numbers

MTN MoMo Sandbox provides test phone numbers for different scenarios:

**For Testing Collection (Donations):**
- `+237670000001` - Success scenario
- `+237670000002` - Success scenario
- `+237670000003` - Pending scenario
- `+237670000004` - Failed scenario

**For Testing Disbursement (Payouts):**
- Use the same phone numbers above
- Ensure the phone number matches the cause owner's phone

#### Testing Workflow

**1. Test Donation Flow:**

```bash
# Create a cause
curl -X POST http://localhost:3000/api/v1/causes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cause",
    "description": "Testing MoMo integration",
    "ownerPhone": "+237670000001"
  }'

# Make a donation (use test phone number)
curl -X POST http://localhost:3000/api/v1/donate \
  -H "Content-Type: application/json" \
  -d '{
    "causeId": "<cause-id-from-above>",
    "amount": "1000",
    "currency": "XAF",
    "donorPhone": "+237670000001",
    "payerMessage": "Test donation"
  }'

# Check donation status
curl http://localhost:3000/api/v1/donations/<donation-id>/status
```

**2. Test Payout Flow:**

```bash
# Create a payout (ensure cause has sufficient balance)
curl -X POST http://localhost:3000/api/v1/payout \
  -H "Content-Type: application/json" \
  -d '{
    "causeId": "<cause-id>",
    "amount": "500",
    "currency": "XAF"
  }'

# Check payout status
curl http://localhost:3000/api/v1/payouts/detail/<payout-id>/status
```

#### Understanding Payment Statuses

- **pending** - Payment request sent, waiting for user confirmation
- **success** (donations) / **completed** (payouts) - Payment successful
- **failed** - Payment failed or was cancelled

### Configuring Webhooks for Real-time Updates

Webhooks allow MoMo to notify your server when payment status changes.

#### For Local Development (Using ngrok)

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your API server:**
   ```bash
   npm run dev
   ```

3. **Create ngrok tunnel:**
   ```bash
   ngrok http 3000
   ```

4. **Update your `.env` with ngrok URL:**
   ```env
   MOMO_COLLECTION_CALLBACK_URL="https://your-ngrok-id.ngrok.io/api/v1/webhooks/momo/collection"
   MOMO_DISBURSEMENT_CALLBACK_URL="https://your-ngrok-id.ngrok.io/api/v1/webhooks/momo/disbursement"
   ```

5. **Configure in MTN Portal:**
   - Go to your API User settings
   - Set **Provider Callback Host** to your ngrok domain (without https://)
   - Example: `abc123.ngrok.io`

#### For Production

Use your actual domain:
```env
MOMO_COLLECTION_CALLBACK_URL="https://api.yourdomain.com/api/v1/webhooks/momo/collection"
MOMO_DISBURSEMENT_CALLBACK_URL="https://api.yourdomain.com/api/v1/webhooks/momo/disbursement"
```

**Important Notes:**
- Webhook URLs must be publicly accessible (HTTPS required in production)
- Webhook endpoints must return HTTP 200 status codes
- MoMo will retry failed webhook deliveries
- Webhooks automatically update donation/payout statuses in the database

### How the Integration Works

1. **Collection (Donations):**
   ```
   User → POST /donate → API creates donation → MoMo RequestToPay → 
   User receives MoMo prompt → User approves → MoMo webhook → 
   API updates donation status to "success"
   ```

2. **Disbursement (Payouts):**
   ```
   API → POST /payout → API creates payout → MoMo Transfer → 
   MoMo processes → MoMo webhook → API updates payout status to "completed"
   ```

### Troubleshooting

**Common Issues:**

1. **"Failed to authenticate with MoMo Collection API"**
   - Check `MOMO_API_USER_ID` and `MOMO_API_KEY`
   - Verify API User is created in the portal
   - Ensure Subscription Key matches the product

2. **"Invalid Subscription Key"**
   - Verify `MOMO_SUBSCRIPTION_KEY` is correct
   - Ensure you're using the key for the correct product (Collection vs Disbursement)
   - Check if product subscription is active

3. **Webhooks not received**
   - Verify webhook URL is publicly accessible
   - Check Provider Callback Host in MTN portal matches your domain
   - Ensure webhook endpoint returns HTTP 200
   - For local testing, ensure ngrok is running and URL is updated

4. **Payment stuck in "pending"**
   - In sandbox, some test numbers may simulate pending state
   - Check payment status manually: `GET /donations/:id/status`
   - Verify webhook URL is correctly configured

5. **Token expiration errors**
   - The API automatically refreshes tokens - this should be handled automatically
   - If issues persist, check API credentials

### API Reference Links

- [MTN MoMo Developer Portal](https://momodeveloper.mtn.com)
- [Collection API Documentation](https://momodeveloper.mtn.com/docs/services/collection/)
- [Disbursement API Documentation](https://momodeveloper.mtn.com/docs/services/disbursement/)
- [Sandbox Testing Guide](https://momodeveloper.mtn.com/docs/getting-started/)

### Best Practices

1. **Always test in Sandbox first** before going to production
2. **Monitor webhook logs** to ensure proper delivery
3. **Handle webhook failures gracefully** - implement retry logic
4. **Store transaction references** (momoRefId) for reconciliation
5. **Validate amounts and currencies** before processing
6. **Use HTTPS** for all webhook endpoints in production
7. **Implement idempotency** for webhook processing
8. **Log all MoMo API interactions** for debugging

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
| `JWT_SECRET` | No | Secret key for JWT tokens (default: insecure default, change in production) |
| `JWT_EXPIRES_IN` | No | JWT token expiration time (default: 7d) |
| `MOMO_BASE_URL` | Yes | MoMo API base URL |
| `MOMO_SUBSCRIPTION_KEY` | Yes | MoMo subscription key |
| `MOMO_API_USER_ID` | Yes | MoMo API user ID |
| `MOMO_API_KEY` | Yes | MoMo API key |
| `MOMO_TARGET_ENVIRONMENT` | No | MoMo target environment (default: sandbox) |
| `MOMO_COLLECTION_CALLBACK_URL` | No | Callback URL for collection notifications |
| `MOMO_DISBURSEMENT_CALLBACK_URL` | No | Callback URL for disbursement notifications |

## Authentication & Authorization

The API now supports JWT-based authentication:

1. **Register**: Create a new user account
2. **Login**: Get a JWT token
3. **Protected Routes**: Include token in `Authorization: Bearer <token>` header

Users can be assigned roles (`user` or `admin`). Currently, most endpoints are publicly accessible, but authentication can be added to specific routes as needed.

## Webhooks

Webhook endpoints are now available for MoMo callbacks:

- `/api/v1/webhooks/momo/collection` - Receives collection (RequestToPay) status updates
- `/api/v1/webhooks/momo/disbursement` - Receives disbursement (Transfer) status updates

Webhooks automatically update donation and payout statuses in real-time when MoMo sends notifications.

## Future Improvements

- [x] Add webhook endpoints for MoMo callbacks
- [x] Implement authentication/authorization (JWT)
- [ ] Add rate limiting
- [ ] Add request logging to file/external service
- [ ] Add unit and integration tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement retry logic for failed payments
- [ ] Add support for multiple payment providers
- [ ] Add role-based access control for cause management

## License

MIT

