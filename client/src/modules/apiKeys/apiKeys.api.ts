import axiosInstance from '../../api/axiosInstance';

export interface ApiKey {
    id: string;
    key: string;
    name: string;
    isActive: boolean;
    createdAt: string;
}

export const fetchApiKeys = (accountId: string): Promise<{ data: ApiKey[] }> => {
    return axiosInstance.get(`/api-keys/account/${accountId}`);
};

export const createApiKey = (data: { accountId: string; name: string }): Promise<{ data: ApiKey }> => {
    return axiosInstance.post('/api-keys', data);
};

export const revokeApiKey = (id: string): Promise<{ data: ApiKey }> => {
    return axiosInstance.patch(`/api-keys/${id}/revoke`);
};
