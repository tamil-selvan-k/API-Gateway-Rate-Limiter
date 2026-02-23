import { z } from 'zod';

export const createApiKeySchema = z.object({
    body: z.object({
        accountId: z.string().uuid('Invalid Account ID format'),
        apiId: z.string().uuid('Invalid API ID format'),
        name: z.string().min(3, 'Name must be at least 3 characters long').max(50),
        expiresAt: z.string().datetime().optional(),
    }),
});

export const getApiKeysByApiSchema = z.object({
    params: z.object({
        apiId: z.string().uuid({ message: 'Invalid API ID format' }),
    }),
});

export const revokeApiKeySchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'Invalid Key ID format' }),
    }),
});

