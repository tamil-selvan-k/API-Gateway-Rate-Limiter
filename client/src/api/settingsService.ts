import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/types';

export interface OrganizationSettings {
    id: string;
    accountId: string;
    theme: 'system' | 'light' | 'dark';
    weeklyUsageSummary: boolean;
    usageAlertThreshold: number;
    defaultApiKeyExpiryDays: number;
    createdAt: string;
    updatedAt: string;
}

export interface SettingsData {
    account: {
        id: string;
        name: string;
        email: string;
        isActive: boolean;
    };
    settings: OrganizationSettings | null;
}

const settingsService = {
    getSettings: async () => {
        return axiosInstance.get('/settings') as Promise<ApiResponse<SettingsData>>;
    },

    updateProfile: async (data: { name?: string; email?: string }) => {
        return axiosInstance.put('/settings/profile', data) as Promise<ApiResponse<unknown>>;
    },

    updateSecurity: async (data: {
        currentPassword?: string;
        newPassword?: string;
        weeklyUsageSummary?: boolean;
    }) => {
        return axiosInstance.put('/settings/security', data) as Promise<ApiResponse<unknown>>;
    },

    updatePreferences: async (data: {
        theme?: 'system' | 'light' | 'dark';
        weeklyUsageSummary?: boolean;
        usageAlertThreshold?: number;
        defaultApiKeyExpiryDays?: number;
    }) => {
        return axiosInstance.put('/settings/preferences', data) as Promise<
            ApiResponse<OrganizationSettings>
        >;
    },

    deleteAccount: async () => {
        return axiosInstance.delete('/settings/account') as Promise<ApiResponse<null>>;
    },

    // To handle custom timeout per API (from User Request)
    updateApiTimeout: async (apiId: string, timeoutMs: number) => {
        return axiosInstance.put(`/apis/${apiId}`, {
            requestTimeoutMs: timeoutMs
        }) as Promise<ApiResponse<unknown>>;
    }
};

export default settingsService;
