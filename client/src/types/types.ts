// ============================================================
// API Response wrapper — matches backend ApiResponse class
// ============================================================
export interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

// ============================================================
// Account
// ============================================================
export interface Account {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    account: Account;
    token: string;
}

// ============================================================
// Api
// ============================================================
export interface Api {
    id: string;
    name: string;
    gatewayId: string;
    upstreamBaseUrl: string;
    isActive: boolean;
    accountId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateApiPayload {
    name: string;
    upstreamBaseUrl: string;
}

export interface UpdateApiPayload {
    name?: string;
    upstreamBaseUrl?: string;
    isActive?: boolean;
}

// ============================================================
// ApiKey
// ============================================================
export interface ApiKey {
    id: string;
    key: string;
    name: string;
    isActive: boolean;
    accountId: string;
    apiId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateApiKeyPayload {
    accountId: string;
    apiId: string;
    name: string;
    expiresAt?: string;
}

// ============================================================
// Plan
// ============================================================
export interface Plan {
    id: string;
    name: string;
    description: string | null;
    monthlyRequestLimit: number;
    requestsPerSecond: number;
    burstLimit: number;
    monthlyPrice: string; // Decimal comes as string
    overagePricePerMillion: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// Subscription
// ============================================================
export interface Subscription {
    id: string;
    accountId: string;
    planId: string;
    status: string;
    startDate: string;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    plan: Plan;
}

// ============================================================
// Usage & Analytics
// ============================================================
export interface MonthlyUsage {
    apiId: string;
    month: string;
    totalRequests: string; // BigInt comes as string
}

export interface RateLimiterHits {
    apiId: string;
    lastMinute: number;
    lastHour: number;
}

export interface RateLimiterConfig {
    apiId: string;
    requestsPerSecond: number;
    burstLimit: number;
    monthlyRequestLimit: number;
    overrides: {
        rateLimitRps: number | null;
        rateLimitBurst: number | null;
    };
}

export interface RateLimiterStatus {
    apiId: string;
    rateLimiter: {
        redisAvailable: boolean;
    };
    config: RateLimiterConfig;
    usage: MonthlyUsage;
}
