import { prisma } from '@config/prisma.config';
import { Prisma } from '@prisma/client';

export class RateLimiterRepository {
    async findApiById(apiId: string) {
        return prisma.api.findUnique({
            where: { id: apiId }
        });
    }

    async updateApiRateLimit(apiId: string, data: Prisma.ApiUpdateInput) {
        return prisma.api.update({
            where: { id: apiId },
            data
        });
    }

    async getMonthlyUsageForApi(accountId: string, apiId: string, month: Date) {
        return prisma.monthlyUsage.findUnique({
            where: {
                accountId_apiId_month: {
                    accountId,
                    apiId,
                    month
                }
            }
        });
    }

    async getHitsSince(apiId: string, since: Date) {
        return prisma.usageLog.count({
            where: {
                apiId,
                timestamp: { gte: since }
            }
        });
    }
}
