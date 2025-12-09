# API Documentation

Complete API reference for the Donation API. Share this with your frontend team.

**Repository**: [https://github.com/Fadwahigga/donation-api](https://github.com/Fadwahigga/donation-api)

**Base URL**: `https://your-app.railway.app/api/v1`

All endpoints return JSON responses.

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Health Check

### GET `/health`

Check if the API is running.

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Donation API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Supported Currencies

### GET `/currencies`

Get the list of supported MTN Mobile Money currencies.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "currencies": [
      "XAF",
      "XOF",
      "UGX",
      "GHS",
      "ZAR",
      "NGN",
      "ZMW",
      "RWF",
      "TZS",
      "KES",
      "ETB",
      "MWK",
      "MZN",
      "USD",
      "EUR",
      "GBP"
    ],
    "description": "Supported MTN Mobile Money currencies"
  }
}
```

**Supported Currencies**:
- **XAF** - Central African CFA Franc (Cameroon, Chad, Central African Republic, etc.)
- **XOF** - West African CFA Franc (Côte d'Ivoire, Senegal, etc.)
- **UGX** - Ugandan Shilling
- **GHS** - Ghanaian Cedi
- **ZAR** - South African Rand
- **NGN** - Nigerian Naira
- **ZMW** - Zambian Kwacha
- **RWF** - Rwandan Franc
- **TZS** - Tanzanian Shilling
- **KES** - Kenyan Shilling
- **ETB** - Ethiopian Birr
- **MWK** - Malawian Kwacha
- **MZN** - Mozambican Metical
- **USD** - US Dollar (if supported in your region)
- **EUR** - Euro (if supported in your region)
- **GBP** - British Pound (if supported in your region)

**Important Notes**:
- **Sandbox Environment**: The MTN MoMo sandbox environment **ONLY supports EUR (Euro)** currency. Use `"EUR"` for all sandbox testing.
- **Production Environment**: In production, the currency must match the MTN MoMo service in your target country/region (e.g., XAF for Cameroon, UGX for Uganda, etc.).
- **Currency Mismatch Error**: If you receive "Currency not supported" error, ensure you're using the correct currency for your environment:
  - **Sandbox**: Always use `"EUR"`
  - **Production**: Use the currency code for your specific country (XAF, UGX, GHS, etc.)

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints are publicly accessible, but some may require authentication in the future.

### 1. Register User

**POST** `/auth/register`

Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+237670000001"
}
```

**Fields**:
- `email` (string, required): User email address
- `password` (string, required): Password (minimum 6 characters)
- `name` (string, optional): User's full name
- `phone` (string, optional): User's phone number

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "110e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+237670000001",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Error Response**: `422 Validation Error` (if email already exists)
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

---

### 2. Login

**POST** `/auth/login`

Login and get JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Fields**:
- `email` (string, required): User email address
- `password` (string, required): User password

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "110e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+237670000001",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Response**: `401 Unauthorized`
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### 3. Logout

**POST** `/auth/logout`

Logout the current user. This endpoint validates the token and logs the logout action.

**Note**: With JWT authentication, logout is primarily handled client-side by removing the token from storage. This endpoint serves as a confirmation that the logout was successful.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

**Error Response**: `401 Unauthorized`
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### 4. Get Current User

**GET** `/auth/me`

Get the currently authenticated user's profile.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "110e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+237670000001",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response**: `401 Unauthorized`
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## Causes

### 1. Create Cause

**POST** `/causes`

Create a new donation cause.

**Request Body**:
```json
{
  "name": "Help Build a School",
  "description": "Raising funds to build a school in rural area",
  "ownerPhone": "+237670000001"
}
```

**Fields**:
- `name` (string, required): Name of the cause
- `description` (string, optional): Description of the cause
- `ownerPhone` (string, required): Phone number of the cause owner/beneficiary

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Help Build a School",
    "description": "Raising funds to build a school in rural area",
    "ownerPhone": "+237670000001",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Cause created successfully"
}
```

---

### 2. Get All Causes

**GET** `/causes`

Get a list of all causes.

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Help Build a School",
      "description": "Raising funds to build a school",
      "ownerPhone": "+237670000001",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Medical Emergency Fund",
      "description": "Help cover medical expenses",
      "ownerPhone": "+237670000002",
      "createdAt": "2024-01-14T09:20:00.000Z",
      "updatedAt": "2024-01-14T09:20:00.000Z"
    }
  ]
}
```

