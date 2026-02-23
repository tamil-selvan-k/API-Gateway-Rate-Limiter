import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError';
import { redisClient, connectRedis } from '@config/redis.config';
import { logger } from '@middleware/logger';

export const gatewayRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await connectRedis();
        if (!redisClient.isOpen) {
            return next();
        }

        const context = req.gatewayContext;
        if (!context || !context.plan) {
            throw new AppError('Rate limit context missing', 500);
        }

        const { api, apiKey, plan } = context;
        const burstLimit = api.rateLimitBurst ?? plan.burstLimit;
        const refillRate = api.rateLimitRps ?? plan.requestsPerSecond; // tokens per second

        const redisKey = `ratelimit:${api.id}:${apiKey.id}`;
        const now = Date.now();

        const data = await redisClient.hGetAll(redisKey);
        let tokens = parseFloat(data.tokens || burstLimit.toString());
        let lastRefill = parseInt(data.lastRefill || now.toString(), 10);

        const elapsedTime = (now - lastRefill) / 1000;
        tokens = Math.min(burstLimit, tokens + elapsedTime * refillRate);

        const resetSeconds = Math.max(0, Math.ceil((burstLimit - tokens) / refillRate));
        res.setHeader('X-RateLimit-Limit', burstLimit.toString());
        res.setHeader('X-RateLimit-Remaining', Math.floor(tokens).toString());
        res.setHeader('X-RateLimit-Reset', Math.floor((now + resetSeconds * 1000) / 1000).toString());

        if (tokens < 1) {
            res.setHeader('Retry-After', Math.ceil((1 - tokens) / refillRate).toString());
            throw new AppError('Rate limit exceeded', 429);
        }

        tokens -= 1;
        await redisClient.hSet(redisKey, {
            tokens: tokens.toString(),
            lastRefill: now.toString()
        });

        res.setHeader('X-RateLimit-Remaining', Math.floor(tokens).toString());
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        logger.warn('Gateway rate limiter degraded', { error });
        next();
    }
};
