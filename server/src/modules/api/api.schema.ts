import { z } from 'zod';

export const createApiSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(50),
        upstreamBaseUrl: z.string().url().refine(url => url.startsWith('https://'), {
            message: 'Upstream URL must use HTTPS',
        }),
    }),
});

export const updateApiSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(50).optional(),
        upstreamBaseUrl: z.string().url().refine(url => url.startsWith('https://'), {
            message: 'Upstream URL must use HTTPS',
        }).optional(),
        isActive: z.boolean().optional(),
    }),
});
