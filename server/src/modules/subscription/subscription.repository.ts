import { prisma } from '@config/prisma.config';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@utils/pagination';
import { getMonthStart } from '@utils/date.util';
import { Subscription, Prisma } from '@prisma/client';

export class SubscriptionRepository {
    async findActiveByAccountId(accountId: string): Promise<Subscription | null> {
        return prisma.subscription.findFirst({
            where: {
                accountId,
                status: 'active',
                OR: [
                    { endDate: null },
                    { endDate: { gt: new Date() } }
                ]
            },
            include: { plan: true }
        });
    }

    async create(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
        return prisma.subscription.create({ data });
    }

    async update(id: string, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
        return prisma.subscription.update({
            where: { id },
            data,
        });
    }

    async findAllByAccountId(
        accountId: string,
        offset: number = DEFAULT_OFFSET,
        limit: number = DEFAULT_LIMIT,
    ): Promise<Subscription[]> {
        return prisma.subscription.findMany({
            where: { accountId },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
        });
    }

    async findPlanById(planId: string) {
        return prisma.plan.findUnique({
            where: { id: planId }
        });
    }

    async getMonthlyUsageTotal(accountId: string, month: Date = getMonthStart()): Promise<bigint> {
        const result = await prisma.monthlyUsage.aggregate({
            where: {
                accountId,
                month
            },
            _sum: {
                totalRequests: true
            }
        });

        return result._sum.totalRequests ?? 0n;
    }
}
