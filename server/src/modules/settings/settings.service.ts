import { AppError } from '@utils/AppError';
import { PasswordUtil } from '@utils/password.util';
import { logger } from '@middleware/logger';
import { AccountRepository } from '@modules/account/account.repository';
import { SettingsRepository, SettingsUpdateInput } from './settings.repository';
import { prisma } from '@config/prisma.config';
import { Prisma } from '@prisma/client';

export class SettingsService {
    constructor(
        private accountRepository: AccountRepository,
        private settingsRepository: SettingsRepository,
    ) {}

    async getSettings(accountId: string) {
        const account = await this.accountRepository.findById(accountId);
        if (!account || !account.isActive) {
            throw new AppError('Account not found or inactive', 404);
        }

        const settings = await this.settingsRepository.findByAccountId(accountId);

        const { password: _pw, ...accountData } = account as typeof account & { password?: string };

        return {
            account: accountData,
            settings: settings ?? null,
        };
    }

    async updateProfile(
        accountId: string,
        data: { name?: string; email?: string },
    ) {
        const account = await this.accountRepository.findById(accountId);
        if (!account || !account.isActive) {
            throw new AppError('Account not found or inactive', 404);
        }

        if (data.email && data.email !== account.email) {
            const existing = await this.accountRepository.findByEmail(data.email);
            if (existing) {
                throw new AppError('Email already in use by another account', 409);
            }
        }

        const updated = await this.accountRepository.update(
            accountId,
            data as Prisma.AccountUpdateInput,
        );

        logger.info('settings:profile_updated', { accountId });

        const { password: _pw, ...result } = updated as typeof updated & { password?: string };
        return result;
    }

    async updateSecurity(
        accountId: string,
        data: {
            currentPassword?: string;
            newPassword?: string;
            weeklyUsageSummary?: boolean;
        },
    ) {
        const account = await this.accountRepository.findById(accountId) as
            | (Awaited<ReturnType<AccountRepository['findById']>> & { password?: string })
            | null;

        if (!account || !account.isActive) {
            throw new AppError('Account not found or inactive', 404);
        }

        if (data.newPassword) {
            if (!data.currentPassword) {
                throw new AppError('Current password is required to set a new password', 400);
            }

            const valid = await PasswordUtil.compare(data.currentPassword, account.password ?? '');
            if (!valid) {
                throw new AppError('Current password is incorrect', 400);
            }

            const hashed = await PasswordUtil.hash(data.newPassword);
            await this.accountRepository.update(accountId, {
                password: hashed,
            } as Prisma.AccountUpdateInput);

            logger.info('settings:password_changed', { accountId });
        }

        if (typeof data.weeklyUsageSummary === 'boolean') {
            await this.settingsRepository.upsert(accountId, {
                weeklyUsageSummary: data.weeklyUsageSummary,
            });

            logger.info('settings:weekly_usage_summary_toggled', {
                accountId,
                weeklyUsageSummary: data.weeklyUsageSummary,
            });
        }

        return { message: 'Security settings updated' };
    }

    async updatePreferences(
        accountId: string,
        data: SettingsUpdateInput,
    ) {
        const account = await this.accountRepository.findById(accountId);
        if (!account || !account.isActive) {
            throw new AppError('Account not found or inactive', 404);
        }

        const result = await this.settingsRepository.upsert(accountId, {
            ...(data.theme !== undefined && { theme: data.theme }),
            ...(data.weeklyUsageSummary !== undefined && {
                weeklyUsageSummary: data.weeklyUsageSummary,
            }),
            ...(data.usageAlertThreshold !== undefined && {
                usageAlertThreshold: data.usageAlertThreshold,
            }),
            ...(data.defaultApiKeyExpiryDays !== undefined && {
                defaultApiKeyExpiryDays: data.defaultApiKeyExpiryDays,
            }),
        });

        logger.info('settings:preferences_updated', { accountId, data });

        return result;
    }

    async deleteAccount(accountId: string) {
        const account = await this.accountRepository.findById(accountId);
        if (!account || !account.isActive) {
            throw new AppError('Account not found or already deleted', 404);
        }

        // Cascade disable: APIs and API keys, then soft-delete account
        await prisma.$transaction(async (tx) => {
            await tx.api.updateMany({
                where: { accountId },
                data: { isActive: false },
            });

            await tx.apiKey.updateMany({
                where: { accountId },
                data: { isActive: false },
            });

            await tx.account.update({
                where: { id: accountId },
                data: { isActive: false },
            });
        });

        logger.info('settings:account_deleted', { accountId });
    }
}
