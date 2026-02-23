import { ApiKeyRepository } from './apiKey.repository';
import { AppError } from '@utils/AppError';
import crypto from 'crypto';

export class ApiKeyService {
    constructor(private apiKeyRepository: ApiKeyRepository) { }

    async generateKey(accountId: string, name: string) {
        const key = `ak_${crypto.randomBytes(24).toString('hex')}`;
        return this.apiKeyRepository.create({
            key,
            name,
            account: { connect: { id: accountId } },
        });
    }

    async validateKey(key: string) {
        const apiKey = await this.apiKeyRepository.findByKey(key);
        if (!apiKey || !apiKey.isActive) {
            throw new AppError('Invalid or inactive API Key', 401);
        }
        return apiKey;
    }

    async getKeysByAccount(accountId: string) {
        return this.apiKeyRepository.findByAccountId(accountId);
    }

    async revokeKey(id: string) {
        return this.apiKeyRepository.update(id, { isActive: false });
    }
}
