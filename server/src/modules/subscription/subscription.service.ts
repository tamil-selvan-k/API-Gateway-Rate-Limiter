import { Subscription, Plan, Prisma } from '@prisma/client';
import { SubscriptionRepository } from './subscription.repository';
import { AppError } from '@utils/AppError';
import { getMonthStart } from '@utils/date.util';

interface SubscriptionWithPlan extends Subscription {
    plan: Plan;
}


export class SubscriptionService {
    constructor(private subscriptionRepository: SubscriptionRepository) { }

    async subscribe(accountId: string, planId: string) {
        const activeSub = await this.subscriptionRepository.findActiveByAccountId(accountId);
        if (activeSub) {
            throw new AppError('Account already has an active subscription. Use upgrade instead.', 400);
        }

        const plan = await this.subscriptionRepository.findPlanById(planId);
        if (!plan || !plan.isActive) {
            throw new AppError('Invalid or inactive plan', 400);
        }

        return this.subscriptionRepository.create({
            account: { connect: { id: accountId } },
            plan: { connect: { id: planId } },
            status: 'active',
            startDate: new Date(),
        } as unknown as Prisma.SubscriptionCreateInput);
    }

    async upgradePlan(accountId: string, newPlanId: string) {
        const currentSub = await this.subscriptionRepository.findActiveByAccountId(accountId) as unknown as SubscriptionWithPlan | null;
        if (!currentSub) {
            throw new AppError('No active subscription found to upgrade', 404);
        }

        const newPlan = await this.subscriptionRepository.findPlanById(newPlanId);
        if (!newPlan || !newPlan.isActive) {
            throw new AppError('Invalid or inactive plan', 400);
        }

        // Downgrade check
        if (newPlan.monthlyRequestLimit < currentSub.plan.monthlyRequestLimit) {
            const monthStart = getMonthStart();
            const currentUsage = await this.subscriptionRepository.getMonthlyUsageTotal(accountId, monthStart);
            if (currentUsage > BigInt(newPlan.monthlyRequestLimit)) {
                throw new AppError(`Cannot downgrade: current usage (${currentUsage}) exceeds new plan limit (${newPlan.monthlyRequestLimit})`, 400);
            }
        }

        // Cancel current sub
        await this.subscriptionRepository.update(currentSub.id, {
            status: 'expired',
            endDate: new Date(),
        } as unknown as Prisma.SubscriptionUpdateInput);

        // Create new sub
        return this.subscriptionRepository.create({
            account: { connect: { id: accountId } },
            plan: { connect: { id: newPlanId } },
            status: 'active',
            startDate: new Date(),
        } as unknown as Prisma.SubscriptionCreateInput);
    }

    async cancelSubscription(accountId: string) {
        const currentSub = await this.subscriptionRepository.findActiveByAccountId(accountId);
        if (!currentSub) {
            throw new AppError('No active subscription found', 404);
        }

        return this.subscriptionRepository.update(currentSub.id, {
            status: 'cancelled',
            endDate: new Date(),
        } as unknown as Prisma.SubscriptionUpdateInput);
    }

    async getStatus(accountId: string) {
        const sub = await this.subscriptionRepository.findActiveByAccountId(accountId) as unknown as SubscriptionWithPlan | null;
        if (!sub) return null;

        if (sub.endDate && sub.endDate < new Date()) {
            await this.subscriptionRepository.update(sub.id, { status: 'expired' } as unknown as Prisma.SubscriptionUpdateInput);
            return null;
        }

        return sub;
    }
}

