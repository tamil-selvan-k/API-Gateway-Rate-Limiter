import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Zap, BarChart3 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import type { ApiResponse, Api, MonthlyUsage, RateLimiterHits } from '../../types/types';

export default function AnalyticsPage() {
    const [selectedApiId, setSelectedApiId] = useState<string>('');

    // Fetch APIs for dropdown
    const { data: apisRes } = useQuery({
        queryKey: ['apis'],
        queryFn: () => axiosInstance.get('/apis?limit=100') as Promise<ApiResponse<Api[]>>,
    });

    const apis = apisRes?.data ?? [];
    const activeApiId = selectedApiId || (apis.length > 0 ? apis[0].id : '');

    // Fetch usage for selected API
    const { data: usageRes, isLoading: usageLoading } = useQuery({
        queryKey: ['rate-limiter-usage', activeApiId],
        queryFn: () =>
            axiosInstance.get(`/rate-limiter/usage/${activeApiId}`) as Promise<
                ApiResponse<MonthlyUsage>
            >,
        enabled: !!activeApiId,
    });

    // Fetch hits for selected API
    const { data: hitsRes, isLoading: hitsLoading } = useQuery({
        queryKey: ['rate-limiter-hits', activeApiId],
        queryFn: () =>
            axiosInstance.get(`/rate-limiter/hits/${activeApiId}`) as Promise<
                ApiResponse<RateLimiterHits>
            >,
        enabled: !!activeApiId,
        refetchInterval: 15000, // Refresh every 15s for near-real-time
    });

    const usage = usageRes?.data;
    const hits = hitsRes?.data;
    const isLoading = usageLoading || hitsLoading;

    return (
        <div>
            <div className="section-header">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h2>Analytics</h2>
                    <p>Monitor API traffic and rate limiting</p>
                </div>
                {apis.length > 0 && (
                    <div className="select-stack">
                        <span className="select-stack__label">Selected API</span>
                        <div className="select-wrapper">
                            <select
                                value={activeApiId}
                                onChange={(e) => setSelectedApiId(e.target.value)}
                            >
                                {apis.map((api) => (
                                    <option key={api.id} value={api.id}>
                                        {api.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {!activeApiId ? (
                <div className="empty-state">
                    <BarChart3 size={48} className="empty-state__icon" />
                    <h3>No APIs to analyze</h3>
                    <p>Create an API first to see analytics.</p>
                </div>
            ) : isLoading ? (
                <div className="stat-grid">
                    {[1, 2, 3].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    {/* Stat cards */}
                    <div className="stat-grid">
                        <div className="stat-card">
                            <div
                                className="stat-card__icon"
                                style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--brand-400)' }}
                            >
                                <Activity size={20} />
                            </div>
                            <div className="stat-card__label">Monthly Requests</div>
                            <div className="stat-card__value">
                                {Number(usage?.totalRequests ?? 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted mt-4">Month: {usage?.month ?? '—'}</div>
                        </div>

                        <div className="stat-card">
                            <div
                                className="stat-card__icon"
                                style={{ background: 'rgba(251,146,60,0.1)', color: 'var(--orange-400)' }}
                            >
                                <Zap size={20} />
                            </div>
                            <div className="stat-card__label">Last Minute Hits</div>
                            <div className="stat-card__value">
                                {(hits?.lastMinute ?? 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted mt-4">Real-time (15s refresh)</div>
                        </div>

                        <div className="stat-card">
                            <div
                                className="stat-card__icon"
                                style={{ background: 'rgba(250,204,21,0.1)', color: 'var(--yellow-400)' }}
                            >
                                <BarChart3 size={20} />
                            </div>
                            <div className="stat-card__label">Last Hour Hits</div>
                            <div className="stat-card__value">
                                {(hits?.lastHour ?? 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted mt-4">Rolling 60 min window</div>
                        </div>
                    </div>

                    {/* Info about real-time monitoring */}
                    <div className="chart-container">
                        <h3>Traffic Overview</h3>
                        <TrafficVisual lastMinute={hits?.lastMinute ?? 0} lastHour={hits?.lastHour ?? 0} />
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Simple SVG traffic visualisation ───
function TrafficVisual({ lastMinute, lastHour }: { lastMinute: number; lastHour: number }) {
    const maxVal = Math.max(lastMinute, lastHour, 1);
    const minuteWidth = (lastMinute / maxVal) * 100;
    const hourWidth = (lastHour / maxVal) * 100;

    const bars = [
        { label: 'Last Minute', value: lastMinute, width: minuteWidth, color: 'var(--brand-400)' },
        { label: 'Last Hour', value: lastHour, width: hourWidth, color: 'var(--orange-400)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bars.map((bar) => (
                <div key={bar.label}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm" style={{ fontWeight: 500 }}>{bar.label}</span>
                        <span className="text-sm text-muted">{bar.value.toLocaleString()} requests</span>
                    </div>
                    <div
                        style={{
                            height: '28px',
                            background: 'var(--gray-800)',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${Math.max(bar.width, 2)}%`,
                                background: bar.color,
                                borderRadius: 'var(--radius-sm)',
                                transition: 'width 0.5s ease',
                                opacity: 0.8,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
