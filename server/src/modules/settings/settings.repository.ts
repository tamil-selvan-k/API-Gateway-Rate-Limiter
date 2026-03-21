import crypto from 'crypto';
import { prisma } from '@config/prisma.config';

export interface SettingsModel {
    id: string;
    accountId: string;
    theme: 'system' | 'light' | 'dark';
    weeklyUsageSummary: boolean;
    usageAlertThreshold: number;
    defaultApiKeyExpiryDays: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface SettingsUpdateInput {
    theme?: 'system' | 'light' | 'dark';
    weeklyUsageSummary?: boolean;
    usageAlertThreshold?: number;
    defaultApiKeyExpiryDays?: number;
}

type SettingsRow = {
    id: string;
    accountId: string;
    theme: string;
    weeklyUsageSummary: boolean;
    usageAlertThreshold: number;
    defaultApiKeyExpiryDays: number;
    createdAt: Date;
    updatedAt: Date;
};

export class SettingsRepository {
    private async ensureTableExists() {
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "OrganizationSettings" (
                "id" TEXT NOT NULL,
                "accountId" TEXT NOT NULL,
                "theme" TEXT NOT NULL DEFAULT 'system',
                "weeklyUsageSummary" BOOLEAN NOT NULL DEFAULT false,
                "usageAlertThreshold" INTEGER NOT NULL DEFAULT 80,
                "defaultApiKeyExpiryDays" INTEGER NOT NULL DEFAULT 90,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "OrganizationSettings_accountId_key" UNIQUE ("accountId"),
                CONSTRAINT "OrganizationSettings_accountId_fkey"
                    FOREIGN KEY ("accountId")
                    REFERENCES "Account"("id")
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE
            )
        `;

        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "OrganizationSettings_accountId_idx"
            ON "OrganizationSettings"("accountId")
        `;
    }

    private mapRow(row: SettingsRow): SettingsModel {
        return {
            ...row,
            theme: row.theme as SettingsModel['theme'],
        };
    }

    async findByAccountId(accountId: string): Promise<SettingsModel | null> {
        await this.ensureTableExists();

        const rows = await prisma.$queryRaw<SettingsRow[]>`
            SELECT
                "id",
                "accountId",
                "theme",
                "weeklyUsageSummary",
                "usageAlertThreshold",
                "defaultApiKeyExpiryDays",
                "createdAt",
                "updatedAt"
            FROM "OrganizationSettings"
            WHERE "accountId" = ${accountId}
            LIMIT 1
        `;

        return rows[0] ? this.mapRow(rows[0]) : null;
    }

    async create(accountId: string): Promise<void> {
        await this.ensureTableExists();

        await prisma.$executeRaw`
            INSERT INTO "OrganizationSettings" (
                "id",
                "accountId",
                "theme",
                "weeklyUsageSummary",
                "usageAlertThreshold",
                "defaultApiKeyExpiryDays",
                "createdAt",
                "updatedAt"
            )
            VALUES (
                ${crypto.randomUUID()},
                ${accountId},
                ${'system'},
                ${false},
                ${80},
                ${90},
                NOW(),
                NOW()
            )
            ON CONFLICT ("accountId") DO NOTHING
        `;
    }

    async upsert(accountId: string, data: SettingsUpdateInput): Promise<SettingsModel> {
        await this.ensureTableExists();

        const rows = await prisma.$queryRaw<SettingsRow[]>`
            INSERT INTO "OrganizationSettings" (
                "id",
                "accountId",
                "theme",
                "weeklyUsageSummary",
                "usageAlertThreshold",
                "defaultApiKeyExpiryDays",
                "createdAt",
                "updatedAt"
            )
            VALUES (
                ${crypto.randomUUID()},
                ${accountId},
                ${data.theme ?? 'system'},
                ${data.weeklyUsageSummary ?? false},
                ${data.usageAlertThreshold ?? 80},
                ${data.defaultApiKeyExpiryDays ?? 90},
                NOW(),
                NOW()
            )
            ON CONFLICT ("accountId") DO UPDATE SET
                "theme" = COALESCE(${data.theme ?? null}, "OrganizationSettings"."theme"),
                "weeklyUsageSummary" = COALESCE(${data.weeklyUsageSummary ?? null}, "OrganizationSettings"."weeklyUsageSummary"),
                "usageAlertThreshold" = COALESCE(${data.usageAlertThreshold ?? null}, "OrganizationSettings"."usageAlertThreshold"),
                "defaultApiKeyExpiryDays" = COALESCE(${data.defaultApiKeyExpiryDays ?? null}, "OrganizationSettings"."defaultApiKeyExpiryDays"),
                "updatedAt" = NOW()
            RETURNING
                "id",
                "accountId",
                "theme",
                "weeklyUsageSummary",
                "usageAlertThreshold",
                "defaultApiKeyExpiryDays",
                "createdAt",
                "updatedAt"
        `;

        return this.mapRow(rows[0]);
    }
}
