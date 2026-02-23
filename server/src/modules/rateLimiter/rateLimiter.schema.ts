import { z } from 'zod';

export const rateLimiterApiIdSchema = z.object({
    params: z.object({
        apiId: z.string().uuid({ message: 'Invalid API ID format' }),
    }),
});

export const updateRateLimiterConfigSchema = z.object({
    params: z.object({
        apiId: z.string().uuid({ message: 'Invalid API ID format' }),
    }),
    body: z.object({
        rateLimitRps: z.number().int().positive().nullable().optional(),
        rateLimitBurst: z.number().int().positive().nullable().optional(),
    }).refine((data) => data.rateLimitRps !== undefined || data.rateLimitBurst !== undefined, {
        message: 'At least one rate limit field is required',
    }),
});
