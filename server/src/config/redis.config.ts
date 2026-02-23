import { createClient } from 'redis';
import { config } from '@config/index';
import { logger } from '@middleware/logger';

const redisClient = createClient({
    url: config.redis.url
});

redisClient.on('error', (err) => logger.error('Redis Client Error', { err }));

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

export { redisClient, connectRedis };
