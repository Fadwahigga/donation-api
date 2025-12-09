# Backend Tech Stack

Complete overview of all technologies, frameworks, libraries, and tools used in this backend API.

**Repository**: [https://github.com/Fadwahigga/donation-api](https://github.com/Fadwahigga/donation-api)

## 🚀 Core Technologies

### Runtime & Language
- **Node.js** - JavaScript runtime environment
- **TypeScript** v5.3.3 - Typed superset of JavaScript
- **ES2020** - ECMAScript 2020 target version

### Framework
- **Express.js** v4.18.2 - Web application framework for Node.js
  - Handles HTTP requests and routing
  - Middleware support
  - RESTful API architecture

## 🗄️ Database & ORM

### Database
- **MySQL** - Relational database management system
  - Used via Railway's MySQL service
  - Supports transactions and ACID compliance

### ORM
- **Prisma** v5.7.0
  - Type-safe database client
  - Schema management and migrations
  - Query builder with TypeScript support
  - `@prisma/client` v5.7.0 - Prisma Client library

## 🔐 Authentication & Security

- **JWT (JSON Web Tokens)** - `jsonwebtoken` v9.0.3
  - Token-based authentication
  - Token generation and verification
  - Stateless authentication

- **bcryptjs** v3.0.3
  - Password hashing and verification
  - Secure password storage
  - Salt rounds: 10

## 🌐 HTTP & API

- **axios** v1.6.2
  - HTTP client for external API calls
  - Used for MoMo API integration
  - Promise-based requests

- **cors** v2.8.5
  - Cross-Origin Resource Sharing middleware
  - Configurable allowed origins
  - Production and development CORS handling

## 🔧 Utilities

- **uuid** v9.0.1
  - Generate unique identifiers
  - Used for donation/payout external IDs

- **dotenv** v16.3.1
  - Environment variable management
  - Loads `.env` files in development

## 🛠️ Development Tools

### TypeScript Support
- **TypeScript** v5.3.3 - Type checking and compilation
- **@types/node** v20.10.4 - Node.js type definitions
- **@types/express** v4.17.21 - Express.js type definitions
- **@types/bcryptjs** v2.4.6 - bcryptjs type definitions
- **@types/jsonwebtoken** v9.0.10 - JWT type definitions
- **@types/cors** v2.8.17 - CORS type definitions
- **@types/uuid** v9.0.7 - UUID type definitions

### Development Server
- **ts-node-dev** v2.0.0
  - Development server with hot reload
  - TypeScript execution without compilation
  - Auto-restart on file changes

## 📦 Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Prisma client setup
│   └── env.ts        # Environment variables
├── controllers/      # Request handlers
│   ├── authController.ts
│   ├── causeController.ts
│   ├── donationController.ts
│   ├── payoutController.ts
│   └── webhookController.ts
├── middleware/       # Express middleware
│   ├── auth.ts       # JWT authentication
│   ├── errorHandler.ts
│   └── validators.ts
├── routes/           # API routes
│   ├── authRoutes.ts
│   ├── causeRoutes.ts
│   ├── donationRoutes.ts
│   ├── payoutRoutes.ts
│   └── webhookRoutes.ts
├── services/         # Business logic
│   ├── authService.ts
│   ├── causeService.ts
│   ├── donationService.ts
│   ├── momoService.ts
│   └── payoutService.ts
├── types/            # TypeScript interfaces
│   └── index.ts
├── utils/            # Utility functions
│   └── logger.ts
└── index.ts          # Application entry point
```

## 🔌 External Integrations

### Payment Gateway
- **MTN Mobile Money (MoMo) API**
  - Collection API (Request to Pay)
  - Disbursement API (Transfer)
  - Webhook callbacks for payment status
  - Sandbox and Production environments

## 🗂️ Database Models

1. **User** - User accounts and authentication
2. **Cause** - Donation causes/creators
3. **Donation** - Donation transactions
4. **Payout** - Fund disbursements to cause owners

## 🚢 Deployment

### Platform
- **Railway.app** - Cloud hosting platform
  - Automatic deployments from GitHub
  - MySQL database service
  - Environment variable management
  - HTTPS/SSL certificates

### Build Process
- TypeScript compilation (`tsc`)
- Prisma Client generation
- Node.js production server

## 📝 API Features

### Authentication
- User registration
- User login
- User logout
- JWT token-based authentication
- Protected routes with middleware

### Core Features
- CRUD operations for causes
- Donation management
- Payout processing
- Payment status tracking
- Webhook handling for MoMo callbacks

### API Architecture
- RESTful API design
- JSON request/response format
- Standardized error handling
- Input validation
- CORS support

## 🔍 Key Features

- ✅ Type-safe with TypeScript
- ✅ Structured error handling
- ✅ Input validation middleware
- ✅ Authentication & authorization
- ✅ Database migrations
- ✅ Payment gateway integration
- ✅ Webhook support
- ✅ Logging system
- ✅ Environment-based configuration

## 📊 TypeScript Configuration

- **Target**: ES2020
- **Module**: CommonJS
- **Strict mode**: Enabled
- **Source maps**: Enabled
- **Declaration files**: Generated

## 🔄 Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production (Prisma + TypeScript)
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create migration (development)
- `npm run prisma:migrate:prod` - Deploy migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🌍 Environment Variables

Required environment variables:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `MOMO_BASE_URL` - MoMo API base URL
- `MOMO_SUBSCRIPTION_KEY` - MoMo subscription key
- `MOMO_API_USER_ID` - MoMo API user ID
- `MOMO_API_KEY` - MoMo API key
- `MOMO_TARGET_ENVIRONMENT` - MoMo environment (sandbox/production)
- `MOMO_COLLECTION_CALLBACK_URL` - Webhook URL for collections
- `MOMO_DISBURSEMENT_CALLBACK_URL` - Webhook URL for disbursements
- `ALLOWED_ORIGINS` - CORS allowed origins (optional)

## 📚 Dependencies Summary

### Production Dependencies (9 packages)
- @prisma/client, axios, bcryptjs, cors, dotenv, express, jsonwebtoken, uuid

### Development Dependencies (8 packages)
- TypeScript, Prisma CLI, ts-node-dev, and type definitions

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- CORS protection
- Error handling that doesn't leak sensitive info
- Environment variable management

## 📡 API Endpoints

- **Authentication**: `/api/v1/auth/*`
- **Causes**: `/api/v1/causes/*`
- **Donations**: `/api/v1/donate`, `/api/v1/donations/*`
- **Payouts**: `/api/v1/payout`, `/api/v1/payouts/*`
- **Webhooks**: `/api/v1/webhooks/momo/*`
- **Health Check**: `/api/v1/health`

