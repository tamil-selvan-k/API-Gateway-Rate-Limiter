import { ApiKeyRepository } from './apiKey.repository';
import { ApiRepository } from '@modules/api/api.repository';
import { AppError } from '@utils/AppError';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';

// Local interface to handle stale Prisma client types
export interface ApiKeyModel {
    id: string;
    key: string;
    name: string;
    isActive: boolean;
    expiresAt?: Date | null;
    accountId: string;
    apiId: string;
    createdAt: Date;
    updatedAt: Date;
}

export class ApiKeyService {
    private apiRepository: ApiRepository;

    constructor(private apiKeyRepository: ApiKeyRepository) {
        this.apiRepository = new ApiRepository();
    }

    private hashKey(key: string): string {
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    async generateKey(accountId: string, apiId: string, name: string, expiresAt?: string) {
        const api = await this.apiRepository.findById(apiId);
        if (!api || api.accountId !== accountId) {
            throw new AppError('API not found', 404);
        }

        const rawKey = `ak_${crypto.randomBytes(24).toString('hex')}`;
        const hashedKey = this.hashKey(rawKey);
        const parsedExpiresAt = expiresAt ? new Date(expiresAt) : undefined;

        if (parsedExpiresAt && Number.isNaN(parsedExpiresAt.getTime())) {
            throw new AppError('Invalid expiresAt date', 400);
        }

        if (parsedExpiresAt && parsedExpiresAt <= new Date()) {
            throw new AppError('expiresAt must be in the future', 400);
        }

        const apiKey = await this.apiKeyRepository.create({
            key: hashedKey,
            name,
            account: { connect: { id: accountId } },
            api: { connect: { id: apiId } },
            ...(parsedExpiresAt ? { expiresAt: parsedExpiresAt } : {}),
        } as unknown as Prisma.ApiKeyCreateInput) as unknown as ApiKeyModel;

        // Return raw key only once upon creation
        return { ...apiKey, key: rawKey };
    }

    async validateKey(rawKey: string, apiId?: string) {
        const hashedKey = this.hashKey(rawKey);
        const apiKey = await this.apiKeyRepository.findByKey(hashedKey) as unknown as ApiKeyModel | null;

        if (!apiKey || !apiKey.isActive) {
            throw new AppError('Invalid or inactive API Key', 401);
        }

        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            throw new AppError('API Key expired', 401);
        }

        if (apiId && apiKey.apiId !== apiId) {
            throw new AppError('API Key does not belong to this API', 403);
        }

        return apiKey;
    }

    async getKeysByAccount(accountId: string, offset?: number, limit?: number) {
        return this.apiKeyRepository.findByAccountId(accountId, offset, limit) as unknown as Promise<ApiKeyModel[]>;
    }

    async getKeysByApi(apiId: string, accountId: string, offset?: number, limit?: number) {
        const api = await this.apiRepository.findById(apiId);
        if (!api || api.accountId !== accountId) {
            throw new AppError('API not found', 404);
        }
        return this.apiKeyRepository.findByApiId(apiId, offset, limit) as unknown as Promise<ApiKeyModel[]>;
    }

    private async getOwnedKey(id: string, accountId: string) {
        const apiKey = await this.apiKeyRepository.findById(id) as unknown as ApiKeyModel | null;
        if (!apiKey || apiKey.accountId !== accountId) {
            throw new AppError('API Key not found', 404);
        }
        return apiKey;
    }

    async revokeKey(id: string, accountId: string) {
        await this.getOwnedKey(id, accountId);
        return this.apiKeyRepository.update(id, { isActive: false } as unknown as Prisma.ApiKeyUpdateInput);
    }

    async rotateKey(id: string, accountId: string) {
        const existingKey = await this.getOwnedKey(id, accountId);
        await this.apiKeyRepository.update(id, { isActive: false } as unknown as Prisma.ApiKeyUpdateInput);
        return this.generateKey(
            existingKey.accountId,
            existingKey.apiId,
            `${existingKey.name} (rotated)`,
            existingKey.expiresAt ? existingKey.expiresAt.toISOString() : undefined
        );
    }
}


