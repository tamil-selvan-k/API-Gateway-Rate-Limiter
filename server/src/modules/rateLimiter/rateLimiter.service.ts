import { RateLimiterRepository } from './rateLimiter.repository';
import { SubscriptionRepository } from '@modules/subscription/subscription.repository';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { AppError } from '@utils/AppError';
import { getMonthStart } from '@utils/date.util';
import { redisClient } from '@config/redis.config';
import { Prisma } from '@prisma/client';

export class RateLimiterService {
    private subscriptionService: SubscriptionService;

    constructor(private rateLimiterRepository: RateLimiterRepository, subscriptionRepository: SubscriptionRepository) {
        this.subscriptionService = new SubscriptionService(subscriptionRepository);
    }

    private async ensureOwnership(apiId: string, accountId: string) {
        return this.rateLimiterRepository.findApiById(apiId).then((api) => {
            if (!api) {
                throw new AppError('API not found', 404);
            }
            if (api.accountId !== accountId) {
                throw new AppError('Forbidden', 403);
            }
            return api;
        });
    }

    async getConfig(apiId: string, accountId: string) {
        const api = await this.ensureOwnership(apiId, accountId);
        const subscription = await this.subscriptionService.getStatus(accountId);
        if (!subscription) {
            throw new AppError('No active subscription found', 403);
        }

        return {
            apiId: api.id,
            requestsPerSecond: api.rateLimitRps ?? subscription.plan.requestsPerSecond,
            burstLimit: api.rateLimitBurst ?? subscription.plan.burstLimit,
            monthlyRequestLimit: subscription.plan.monthlyRequestLimit,
            overrides: {
                rateLimitRps: api.rateLimitRps,
                rateLimitBurst: api.rateLimitBurst
            }
        };
    }

    async updateConfig(
        apiId: string,
        accountId: string,
        data: { rateLimitRps?: number | null; rateLimitBurst?: number | null }
    ) {
        await this.ensureOwnership(apiId, accountId);

        if (data.rateLimitRps !== undefined && data.rateLimitRps !== null && data.rateLimitRps < 1) {
            throw new AppError('rateLimitRps must be greater than 0', 400);
        }
        if (data.rateLimitBurst !== undefined && data.rateLimitBurst !== null && data.rateLimitBurst < 1) {
            throw new AppError('rateLimitBurst must be greater than 0', 400);
        }

        const updateData: Prisma.ApiUpdateInput = {};
        if (data.rateLimitRps !== undefined) {
            updateData.rateLimitRps = data.rateLimitRps;
        }
        if (data.rateLimitBurst !== undefined) {
            updateData.rateLimitBurst = data.rateLimitBurst;
        }

        return this.rateLimiterRepository.updateApiRateLimit(apiId, updateData);
    }

    async getUsage(apiId: string, accountId: string) {
        await this.ensureOwnership(apiId, accountId);
        const monthStart = getMonthStart();
        const usage = await this.rateLimiterRepository.getMonthlyUsageForApi(accountId, apiId, monthStart);

        return {
            apiId,
            month: monthStart.toISOString().slice(0, 10),
            totalRequests: usage?.totalRequests ? usage.totalRequests.toString() : '0'
        };
    }

    async getHits(apiId: string, accountId: string) {
        await this.ensureOwnership(apiId, accountId);
        const now = new Date();
        const lastMinute = new Date(now.getTime() - 60 * 1000);
        const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

        const [minuteCount, hourCount] = await Promise.all([
            this.rateLimiterRepository.getHitsSince(apiId, lastMinute),
            this.rateLimiterRepository.getHitsSince(apiId, lastHour),
        ]);

        return {
            apiId,
            lastMinute: minuteCount,
            lastHour: hourCount
        };
    }

    async getStatus(apiId: string, accountId: string) {
        const config = await this.getConfig(apiId, accountId);
        const usage = await this.getUsage(apiId, accountId);

        return {
            apiId,
            rateLimiter: {
                redisAvailable: redisClient.isOpen
            },
            config,
            usage
        };
    }
}