---

### 3. Get Cause by ID

**GET** `/causes/:id`

Get a specific cause by its ID.

**URL Parameters**:
- `id` (UUID, required): Cause ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Help Build a School",
    "description": "Raising funds to build a school in rural area",
    "ownerPhone": "+237670000001",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response**: `404 Not Found`
```json
{
  "success": false,
  "error": "Cause not found"
}
```

---

### 4. Update Cause

**PUT** `/causes/:id`

Update an existing cause.

**URL Parameters**:
- `id` (UUID, required): Cause ID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Cause Name",
  "description": "Updated description",
  "ownerPhone": "+237670000002"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Cause Name",
    "description": "Updated description",
    "ownerPhone": "+237670000002",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  },
  "message": "Cause updated successfully"
}
```

---

### 5. Delete Cause

**DELETE** `/causes/:id`

Delete a cause (will also delete related donations and payouts).

**URL Parameters**:
- `id` (UUID, required): Cause ID

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Cause deleted successfully"
}
```

---

## Donations

### 1. Create Donation

**POST** `/donate`

Create a new donation and initiate MoMo payment request.

**Request Body**:
```json
{
  "causeId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": "1000",
  "currency": "XAF",
  "donorPhone": "+237670000002",
  "payerMessage": "Happy to help!"
}
```

**Fields**:
- `causeId` (UUID, required): ID of the cause to donate to
- `amount` (string or number, required): Donation amount
- `currency` (string, required): Currency code - **IMPORTANT**: 
  - **Sandbox**: Must use `"EUR"` (sandbox only supports EUR)
  - **Production**: Use country-specific currency (e.g., "XAF" for Cameroon, "UGX" for Uganda, "GHS" for Ghana)
- `donorPhone` (string, required): Donor's phone number (use test numbers in sandbox: `+237670000001`, `+237670000002`, etc.)
- `payerMessage` (string, optional): Message from the donor

**Supported Currencies (Production)**: XAF, XOF, UGX, GHS, ZAR, NGN, ZMW, RWF, TZS, KES, ETB, MWK, MZN, USD, EUR, GBP

**Sandbox Currency**: EUR only

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "donationId": "770e8400-e29b-41d4-a716-446655440003",
    "externalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "pending",
    "momoRefId": "12345678-1234-1234-1234-123456789012",
    "paymentInitiated": true,
    "amount": "1000",
    "currency": "XAF"
  },
  "message": "Donation created and payment request initiated. Waiting for donor confirmation."
}
```

**Note**: `paymentInitiated` indicates if the MoMo payment request was successfully sent. If `false`, check `paymentError` field.

**Error Response**: `404 Not Found` (if cause doesn't exist)
```json
{
  "success": false,
  "error": "Cause not found"
}
```

---

### 2. Get Donation by ID

**GET** `/donations/:id`

Get a specific donation by its ID.

**URL Parameters**:
- `id` (UUID, required): Donation ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "causeId": "550e8400-e29b-41d4-a716-446655440000",
    "donorPhone": "+237670000002",
    "amount": "1000.00",
    "currency": "XAF",
    "status": "success",
    "externalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "momoRefId": "12345678-1234-1234-1234-123456789012",
    "payerMessage": "Happy to help!",
    "payeeNote": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z",
    "cause": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Help Build a School",
      "description": "Raising funds to build a school",
      "ownerPhone": "+237670000001",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    }
  }
}
```

**Status values**: `"pending"`, `"success"`, `"failed"`

---

### 3. Check Donation Status

**GET** `/donations/:id/status`

Check and sync donation status from MoMo API.

**URL Parameters**:
- `id` (UUID, required): Donation ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "status": "success",
    "momoRefId": "12345678-1234-1234-1234-123456789012",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

### 4. Get Donations by Cause

