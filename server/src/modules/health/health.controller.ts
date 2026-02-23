import { Request } from 'express';
import { prisma } from '@utils/prisma';
import { redisClient } from '@middleware/rateLimiter';

import { ApiResponse } from '@utils/ApiResponse';
import { asyncHandler } from '@utils/asyncHandler';

export class HealthController {
    getHealth = asyncHandler(async (req: Request) => {
        const health = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            services: {
                database: 'CONNECTING',
                redis: 'CONNECTING',
            },
            status: 'UP'
        };

        try {
            await prisma.$queryRaw`SELECT 1`;
            health.services.database = 'UP';
        } catch (e) {
            health.services.database = 'DOWN';
            health.status = 'DEGRADED';
        }

        try {
            await redisClient.ping();
            health.services.redis = 'UP';
        } catch (e) {
            health.services.redis = 'DOWN';
            health.status = 'DEGRADED';
        }

        const statusCode = health.status === 'UP' ? 200 : 503;
        return new ApiResponse(statusCode, health, `System is ${health.status}`);
    });
}
