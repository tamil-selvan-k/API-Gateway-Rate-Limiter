import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '@modules/apiKey/apiKey.service';
import { ApiRepository } from '@modules/api/api.repository';
import { ApiKeyRepository } from '@modules/apiKey/apiKey.repository';
import { AppError } from '@utils/AppError';
import { prisma } from '@utils/prisma';

const apiRepository = new ApiRepository();
const apiKeyRepository = new ApiKeyRepository();
const apiKeyService = new ApiKeyService(apiKeyRepository);

import { Api, Plan } from '@prisma/client';
import { ApiKeyModel } from '@modules/apiKey/apiKey.service';

interface GatewayContext {
    api: Api;
    apiKey: ApiKeyModel;
    plan?: Plan;
}

declare global {
    namespace Express {
        interface Request {
            gatewayContext?: GatewayContext;
        }
    }
}

export const gatewayMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const gatewayId = req.params.gatewayId as string;
    const apiKeyHeader: unknown = req.headers['x-api-key'];

    try {
        // 1. Resolve API
        const api = await apiRepository.findByGatewayId(gatewayId);

        if (!api || !api.isActive) {
            throw new AppError('API not found or inactive', 404);
        }

        // 2. Resolve Account
        const account = await prisma.account.findUnique({ where: { id: api.accountId } }) as unknown as { isActive: boolean } | null;
        if (!account || !account.isActive) {
            throw new AppError('Account inactive', 403);
        }

        // 3. Resolve API Key
        const rawApiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : (apiKeyHeader as string | undefined);
        if (!rawApiKey) {
            throw new AppError('API Key required', 401);
        }
        const apiKey = await apiKeyService.validateKey(rawApiKey, api.id) as unknown as ApiKeyModel;

        // 4. Store for downstream middleware
        req.gatewayContext = {
            api,
            apiKey
        };

        next();
    } catch (error) {
        next(error);
    }
};

