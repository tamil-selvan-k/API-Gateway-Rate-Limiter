import { ApiRepository } from './api.repository';
import { AppError } from '@utils/AppError';
import crypto from 'crypto';
import { validateUpstreamBaseUrl } from '@utils/url.util';

export class ApiService {
    constructor(private apiRepository: ApiRepository) { }

    async createApi(accountId: string, data: { name: string; upstreamBaseUrl: string }) {
        const gatewayId = crypto.randomBytes(8).toString('hex');
        validateUpstreamBaseUrl(data.upstreamBaseUrl);

        return this.apiRepository.create({
            ...data,
            gatewayId,
            account: { connect: { id: accountId } },
        });
    }

    async getApiById(id: string, accountId: string) {
        const api = await this.apiRepository.findById(id);
        if (!api || api.accountId !== accountId) {
            throw new AppError('API not found', 404);
        }
        return api;
    }

    async listApis(accountId: string, offset?: number, limit?: number) {
        return this.apiRepository.findByAccountId(accountId, offset, limit);
    }

    async updateApi(id: string, accountId: string, data: any) {
        await this.getApiById(id, accountId); // Ensure ownership
        if (data?.upstreamBaseUrl) {
            validateUpstreamBaseUrl(data.upstreamBaseUrl);
        }
        return this.apiRepository.update(id, data);
    }

    async deleteApi(id: string, accountId: string) {
        await this.getApiById(id, accountId); // Ensure ownership
        return this.apiRepository.delete(id);
    }

    async toggleApi(id: string, accountId: string, isActive: boolean) {
        await this.getApiById(id, accountId);
        return this.apiRepository.update(id, { isActive });
    }
}
