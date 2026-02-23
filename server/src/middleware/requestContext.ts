import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '@middleware/logger';
import { recordRequest } from '@utils/metrics';

declare global {
    namespace Express {
        interface Request {
            correlationId?: string;
        }
    }
}

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
    const headerValue = req.headers['x-correlation-id'];
    const correlationId = Array.isArray(headerValue)
        ? headerValue[0]
        : headerValue || crypto.randomUUID();

    req.correlationId = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    const startTime = Date.now();

    logger.info('request.start', {
        correlationId,
        method: req.method,
        path: req.path,
    });

    res.on('finish', () => {
        const latencyMs = Date.now() - startTime;
        const statusCode = res.statusCode;

        recordRequest(statusCode, latencyMs);

        const accountId =
            (req as { user?: { id?: string } }).user?.id ||
            req.gatewayContext?.api.accountId;
        const apiId = req.gatewayContext?.api.id || req.params.apiId;

        logger.info('request.end', {
            correlationId,
            method: req.method,
            path: req.path,
            statusCode,
            latencyMs,
            accountId,
            apiId,
        });
    });

    next();
};
