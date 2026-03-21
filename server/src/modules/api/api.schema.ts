import { z } from 'zod';

export const createApiSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(50),
        upstreamBaseUrl: z.string().url().refine(url => url.startsWith('https://'), {
            message: 'Upstream URL must use HTTPS',
        }),
        requestTimeoutMs: z
            .number()
            .int()
            .min(1000, 'Timeout must be at least 1000ms')
            .max(60000, 'Timeout must not exceed 60000ms')
            .optional(),
    }),
});

export const updateApiSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(50).optional(),
        upstreamBaseUrl: z.string().url().refine(url => url.startsWith('https://'), {
            message: 'Upstream URL must use HTTPS',
        }).optional(),
        isActive: z.boolean().optional(),
        requestTimeoutMs: z
            .number()
            .int()
            .min(1000, 'Timeout must be at least 1000ms')
            .max(60000, 'Timeout must not exceed 60000ms')
            .optional(),
    }),
});

