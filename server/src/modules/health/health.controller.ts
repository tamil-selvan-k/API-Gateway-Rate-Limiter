import { Request } from 'express';
import { prisma } from '@utils/prisma';
import { redisClient } from '@middleware/rateLimiter';

import { ApiResponse } from '@utils/ApiResponse';
import { asyncHandler } from '@utils/asyncHandler';
import { getMetricsSnapshot } from '@utils/metrics';

const checkServices = async () => {
    const services = {
        database: 'CONNECTING',
        redis: 'CONNECTING',
    };

    let status: 'UP' | 'DEGRADED' = 'UP';

    try {
        await prisma.$queryRaw`SELECT 1`;
        services.database = 'UP';
    } catch (e) {
        services.database = 'DOWN';
        status = 'DEGRADED';
    }

    try {
        await redisClient.ping();
        services.redis = 'UP';
    } catch (e) {
        services.redis = 'DOWN';
        status = 'DEGRADED';
    }

    return { services, status };
};

export class HealthController {
    getHealth = asyncHandler(async (req: Request) => {
        const base = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
        const { services, status } = await checkServices();
        const health = { ...base, services, status };

        const statusCode = health.status === 'UP' ? 200 : 503;
        return new ApiResponse(statusCode, health, `System is ${health.status}`);
    });

    getReady = asyncHandler(async (req: Request) => {
        const { services, status } = await checkServices();
        const statusCode = status === 'UP' ? 200 : 503;
        return new ApiResponse(statusCode, { services, status }, `System is ${status}`);
    });

    getMetrics = asyncHandler(async (req: Request) => {
        const metrics = getMetricsSnapshot();
        return new ApiResponse(200, metrics, 'Metrics retrieved');
    });
}
