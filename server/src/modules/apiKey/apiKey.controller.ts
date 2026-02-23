import { Request } from 'express';
import { ApiKeyService } from './apiKey.service';
import { AppError } from '@utils/AppError';
import { ApiResponse } from '@utils/ApiResponse';
import { asyncHandler } from '@utils/asyncHandler';

export class ApiKeyController {
    constructor(private apiKeyService: ApiKeyService) { }

    createKey = asyncHandler(async (req: Request) => {
        const { accountId, name } = req.body;
        if (!accountId || !name) {
            throw new AppError('AccountId and name are required', 400);
        }
        const apiKey = await this.apiKeyService.generateKey(accountId, name);
        return new ApiResponse(201, apiKey, 'API Key created successfully');
    });

    getKeys = asyncHandler(async (req: Request) => {
        const accountId = req.params.accountId as string;
        const keys = await this.apiKeyService.getKeysByAccount(accountId);
        return new ApiResponse(200, keys, 'API Keys retrieved successfully');
    });

    revokeKey = asyncHandler(async (req: Request) => {
        const id = req.params.id as string;
        const apiKey = await this.apiKeyService.revokeKey(id);
        return new ApiResponse(200, apiKey, 'API Key revoked successfully');
    });
}

