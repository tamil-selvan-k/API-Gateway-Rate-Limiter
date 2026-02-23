import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import { AppError } from '@utils/AppError';
import { config } from '@config/index';
import { logger } from './logger';

const redisClient = createClient({
    url: config.redis.url,
    socket: {
        // Avoid endless reconnect loops and repeated ECONNREFUSED spam in local/dev.
        reconnectStrategy: (retries) => {
            if (retries >= 1) {
                return false;
            }
            return 250;
        },
    },
});

let isRedisAvailable = false;
let hasLoggedRedisError = false;

redisClient.on('error', (err) => {
    isRedisAvailable = false;
    if (!hasLoggedRedisError) {
        logger.warn('Redis unavailable; rate limiting is running in fail-open mode');
        logger.debug('Redis Client Error', err);
        hasLoggedRedisError = true;
    }
});

redisClient.on('ready', () => {
    isRedisAvailable = true;
    hasLoggedRedisError = false;
});

// Connection is handled in server.ts startup logic


interface RateLimitOptions {
    windowMs: number;
    max: number;
    keyPrefix?: string;
}

/**
 * Token Bucket Rate Limiter
 * Implementation using Redis Lua scripts for atomicity.
 */
export const rateLimiter = (options: RateLimitOptions) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!isRedisAvailable || !redisClient.isOpen) {
            // Fail open when Redis is unavailable so API traffic is not blocked.
            return next();
        }

        const key = `${options.keyPrefix || 'rl'}:${req.ip}`;
        const { windowMs, max } = options;
        const now = Date.now();
        const windowSeconds = windowMs / 1000;
        const refillRate = max / windowSeconds;

        try {
            // Lua script for atomic token bucket update
            // KEYS[1] = bucket key
            // ARGV[1] = now (ms)
            // ARGV[2] = refill rate (tokens per ms)
            // ARGV[3] = max tokens (capacity)
            // ARGV[4] = cost (1)
            const script = `
        local bucket = redis.call('HMGET', KEYS[1], 'tokens', 'lastRefill')
        local tokens = tonumber(bucket[1]) or tonumber(ARGV[3])
        local lastRefill = tonumber(bucket[2]) or tonumber(ARGV[1])
        
        local elapsed = math.max(0, tonumber(ARGV[1]) - lastRefill)
        local tokensToAdd = elapsed * tonumber(ARGV[2])
        tokens = math.min(tonumber(ARGV[3]), tokens + tokensToAdd)
        
        if tokens >= tonumber(ARGV[4]) then
          tokens = tokens - tonumber(ARGV[4])
          redis.call('HMSET', KEYS[1], 'tokens', tokens, 'lastRefill', ARGV[1])
          redis.call('EXPIRE', KEYS[1], math.ceil(tonumber(ARGV[3]) / tonumber(ARGV[2]) / 1000) * 2)
          return {1, tokens}
        else
          return {0, tokens}
        end
      `;

            const result = await redisClient.eval(script, {
                keys: [key],
                arguments: [
                    now.toString(),
                    (refillRate / 1000).toString(),
                    max.toString(),
                    '1'
                ]
            }) as [number, number];

            const [allowed, remainingTokens] = result;

            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', Math.floor(remainingTokens));

            if (allowed === 1) {
                next();
            } else {
                next(new AppError('Too Many Requests', 429));
            }
        } catch (error) {
            logger.warn('Rate limiter degraded: Redis unavailable, allowing request');
            isRedisAvailable = false;
            // Fail open in case of Redis issues, or fail closed based on security policy
            next();
        }
    };
};

const initializeRedis = async (): Promise<boolean> => {
    if (redisClient.isOpen) {
        isRedisAvailable = true;
        return true;
    }

    try {
        await redisClient.connect();
        isRedisAvailable = true;
        hasLoggedRedisError = false;
        return true;
    } catch (error) {
        isRedisAvailable = false;
        if (!hasLoggedRedisError) {
            logger.warn('Redis unavailable. Continuing without rate limiting.');
            logger.debug('Redis connect error details', error);
            hasLoggedRedisError = true;
        }
        return false;
    }
};

export { redisClient, initializeRedis };
