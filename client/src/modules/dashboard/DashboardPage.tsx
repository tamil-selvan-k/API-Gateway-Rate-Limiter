import { useQuery } from '@tanstack/react-query';
import { BarChart3, Globe, Key, Zap, TrendingUp } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import type { ApiResponse, Api, Subscription, MonthlyUsage } from '../../types/types';

export default function DashboardPage() {
    const { user } = useAuth();

    const { data: subscriptionRes, isLoading: subLoading } = useQuery({
        queryKey: ['subscription-status'],
        queryFn: () =>
            axiosInstance.get('/subscriptions/status') as Promise<ApiResponse<Subscription | null>>,
    });

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

    // Fetch monthly usage for each API
    const apis = apisRes?.data ?? [];
    const { data: usageData } = useQuery({
        queryKey: ['monthly-usage-all', apis.map((a) => a.id)],
        queryFn: async () => {
            const results = await Promise.all(
                apis.map(
                    (api) =>
                        axiosInstance.get(`/rate-limiter/usage/${api.id}`) as Promise<
                            ApiResponse<MonthlyUsage>
                        >,
                ),
            );
            return results;
        },
        enabled: apis.length > 0,
    });

    const subscription = subscriptionRes?.data;
    const plan = subscription?.plan;
    const allKeys = keysRes?.data ?? [];
    const activeKeys = allKeys.filter((k) => k.isActive);
    const activeApis = apis.filter((a) => a.isActive);

    // Sum up total monthly usage
    const totalUsage = usageData
        ? usageData.reduce((sum, r) => sum + Number(r.data?.totalRequests ?? 0), 0)
        : 0;

    const isLoading = subLoading || apisLoading || keysLoading;

    if (isLoading) {
        return (
            <div>
                <div className="page-header">
                    <h2>Dashboard</h2>
                    <p>Overview of your API Gateway</p>
                </div>
                <div className="stat-grid">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    const stats = [
        {
            icon: <Zap size={20} />,
            label: 'Current Plan',
            value: plan?.name ?? 'No Plan',
            color: 'var(--brand-400)',
            bg: 'rgba(59,130,246,0.1)',
        },
        {
            icon: <TrendingUp size={20} />,
            label: 'Monthly Limit',
            value: plan ? plan.monthlyRequestLimit.toLocaleString() : '—',
            color: 'var(--green-400)',
            bg: 'rgba(34,197,94,0.1)',
        },
        {
            icon: <BarChart3 size={20} />,
            label: 'Requests Used',
            value: totalUsage.toLocaleString(),
            color: 'var(--orange-400)',
            bg: 'rgba(251,146,60,0.1)',
        },
        {
            icon: <Globe size={20} />,
            label: 'Active APIs',
            value: String(activeApis.length),
            color: 'var(--brand-400)',
            bg: 'rgba(59,130,246,0.1)',
        },
        {
            icon: <Key size={20} />,
            label: 'Active Keys',
            value: String(activeKeys.length),
            color: 'var(--yellow-400)',
            bg: 'rgba(250,204,21,0.1)',
        },
    ];

    // Usage bar (percentage of limit used)
    const usagePercent = plan ? Math.min((totalUsage / plan.monthlyRequestLimit) * 100, 100) : 0;

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Overview of your API Gateway</p>
            </div>

            <div className="stat-grid">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div
                            className="stat-card__icon"
                            style={{ background: s.bg, color: s.color }}
                        >
                            {s.icon}
                        </div>
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Usage progress */}
            {plan && (
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Monthly Usage</h3>
                        <span className="text-sm text-muted">
                            {totalUsage.toLocaleString()} / {plan.monthlyRequestLimit.toLocaleString()} requests
                        </span>
                    </div>
                    <div
                        style={{
                            height: '10px',
                            background: 'var(--gray-800)',
                            borderRadius: '100px',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${usagePercent}%`,
                                background:
                                    usagePercent > 90
                                        ? 'var(--red-400)'
                                        : usagePercent > 70
                                            ? 'var(--orange-400)'
                                            : 'var(--brand-500)',
                                borderRadius: '100px',
                                transition: 'width 0.5s ease',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* SVG Bar Chart — Usage per API */}
            {apis.length > 0 && usageData && (
                <div className="chart-container">
                    <h3>Usage Per API (Current Month)</h3>
                    <UsageChart apis={apis} usageData={usageData} />
                </div>
            )}
        </div>
    );
}

// ─── Simple SVG Bar Chart ───
interface UsageChartProps {
    apis: Api[];
    usageData: ApiResponse<MonthlyUsage>[];
}

function UsageChart({ apis, usageData }: UsageChartProps) {
    const chartWidth = 600;
    const chartHeight = 200;
    const barGap = 12;

    const data = apis.map((api, i) => ({
        name: api.name.length > 12 ? api.name.slice(0, 12) + '…' : api.name,
        value: Number(usageData[i]?.data?.totalRequests ?? 0),
    }));

    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const barWidth = Math.max(
        20,
        (chartWidth - barGap * (data.length + 1)) / data.length,
    );

    return (
        <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
            style={{ width: '100%', maxWidth: `${chartWidth}px` }}
        >
            {data.map((d, i) => {
                const barHeight = (d.value / maxValue) * chartHeight;
                const x = barGap + i * (barWidth + barGap);
                const y = chartHeight - barHeight;

                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx={4}
                            fill="url(#barGradient)"
                            opacity={0.85}
                        />
                        <text
                            x={x + barWidth / 2}
                            y={chartHeight + 16}
                            textAnchor="middle"
                            fill="var(--gray-400)"
                            fontSize="10"
                            fontFamily="var(--font-sans)"
                        >
                            {d.name}
                        </text>
                        <text
                            x={x + barWidth / 2}
                            y={y - 6}
                            textAnchor="middle"
                            fill="var(--gray-300)"
                            fontSize="10"
                            fontFamily="var(--font-sans)"
                        >
                            {d.value.toLocaleString()}
                        </text>
                    </g>
                );
            })}
            <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-400)" />
                    <stop offset="100%" stopColor="var(--brand-600)" />
                </linearGradient>
            </defs>
        </svg>
    );
}
