# Enterprise API Gateway Rate Limiter

A production-ready Rate Limiting system built with TypeScript, Node.js, Express, Prisma, Redis, and React.

## 🏛️ Architecture

### Backend (Modular Layered Architecture)
The backend follows a feature-based modular structure with clear separation of concerns:
- **Repository Layer**: Pure data access using Prisma.
- **Service Layer**: Business logic, key generation, and validation.
- **Controller Layer**: Request handling and response formatting.
- **Middleware**:
    - **Redis Rate Limiter**: Implements a **Token Bucket** algorithm using Lua scripts for atomic operations and high performance.
    - **Centralized Error Handling**: Standardized error responses across the entire API.
    - **Request Logger**: Structured logging with Winston and Morgan.

### Frontend (Feature-based React)
- **Modular Structure**: Features like `apiKeys` and `analytics` are encapsulated in their own modules.
- **Premium UI**: Dark-themed, enterprise-grade design with Lucide icons and responsive layouts.
- **API Abstraction**: Centralized Axios instance with request/response interceptors.

## 🚀 Scalability Decisions

### 1. Redis Lua Scripting
By using Lua scripts for the rate limiter, we ensure that the "check-and-decrement" operation is atomic and happens entirely within Redis. This prevents race conditions in a distributed environment and minimizes network round-trips.

### 2. Dependency Injection
The `apiKey` module uses manual dependency injection, making it easy to swap out the repository with an In-memory or Mock implementation during testing.

### 3. Connection Pooling
Prisma and Redis clients are configured as singletons, ready for connection pooling in high-traffic production environments.

### 4. Path Aliases
Using TypeScript path aliases (`@modules/*`, `@utils/*`) improves maintainability and avoids the "relative path hell" (`../../../`).

## 🛠️ Setup & Running

### Backend
1. `cd backend`
2. `npm install`
3. Configure `.env` with your PostgreSQL and Redis URLs.
4. `npx prisma generate`
5. `npm run dev`

### Frontend
1. `cd Frontend`
2. `npm install`
3. `npm run dev`

## 📈 Future Scaling Improvements
- **Rate Limit Tiers**: Implement dynamic limits based on the `Plan` associated with an API Key.
- **Database Indexing**: Further optimization of `UsageLog` indexing for massive scale.
- **Horizontal Scaling**: The stateless design allows for easy scaling horizontally by deploying multiple instances behind a load balancer.