**GET** `/causes/:causeId/donations`

Get all donations for a specific cause.

**URL Parameters**:
- `causeId` (UUID, required): Cause ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "cause": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Help Build a School"
    },
    "donations": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440003",
        "causeId": "550e8400-e29b-41d4-a716-446655440000",
        "donorPhone": "****0002",
        "amount": "1000",
        "currency": "XAF",
        "status": "success",
        "externalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "momoRefId": "12345678-1234-1234-1234-123456789012",
        "payerMessage": "Happy to help!",
        "payeeNote": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440004",
        "causeId": "550e8400-e29b-41d4-a716-446655440000",
        "donorPhone": "****0003",
        "amount": "500",
        "currency": "XAF",
        "status": "pending",
        "externalId": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
        "momoRefId": null,
        "payerMessage": null,
        "payeeNote": null,
        "createdAt": "2024-01-15T11:00:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "count": 2
  }
}
```

**Note**: Donor phone numbers are masked for privacy (only last 4 digits shown).

---

### 5. Get Donations by Donor

**GET** `/donor/:phone/donations`

Get all donations made by a specific donor (phone number).

**URL Parameters**:
- `phone` (string, required): Donor's phone number

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "donorPhone": "+237670000002",
    "donations": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440003",
        "causeId": "550e8400-e29b-41d4-a716-446655440000",
        "donorPhone": "+237670000002",
        "amount": "1000",
        "currency": "XAF",
        "status": "success",
        "externalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "momoRefId": "12345678-1234-1234-1234-123456789012",
        "payerMessage": "Happy to help!",
        "payeeNote": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z",
        "cause": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Help Build a School",
          "description": "Raising funds to build a school",
          "ownerPhone": "+237670000001",
          "createdAt": "2024-01-15T09:00:00.000Z",
          "updatedAt": "2024-01-15T09:00:00.000Z"
        }
      }
    ],
    "count": 1
  }
}
```

---

## Payouts

### 1. Create Payout

**POST** `/payout`

Create a payout and initiate MoMo transfer to cause owner.

**Request Body**:
```json
{
  "causeId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": "500",
  "currency": "XAF"
}
```

**Fields**:
- `causeId` (UUID, required): ID of the cause
- `amount` (string or number, required): Payout amount
- `currency` (string, required): Currency code - **IMPORTANT**:
  - **Sandbox**: Must use `"EUR"` (sandbox only supports EUR)
  - **Production**: Must match the currency of donations for this cause (e.g., "XAF" for Cameroon causes)

**Supported Currencies (Production)**: XAF, XOF, UGX, GHS, ZAR, NGN, ZMW, RWF, TZS, KES, ETB, MWK, MZN, USD, EUR, GBP

**Sandbox Currency**: EUR only

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "payoutId": "990e8400-e29b-41d4-a716-446655440005",
    "externalId": "c3d4e5f6-g7h8-9012-cdef-123456789012",
    "status": "pending",
    "momoRefId": "23456789-2345-2345-2345-234567890123",
    "transferInitiated": true,
    "amount": "500",
    "currency": "XAF",
    "availableBalanceAfter": 500
  },
  "message": "Payout created and transfer initiated."
}
```

**Error Response**: `400 Bad Request` (insufficient balance)
```json
{
  "success": false,
  "error": "Insufficient balance. Available: 300 XAF"
}
```

---

### 2. Get Payouts by Cause

**GET** `/payouts/:causeId`

Get all payouts for a specific cause.

**URL Parameters**:
- `causeId` (UUID, required): Cause ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "cause": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Help Build a School"
    },
    "payouts": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440005",
        "causeId": "550e8400-e29b-41d4-a716-446655440000",
        "amount": "500",
        "currency": "XAF",
        "status": "completed",
        "externalId": "c3d4e5f6-g7h8-9012-cdef-123456789012",
        "momoRefId": "23456789-2345-2345-2345-234567890123",
        "createdAt": "2024-01-15T12:00:00.000Z",
        "updatedAt": "2024-01-15T12:05:00.000Z"
      }
    ],
    "count": 1
  }
}
```

