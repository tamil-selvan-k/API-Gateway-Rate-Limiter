import { Request } from 'express';
import { ApiResponse } from '@utils/ApiResponse';
import { asyncHandler } from '@utils/asyncHandler';
import { RateLimiterService } from './rateLimiter.service';

export class RateLimiterController {
    constructor(private rateLimiterService: RateLimiterService) { }

    getConfig = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        const apiId = req.params.apiId as string;
        const config = await this.rateLimiterService.getConfig(apiId, accountId);
        return new ApiResponse(200, config, 'Rate limiter config retrieved');
    });

    updateConfig = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        const apiId = req.params.apiId as string;
        const updated = await this.rateLimiterService.updateConfig(apiId, accountId, req.body);
        return new ApiResponse(200, updated, 'Rate limiter config updated');
    });

    getUsage = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        const apiId = req.params.apiId as string;
        const usage = await this.rateLimiterService.getUsage(apiId, accountId);
        return new ApiResponse(200, usage, 'Rate limiter usage retrieved');
    });

    getHits = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        const apiId = req.params.apiId as string;
        const hits = await this.rateLimiterService.getHits(apiId, accountId);
        return new ApiResponse(200, hits, 'Rate limiter hits retrieved');
    });

    getStatus = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        const apiId = req.params.apiId as string;
        const status = await this.rateLimiterService.getStatus(apiId, accountId);
        return new ApiResponse(200, status, 'Rate limiter status retrieved');
    });
}
