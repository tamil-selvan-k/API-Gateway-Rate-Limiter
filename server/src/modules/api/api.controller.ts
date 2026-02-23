import { Request } from 'express';
import { ApiService } from './api.service';
import { ApiResponse } from '@utils/ApiResponse';
import { asyncHandler } from '@utils/asyncHandler';
import { normalizePagination } from '@utils/pagination';

export class ApiController {
    constructor(private apiService: ApiService) { }

    createApi = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const api = await this.apiService.createApi(accountId, req.body);
        return new ApiResponse(201, api, 'API created successfully');
    });

    getApi = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const apiId = req.params.id as string;
        const api = await this.apiService.getApiById(apiId, accountId);
        return new ApiResponse(200, api, 'API retrieved successfully');
    });

    listApis = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const { offset, limit } = normalizePagination(req.query.offset, req.query.limit);
        const apis = await this.apiService.listApis(accountId, offset, limit);
        return new ApiResponse(200, apis, 'APIs retrieved successfully');
    });

    updateApi = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const apiId = req.params.id as string;
        const api = await this.apiService.updateApi(apiId, accountId, req.body);
        return new ApiResponse(200, api, 'API updated successfully');
    });

    deleteApi = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const apiId = req.params.id as string;
        await this.apiService.deleteApi(apiId, accountId);
        return new ApiResponse(200, null, 'API deleted successfully');
    });

}
