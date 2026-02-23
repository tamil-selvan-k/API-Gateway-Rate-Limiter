import app from './app';
import { config } from '@config/index';
import { logger } from '@middleware/logger';
import { prisma } from '@utils/prisma';
import { initializeRedis, redisClient } from '@middleware/rateLimiter';

const startServer = async () => {
    try {
        // Test DB connection
        await prisma.$connect();
        logger.info('Database connection established');

        // Attempt Redis connection (non-fatal). App can run without distributed rate limiting.
        const redisConnected = await initializeRedis();
        if (redisConnected) {
            logger.info('Redis connection established');
        } else {
            logger.warn('Redis connection failed. Running with degraded rate limiting.');
        }

        const server = app.listen(config.port, () => {
            logger.info(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
        });

        // Graceful Shutdown
        const shutdown = async () => {
            logger.info('Shutting down server...');
            server.close(async () => {
                await prisma.$disconnect();
                if (redisClient.isOpen) {
                    await redisClient.quit();
                }
                logger.info('Closed DB and Redis connections');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