**Status values**: `"pending"`, `"completed"`, `"failed"`

---

### 3. Get Payout Summary

**GET** `/payouts/:causeId/summary`

Get financial summary for a cause (total donations, payouts, available balance).

**URL Parameters**:
- `causeId` (UUID, required): Cause ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "cause": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Help Build a School",
      "ownerPhone": "+237670000001"
    },
    "totalDonations": 1000,
    "totalPayouts": 500,
    "availableBalance": 500,
    "currency": "XAF"
  }
}
```

---

### 4. Get Payout by ID

**GET** `/payouts/detail/:id`

Get a specific payout by its ID.

**URL Parameters**:
- `id` (UUID, required): Payout ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440005",
    "causeId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": "500",
    "currency": "XAF",
    "status": "completed",
    "externalId": "c3d4e5f6-g7h8-9012-cdef-123456789012",
    "momoRefId": "23456789-2345-2345-2345-234567890123",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:05:00.000Z",
    "cause": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Help Build a School",
      "description": "Raising funds to build a school",
      "ownerPhone": "+237670000001",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    }
  }
}
```

---

### 5. Check Payout Status

**GET** `/payouts/detail/:id/status`

Check and sync payout status from MoMo API.

**URL Parameters**:
- `id` (UUID, required): Payout ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440005",
    "status": "completed",
    "momoRefId": "23456789-2345-2345-2345-234567890123",
    "updatedAt": "2024-01-15T12:05:00.000Z"
  }
}
```

---

## Webhooks

Webhook endpoints are called by MTN MoMo API servers to notify your application about payment status changes. These endpoints are **publicly accessible** and do not require authentication.

### 1. Collection Webhook

**POST** `/webhooks/momo/collection`

Receives notifications for donation (Request to Pay) status updates.

**Request Body** (from MoMo):
```json
{
  "referenceId": "12345678-1234-1234-1234-123456789012",
  "status": "SUCCESSFUL",
  "amount": "1000",
  "currency": "XAF",
  "financialTransactionId": "123456789",
  "externalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Status values from MoMo**:
- `SUCCESSFUL` - Payment completed successfully
- `FAILED` - Payment failed or was cancelled
- `PENDING` - Payment is still pending

**Note**: The webhook automatically updates the donation status in the database. No manual action required.

---

### 2. Disbursement Webhook

**POST** `/webhooks/momo/disbursement`

Receives notifications for payout (Transfer) status updates.

**Request Body** (from MoMo):
```json
{
  "referenceId": "23456789-2345-2345-2345-234567890123",
  "status": "SUCCESSFUL",
  "amount": "500",
  "currency": "XAF",
  "financialTransactionId": "234567890",
  "externalId": "c3d4e5f6-g7h8-9012-cdef-123456789012"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Status values from MoMo**:
- `SUCCESSFUL` - Transfer completed successfully
- `FAILED` - Transfer failed
- `PENDING` - Transfer is still pending

**Note**: The webhook automatically updates the payout status in the database. No manual action required.

---

## MoMo API Integration

This API integrates with **MTN Mobile Money (MoMo) APIs** for processing payments.

### Overview

- **Collection API**: Used for receiving donations (Request to Pay)
- **Disbursement API**: Used for paying out to cause owners (Transfer)
- **Webhooks**: Real-time payment status notifications

### Payment Flow

#### Donation Flow:
1. User creates donation → API calls MoMo Request to Pay
2. MoMo sends payment prompt to donor's phone
3. Donor approves payment on their phone
4. MoMo sends webhook to `/webhooks/momo/collection`
5. API updates donation status to `success`

#### Payout Flow:
1. API creates payout → Calls MoMo Transfer
2. MoMo processes transfer to cause owner
3. MoMo sends webhook to `/webhooks/momo/disbursement`
4. API updates payout status to `completed`

### Status Mapping

| MoMo Status | Donation Status | Payout Status |
|------------|-----------------|---------------|
| `SUCCESSFUL` | `success` | `completed` |
| `FAILED` | `failed` | `failed` |
| `PENDING` | `pending` | `pending` |

### Testing with Sandbox

MTN provides a sandbox environment for testing. Use these test phone numbers:

**Test Phone Numbers**:
- `+237670000001` - Success scenario
- `+237670000002` - Success scenario  
- `+237670000003` - Pending scenario
- `+237670000004` - Failed scenario

**⚠️ CRITICAL: Sandbox Currency Limitation**
- The MTN MoMo **sandbox environment ONLY supports EUR (Euro)** currency
- **Always use `"EUR"` for all sandbox testing**, regardless of your production target country
- Using any other currency (XAF, UGX, etc.) in sandbox will result in "Currency not supported" error
- In production, you can use country-specific currencies (XAF for Cameroon, UGX for Uganda, etc.)

**Example Sandbox Donation Request**:
```json
{
  "causeId": "872f5d8f-03b7-4b3e-9486-19ac9f87e197",
  "amount": "500",
  "currency": "EUR",  // ← Must be EUR in sandbox!
  "donorPhone": "+237670000001",
  "payerMessage": "Test donation"
}
```

### Webhook Configuration

Webhooks require publicly accessible HTTPS URLs. For local development:

1. Use **ngrok** to create a tunnel:
   ```bash
   ngrok http 3000
   ```

2. Update `.env` with ngrok URL:
   ```env
   MOMO_COLLECTION_CALLBACK_URL="https://your-id.ngrok.io/api/v1/webhooks/momo/collection"
   MOMO_DISBURSEMENT_CALLBACK_URL="https://your-id.ngrok.io/api/v1/webhooks/momo/disbursement"
   ```

3. Configure in MTN Developer Portal:
   - Set **Provider Callback Host** to your ngrok domain

### Getting MoMo Credentials

1. Sign up at [MTN MoMo Developer Portal](https://momodeveloper.mtn.com)
2. Subscribe to **Collection** and **Disbursement** products
3. Get your **Subscription Key** from the portal
4. Create an **API User** and get:
   - API User ID
   - API Key

Add these to your `.env`:
```env
MOMO_BASE_URL="https://sandbox.momodeveloper.mtn.com"
MOMO_TARGET_ENVIRONMENT="sandbox"
MOMO_SUBSCRIPTION_KEY="your-subscription-key"
MOMO_API_USER_ID="your-api-user-id"
MOMO_API_KEY="your-api-key"
```

### Important Notes

- **Sandbox**: Free to use, no real money, perfect for testing
- **Production**: Requires production credentials, real transactions
- **Webhooks**: Must return HTTP 200 to acknowledge receipt
- **Status Polling**: You can still manually check status using `/donations/:id/status` or `/payouts/detail/:id/status`
- **Real-time Updates**: Webhooks provide real-time status updates, but polling is available as fallback

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error, invalid data) |
| `401` | Unauthorized (missing or invalid authentication token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found (resource doesn't exist) |
| `422` | Unprocessable Entity (validation failed) |
| `500` | Internal Server Error |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Messages

- `"Cause not found"` - Cause ID doesn't exist
- `"Donation not found"` - Donation ID doesn't exist
- `"Payout not found"` - Payout ID doesn't exist
- `"Insufficient balance. Available: X CURRENCY"` - Not enough funds for payout
- `"Validation failed"` - Request body validation error
- `"Unauthorized"` - Missing or invalid authentication token
- `"Invalid email or password"` - Login credentials are incorrect
- `"User with this email already exists"` - Email is already registered
- `"No token provided"` - Authorization header is missing
- `"Invalid or expired token"` - JWT token is invalid or expired

---

## Example Frontend Usage

### Register and Login
```javascript
// Register a new user
const registerResponse = await fetch('https://your-app.railway.app/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    phone: '+237670000001'
  })
});

