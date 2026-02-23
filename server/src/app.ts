import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from '@middleware/logger';
import { errorHandler } from '@middleware/errorHandler';
import { rateLimiter } from '@middleware/rateLimiter';
import { healthRoutes } from '@modules/health/health.routes';
import { accountRoutes } from '@modules/account/account.routes';
import { apiKeyRoutes } from '@modules/apiKey/apiKey.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use(requestLogger);

// Global Rate Limiting (General Protection)
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP per window
    keyPrefix: 'rl:global'
}));

// Health Check
app.use('/health', healthRoutes);

app.get('/api/v1/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Routes

app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/api-keys', apiKeyRoutes);


// Error Handling
app.use(errorHandler);

export default app;
