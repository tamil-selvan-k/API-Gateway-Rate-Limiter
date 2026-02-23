import { z } from 'zod';

export const createApiKeySchema = z.object({
    body: z.object({
        accountId: z.string().uuid('Invalid Account ID format'),
        name: z.string().min(3, 'Name must be at least 3 characters long').max(50),
    }),
});

export const getApiKeysSchema = z.object({
    params: z.object({
        accountId: z.string().uuid({ message: 'Invalid Account ID format' }),
    }),
});

export const revokeApiKeySchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'Invalid Key ID format' }),
    }),
});