const registerResult = await registerResponse.json();
if (registerResult.success) {
  // Save token to localStorage or state
  localStorage.setItem('token', registerResult.data.token);
}

// Login
const loginResponse = await fetch('https://your-app.railway.app/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const loginResult = await loginResponse.json();
if (loginResult.success) {
  localStorage.setItem('token', loginResult.data.token);
}
```

### Logout
```javascript
// Logout user
const token = localStorage.getItem('token');
const logoutResponse = await fetch('https://your-app.railway.app/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const logoutResult = await logoutResponse.json();
if (logoutResult.success) {
  // Remove token from client storage
  localStorage.removeItem('token');
  // Redirect to login page or update UI
  console.log('Logged out successfully');
}
```

### Making Authenticated Requests
```javascript
// Get current user profile
const token = localStorage.getItem('token');
const response = await fetch('https://your-app.railway.app/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
console.log('Current user:', data);
```

### Fetch All Causes
```javascript
const response = await fetch('https://your-app.railway.app/api/v1/causes');
const { data } = await response.json();
console.log(data); // Array of causes
```

### Create a Donation
```javascript
const response = await fetch('https://your-app.railway.app/api/v1/donate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
    body: JSON.stringify({
      causeId: '550e8400-e29b-41d4-a716-446655440000',
      amount: '1000',
      currency: 'EUR',  // Use EUR for sandbox, XAF for production (Cameroon)
      donorPhone: '+237670000002',
      payerMessage: 'Happy to help!'
    })
});

const result = await response.json();
if (result.success) {
  console.log('Donation created:', result.data);
  // Poll status endpoint until status is 'success' or 'failed'
  // Or wait for webhook notification
}
```

### Poll Donation Status
```javascript
async function pollDonationStatus(donationId) {
  const checkStatus = async () => {
    const response = await fetch(
      `https://your-app.railway.app/api/v1/donations/${donationId}/status`
    );
    const { data } = await response.json();
    
    if (data.status === 'pending') {
      // Check again after 3 seconds
      setTimeout(checkStatus, 3000);
    } else {
      console.log('Donation status:', data.status);
    }
  };
  
  checkStatus();
}
```

### Handle MoMo Payment Flow
```javascript
// Create donation and handle MoMo payment
async function createDonation(causeId, amount, donorPhone) {
  const response = await fetch('https://your-app.railway.app/api/v1/donate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      causeId,
      amount,
      currency: 'EUR',  // Use EUR for sandbox, XAF for production (Cameroon)
      donorPhone,
      payerMessage: 'Supporting a good cause'
    })
  });

  const result = await response.json();
  
  if (result.success && result.data.paymentInitiated) {
    // Payment request sent to donor's phone
    // Donor will receive MoMo prompt to approve payment
    // Status will be updated via webhook, but you can poll:
    return pollDonationStatus(result.data.donationId);
  } else {
    console.error('Payment failed:', result.error);
  }
}
```

---

## Notes for Frontend Developers

1. **Base URL**: Replace `https://your-app.railway.app` with your actual deployment URL

