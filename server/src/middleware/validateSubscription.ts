import { Request, Response, NextFunction } from 'express';
import { SubscriptionRepository } from '@modules/subscription/subscription.repository';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { AppError } from '@utils/AppError';
import { getMonthStart } from '@utils/date.util';
import { Plan } from '@prisma/client';

const subscriptionRepository = new SubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository);

type ApiIdResolver = (req: Request) => string | undefined;
type AccountIdResolver = (req: Request) => string | undefined;

export const validateSubscription = (
    apiIdResolver?: ApiIdResolver,
    accountIdResolver?: AccountIdResolver
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const apiId = apiIdResolver
                ? apiIdResolver(req)
                : req.gatewayContext?.api.id || (req.params.apiId as string | undefined);

            const accountId = accountIdResolver
                ? accountIdResolver(req)
                : req.gatewayContext?.api.accountId || (req as { user?: { id?: string } }).user?.id;

            if (!apiId || !accountId) {
                throw new AppError('Subscription validation failed', 400);
            }

            const subscription = await subscriptionService.getStatus(accountId) as { plan: Plan } | null;
            if (!subscription) {
                throw new AppError('No active subscription found', 403);
            }

            const monthStart = getMonthStart();
            const currentUsage = await subscriptionRepository.getMonthlyUsageTotal(accountId, monthStart);
            if (currentUsage >= BigInt(subscription.plan.monthlyRequestLimit)) {
                throw new AppError('Monthly request limit reached', 429);
            }

            if (req.gatewayContext) {
                req.gatewayContext.plan = subscription.plan;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
