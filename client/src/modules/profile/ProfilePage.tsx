import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Globe, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import type { ApiResponse, Api, Subscription } from '../../types/types';

function getGatewayBaseUrl() {
    const raw = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    return raw.replace(/\/api\/v1\/?$/, '');
}

export default function ProfilePage() {
    const { user } = useAuth();

    const { data: apisRes, isLoading: apisLoading } = useQuery({
        queryKey: ['apis'],
        queryFn: () => axiosInstance.get('/apis?limit=100') as Promise<ApiResponse<Api[]>>,
    });

    const { data: keysRes, isLoading: keysLoading } = useQuery({
        queryKey: ['api-keys-account', user?.id],
        queryFn: () =>
            axiosInstance.get(`/api-keys/account/${user?.id}`) as Promise<
                ApiResponse<{ id: string; isActive: boolean }[]>
            >,
        enabled: !!user?.id,
    });

    const { data: subscriptionRes, isLoading: subLoading } = useQuery({
        queryKey: ['subscription-status'],
        queryFn: () =>
            axiosInstance.get('/subscriptions/status') as Promise<ApiResponse<Subscription | null>>,
    });

    const apis = apisRes?.data ?? [];
    const activeKeys = (keysRes?.data ?? []).filter((k) => k.isActive).length;
    const planName = subscriptionRes?.data?.plan?.name ?? 'No Plan';
    const gatewayBaseUrl = getGatewayBaseUrl();
    const exampleApi = apis[0];

    const gatewayExample = useMemo(() => {
        if (!exampleApi) return '';
        return `${gatewayBaseUrl}/${exampleApi.gatewayId}/health`;
    }, [exampleApi, gatewayBaseUrl]);

    const isLoading = apisLoading || keysLoading || subLoading;

    return (
        <div>
            <div className="page-header">
                <h2>Profile</h2>
                <p>Organization details and API access instructions</p>
            </div>

            {isLoading ? (
                <div className="stat-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    <div className="profile-grid">
                        <div className="card">
                            <div className="profile-card__title">
                                <Building2 size={16} />
                                <span>Organization</span>
                            </div>
                            <div className="profile-card__value">{user?.name || 'Unknown Org'}</div>
                            <div className="text-sm text-muted">Owner email: {user?.email || 'N/A'}</div>
                            <div className="text-xs text-muted mt-4">Org ID: {user?.id || 'N/A'}</div>
                        </div>

                        <div className="card">
                            <div className="profile-card__title">
                                <ShieldCheck size={16} />
                                <span>Subscription</span>
                            </div>
                            <div className="profile-card__value">{planName}</div>
                            <div className="text-sm text-muted">
                                Active APIs: {apis.length} | Active keys: {activeKeys}
                            </div>
                        </div>
                    </div>

                    <div className="card mb-6">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>
                            How your organization can access APIs through this rate limiter
                        </h3>
                        <ol className="profile-steps">
                            <li>Create an API in the APIs page (you get a unique gateway ID).</li>
                            <li>Create an API key in API Keys page for that API.</li>
                            <li>Call the gateway URL using your key in header: <code>x-api-key</code>.</li>
                            <li>
                                Traffic is validated, rate-limited by your plan, and then proxied to your upstream.
                            </li>
                        </ol>
                    </div>

                    <div className="card">
                        <div className="profile-card__title" style={{ marginBottom: '10px' }}>
                            <Globe size={16} />
                            <span>Gateway request example</span>
                        </div>
                        {exampleApi ? (
                            <>
                                <p className="text-sm text-muted mb-4">
                                    Example API: <strong>{exampleApi.name}</strong> ({exampleApi.gatewayId})
                                </p>
                                <pre className="code-block">{`curl -X GET "${gatewayExample}" \\
  -H "x-api-key: <YOUR_API_KEY>"`}</pre>
                            </>
                        ) : (
                            <p className="text-sm text-muted">
                                Create your first API to generate a gateway URL and start sending requests.
                            </p>
                        )}
                        <p className="text-xs text-muted mt-4">
                            Control plane base: {import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}
                        </p>
                        <p className="text-xs text-muted">
                            Gateway base: {gatewayBaseUrl}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
