import { Request, Response } from 'express';
import { ApiResponse } from '@utils/ApiResponse';
import { AccountService } from './account.service';
import { asyncHandler } from '@utils/asyncHandler';

export class AccountController {
    constructor(private accountService: AccountService) { }

    register = asyncHandler(async (req: Request) => {
        const account = await this.accountService.register(req.body);
        return new ApiResponse(201, account, 'Account registered successfully');
    });

    login = asyncHandler(async (req: Request) => {
        const { email, password } = req.body;
        const data = await this.accountService.login(email, password);
        return new ApiResponse(200, data, 'Login successful');
    });

    getProfile = asyncHandler(async (req: Request) => {
        const accountId = (req as any).user.id;
        const account = await this.accountService.getProfile(accountId);
        return new ApiResponse(200, account, 'Profile retrieved successfully');
    });
}

