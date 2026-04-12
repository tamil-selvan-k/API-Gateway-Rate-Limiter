import { prisma } from '@config/prisma.config';
import { Prisma } from '@prisma/client';
import { getNextMonthStart } from '@utils/date.util';

export class RateLimiterRepository {
    async findApiById(apiId: string) {
        return prisma.api.findUnique({
            where: { id: apiId }
        });
    }

    async updateApiRateLimit(apiId: string, data: Prisma.ApiUpdateInput | Prisma.ApiUncheckedUpdateInput) {
        return prisma.api.update({
            where: { id: apiId },
            data: data as Prisma.ApiUpdateInput,
        });
    }

    async getMonthlyUsageForApi(accountId: string, apiId: string, month: Date) {
        return prisma.monthlyUsage.findFirst({
            where: {
                accountId,
                apiId,
                month: {
                    gte: month,
                    lt: getNextMonthStart(month),
                },
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

    async getCurrentMonthRequestCountFromLogs(apiId: string, month: Date) {
        return prisma.usageLog.count({
            where: {
                apiId,
                timestamp: {
                    gte: month,
                    lt: getNextMonthStart(month),
                },
            },
        });
    }
}
