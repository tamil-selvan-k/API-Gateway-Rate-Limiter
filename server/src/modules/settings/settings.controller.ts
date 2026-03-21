import { Request } from 'express';
import { ApiResponse } from '@utils/ApiResponse';
import { asyncHandler } from '@utils/asyncHandler';
import { SettingsService } from './settings.service';

export class SettingsController {
    constructor(private settingsService: SettingsService) {}

    getSettings = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        const data = await this.settingsService.getSettings(accountId);
        return new ApiResponse(200, data, 'Settings retrieved successfully');
    });

    updateProfile = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        const data = await this.settingsService.updateProfile(accountId, req.body);
        return new ApiResponse(200, data, 'Profile updated successfully');
    });

    updateSecurity = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        const data = await this.settingsService.updateSecurity(accountId, req.body);
        return new ApiResponse(200, data, 'Security settings updated successfully');
    });

    updatePreferences = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        const data = await this.settingsService.updatePreferences(accountId, req.body);
        return new ApiResponse(200, data, 'Preferences updated successfully');
    });

    deleteAccount = asyncHandler(async (req: Request) => {
        const accountId = (req as unknown as { user: { id: string } }).user.id;
        await this.settingsService.deleteAccount(accountId);
        return new ApiResponse(200, null, 'Account deleted successfully');
    });
}
