import { z } from 'zod';

export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        email: z.string().email('Invalid email address').optional(),
    }),
});

export const updateSecuritySchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required').optional(),
        newPassword: z
            .string()
            .min(8, 'New password must be at least 8 characters')
            .optional(),
        weeklyUsageSummary: z.boolean().optional(),
    }),
});

export const updatePreferencesSchema = z.object({
    body: z.object({
        theme: z.enum(['system', 'light', 'dark']).optional(),
        weeklyUsageSummary: z.boolean().optional(),
        usageAlertThreshold: z.number().int().min(0).max(100).optional(),
        defaultApiKeyExpiryDays: z.number().int().min(1).max(365).optional(),
    }),
});
