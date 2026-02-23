import { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { ApiResponse } from '@utils/ApiResponse';
import { asyncHandler } from '@utils/asyncHandler';

export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) { }

    subscribe = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const { planId } = req.body;
        const subscription = await this.subscriptionService.subscribe(accountId, planId);
        return new ApiResponse(201, subscription, 'Subscribed to plan successfully');
    });

    upgrade = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const { newPlanId } = req.body;
        const subscription = await this.subscriptionService.upgradePlan(accountId, newPlanId);
        return new ApiResponse(200, subscription, 'Plan upgraded successfully');
    });

    cancel = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const subscription = await this.subscriptionService.cancelSubscription(accountId);
        return new ApiResponse(200, subscription, 'Subscription cancelled successfully');
    });

    getStatus = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const subscription = await this.subscriptionService.getStatus(accountId);
        return new ApiResponse(200, subscription, 'Subscription status retrieved successfully');
    });
}
