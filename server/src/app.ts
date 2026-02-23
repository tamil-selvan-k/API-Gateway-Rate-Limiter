import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from '@middleware/logger';
import { errorHandler } from '@middleware/errorHandler';
import { rateLimiter } from '@middleware/rateLimiter';
import { requestContext } from '@middleware/requestContext';
import { healthRoutes } from '@modules/health/health.routes';
import { metricsRoutes } from '@modules/health/metrics.routes';
import { readyRoutes } from '@modules/health/ready.routes';
import { accountRoutes } from '@modules/account/account.routes';
import { apiKeyRoutes } from '@modules/apiKey/apiKey.routes';
import { apiRoutes } from '@modules/api/api.routes';
import { subscriptionRoutes } from '@modules/subscription/subscription.routes';
import { rateLimiterRoutes } from '@modules/rateLimiter/rateLimiter.routes';
import { gatewayMiddleware } from '@middleware/gateway';
import { proxyHandler } from '@middleware/proxy';
import { ApiResponse } from '@utils/ApiResponse';
import { validateSubscription } from '@middleware/validateSubscription';
import { gatewayRateLimiter } from '@middleware/gatewayRateLimiter';


const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use(requestContext);
app.use(requestLogger);

// Global Rate Limiting (General Protection)
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP per window
    keyPrefix: 'rl:global'
}));

// Health Check
app.use('/health', healthRoutes);
app.use('/ready', readyRoutes);
app.use('/internal/metrics', metricsRoutes);

app.get('/api/v1/test', (req, res) => {
    return new ApiResponse(200, {message: 'API is working'})
});

// Routes

app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/api-keys', apiKeyRoutes);
app.use('/api/v1/apis', apiRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/rate-limiter', rateLimiterRoutes);

// GATEWAY ROUTES (Express 5 / path-to-regexp v8 compatible wildcard syntax)
app.all('/:gatewayId', gatewayMiddleware, validateSubscription(), gatewayRateLimiter, proxyHandler);
app.all('/:gatewayId/*path', gatewayMiddleware, validateSubscription(), gatewayRateLimiter, proxyHandler);



// Error Handling
app.use(errorHandler);

export default app;