2. **Authentication**: 
   - Register/login to get JWT token
   - Include token in `Authorization: Bearer <token>` header for protected endpoints
   - Store token securely (localStorage, sessionStorage, or secure cookie)
   - Token expiration is configurable (default: 7 days)

3. **CORS**: Make sure your frontend domain is added to `ALLOWED_ORIGINS` environment variable

4. **Phone Numbers**: Use E.164 format (e.g., `+237670000001`)

5. **Amounts**: Can be sent as string or number, but amounts in responses are strings

6. **MoMo Payment Flow**:
   - When creating donation, MoMo sends payment prompt to donor's phone
   - Donor approves/rejects on their phone
   - Status updates automatically via webhooks
   - You can poll status endpoints as fallback

7. **Status Polling**: Donations/payouts with `pending` status can be polled using status endpoints, but webhooks are preferred for real-time updates

8. **UUIDs**: All IDs are UUIDs (v4 format)

9. **Timestamps**: All dates are in ISO 8601 format (UTC)

10. **Error Handling**: Always check the `success` field before accessing `data`

11. **MoMo Testing**: 
    - Use sandbox environment for testing
    - Test phone numbers: `+237670000001` through `+237670000004`
    - **IMPORTANT**: Sandbox ONLY supports `"EUR"` currency - use EUR for all sandbox tests
    - No real money involved in sandbox

12. **Webhooks**: 
    - Webhooks provide real-time status updates
    - No frontend action needed for webhook processing
    - Status polling is available as fallback

