import { Request } from 'express';
import { ApiKeyService } from './apiKey.service';
import { AppError } from '@utils/AppError';
import { ApiResponse } from '@utils/ApiResponse';
import { asyncHandler } from '@utils/asyncHandler';
import { normalizePagination } from '@utils/pagination';

export class ApiKeyController {
    constructor(private apiKeyService: ApiKeyService) { }

    createKey = asyncHandler(async (req: Request) => {
        const { accountId, apiId, name, expiresAt } = req.body;
        if (!accountId || !apiId || !name) {
            throw new AppError('AccountId, apiId, and name are required', 400);
        }
        const apiKey = await this.apiKeyService.generateKey(accountId, apiId, name, expiresAt);
        return new ApiResponse(201, apiKey, 'API Key created successfully. Store the key safely as it will not be shown again.');
    });

    getKeysByAccount = asyncHandler(async (req: Request) => {
        const accountId = req.params.accountId as string;
        const { offset, limit } = normalizePagination(req.query.offset, req.query.limit);
        const keys = await this.apiKeyService.getKeysByAccount(accountId, offset, limit);
        return new ApiResponse(200, keys, 'API Keys retrieved successfully');
    });

    getKeysByApi = asyncHandler(async (req: Request) => {
        const apiId = req.params.apiId as string;
        const { offset, limit } = normalizePagination(req.query.offset, req.query.limit);
        const keys = await this.apiKeyService.getKeysByApi(apiId, offset, limit);
        return new ApiResponse(200, keys, 'API Keys for API retrieved successfully');
    });

    revokeKey = asyncHandler(async (req: Request) => {
        const id = req.params.id as string;
        const apiKey = await this.apiKeyService.revokeKey(id);
        return new ApiResponse(200, apiKey, 'API Key revoked successfully');
    });

    rotateKey = asyncHandler(async (req: Request) => {
        const id = req.params.id as string;
        const newKey = await this.apiKeyService.rotateKey(id);
        return new ApiResponse(200, newKey, 'API Key rotated successfully. Old key revoked, new key generated.');
    });
}


