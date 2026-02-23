import { z } from 'zod';

export const subscribeSchema = z.object({
    body: z.object({
        planId: z.string().uuid('Invalid Plan ID format'),
    }),
});

export const upgradeSchema = z.object({
    body: z.object({
        newPlanId: z.string().uuid('Invalid Plan ID format'),
    }),
});
