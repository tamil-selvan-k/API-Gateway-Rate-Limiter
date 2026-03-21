import { useQuery } from '@tanstack/react-query';
import {
    Gem,
    Zap,
    Activity,
    CreditCard,
    ArrowUpRight,
    Clock,
    AlertCircle,
    ShieldCheck,
    Receipt,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import SectionCard from '../../components/SectionCard';
import type { ApiResponse, Subscription, Api, MonthlyUsage } from '../../types/types';

export default function BillingPage() {
    const { data: subRes, isLoading: subLoading } = useQuery({
        queryKey: ['subscription-status'],
        queryFn: () => axiosInstance.get('/subscriptions/status') as Promise<ApiResponse<Subscription | null>>,
    });

    const { data: apisRes, isLoading: apisLoading } = useQuery({
        queryKey: ['apis'],
        queryFn: () => axiosInstance.get('/apis?limit=100') as Promise<ApiResponse<Api[]>>,
    });

    const apis = apisRes?.data ?? [];
    const { data: usageResults, isLoading: usageLoading } = useQuery({
        queryKey: ['usage-all', apis.map((api) => api.id)],
        queryFn: async () => {
            return Promise.all(
                apis.map(
                    (api) =>
                        axiosInstance.get(`/rate-limiter/usage/${api.id}`) as Promise<
                            ApiResponse<MonthlyUsage>
                        >,
                ),
            );
        },
        enabled: apis.length > 0,
    });

    const isLoading = subLoading || apisLoading || usageLoading;

    if (isLoading) {
        return (
            <div className="billing-page">
                <div className="page-header">
                    <h2>Billing</h2>
                    <p>Track subscription status, request usage, and payment readiness</p>
                </div>
                <div className="stat-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
                <div className="plan-grid">
                    {[1, 2].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    const subscription = subRes?.data;
    const plan = subscription?.plan;
    const totalRequests =
        usageResults?.reduce((sum, res) => sum + Number(res.data.totalRequests || 0), 0) || 0;
    const usagePercent = plan ? Math.min((totalRequests / plan.monthlyRequestLimit) * 100, 100) : 0;
    const monthlyLimit = plan?.monthlyRequestLimit ?? 0;
    const requestsPerSecond = plan?.requestsPerSecond ?? 0;
    const burstLimit = plan?.burstLimit ?? 0;
    const planPrice = Number(plan?.monthlyPrice ?? 0);
    const overagePrice = Number(plan?.overagePricePerMillion ?? 0);
    const activeApis = apis.filter((api) => api.isActive).length;
    const remainingRequests = Math.max(monthlyLimit - totalRequests, 0);
    const nextBillingDate = subscription?.endDate
        ? new Date(subscription.endDate).toLocaleDateString()
        : 'Renews with your current cycle';

    return (
        <div className="billing-page">
            <div className="page-header">
                <h2>Billing</h2>
                <p>Track subscription status, request usage, and payment readiness</p>
            </div>
            <div className="billing-stats">
                <div className="billing-stat card">
                    <div className="billing-stat__icon billing-stat__icon--brand">
                        <Zap size={18} />
                    </div>
                    <div className="billing-stat__label">Monthly limit</div>
                    <div className="billing-stat__value">{monthlyLimit.toLocaleString()}</div>
                    <p className="text-sm text-muted">Requests included in your current plan</p>
                </div>
                <div className="billing-stat card">
                    <div className="billing-stat__icon billing-stat__icon--success">
                        <Activity size={18} />
                    </div>
                    <div className="billing-stat__label">Remaining</div>
                    <div className="billing-stat__value">{remainingRequests.toLocaleString()}</div>
                    <p className="text-sm text-muted">Requests left in this billing cycle</p>
                </div>
                <div className="billing-stat card">
                    <div className="billing-stat__icon billing-stat__icon--warning">
                        <ShieldCheck size={18} />
                    </div>
                    <div className="billing-stat__label">Throughput</div>
                    <div className="billing-stat__value">{requestsPerSecond} RPS</div>
                    <p className="text-sm text-muted">Burst limit {burstLimit.toLocaleString()}</p>
                </div>
                <div className="billing-stat card">
                    <div className="billing-stat__icon billing-stat__icon--neutral">
                        <Gem size={18} />
                    </div>
                    <div className="billing-stat__label">Active APIs</div>
                    <div className="billing-stat__value">{activeApis}</div>
                    <p className="text-sm text-muted">Connected to the current subscription</p>
                </div>
            </div>

            <div className="billing-grid">
                <SectionCard
                    title="Current Plan"
                    description="Subscription details and included capacity for your team."
                    icon={Gem}
                    footer={
                        <Link className="btn btn--ghost" to="/subscription">
                            <ArrowUpRight size={16} />
                            Review Plans
                        </Link>
                    }
                >
                    <div className="billing-plan-summary">
                        <div className="billing-plan-summary__main">
                            <h4>{plan?.name ?? 'No Active Plan'}</h4>
                            <p className="text-sm text-muted">
                                {subscription
                                    ? 'Subscription is active and protecting your APIs.'
                                    : 'Choose a plan to unlock rate limits and gateway usage.'}
                            </p>
                            <div className="billing-pill-row">
                                <span className={`badge ${subscription ? 'badge--active' : 'badge--inactive'}`}>
                                    {subscription?.status ?? 'inactive'}
                                </span>
                                <span className="badge badge--plan">
                                    ${planPrice.toLocaleString()}/month
                                </span>
                                <span className="badge badge--warning">
                                    ${overagePrice.toLocaleString()}/1M overage
                                </span>
                            </div>
                        </div>
                        <div className="billing-plan-summary__price">
                            <strong>{monthlyLimit.toLocaleString()}</strong>
                            <span>monthly requests</span>
                            <p className="text-xs text-muted">Cycle update: {nextBillingDate}</p>
                        </div>
                    </div>

                    <div className="billing-feature-grid">
                        <div className="billing-feature">
                            <div className="billing-feature__label">
                                <Activity size={14} />
                                <span>Requests Per Second</span>
                            </div>
                            <div className="billing-feature__value">{requestsPerSecond} RPS</div>
                        </div>
                        <div className="billing-feature">
                            <div className="billing-feature__label">
                                <ShieldCheck size={14} />
                                <span>Burst Capacity</span>
                            </div>
                            <div className="billing-feature__value">{burstLimit}</div>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    title="Payment Method"
                    description="Payment collection is not live yet, but your billing data is ready."
                    icon={CreditCard}
                >
                    <div className="billing-payment">
                        <p className="text-muted text-sm">
                            Stripe checkout has not been connected yet, so no card is stored.
                        </p>
                        <button className="btn btn--ghost btn--sm" disabled>
                            <Receipt size={14} />
                            Add Method
                        </button>
                    </div>
                </SectionCard>
            </div>

            <SectionCard
                title="Monthly Usage"
                description="Monitor your request consumption for the current billing cycle."
                icon={Activity}
            >
                <div className="billing-usage-row">
                    <span className="billing-usage-row__value">
                        {totalRequests.toLocaleString()} requests used
                    </span>
                    <span className="text-muted">
                        {usagePercent.toFixed(1)}% of {monthlyLimit.toLocaleString()} limit
                    </span>
                </div>
                <div className="billing-progress">
                    <div
                        className="billing-progress__bar"
                        style={{
                            width: `${usagePercent}%`,
                            background:
                                usagePercent > 90
                                    ? 'linear-gradient(90deg, var(--red-500), var(--orange-400))'
                                    : 'linear-gradient(90deg, var(--brand-500), var(--brand-400))',
                        }}
                    />
                </div>
                {usagePercent > 80 && (
                    <div className="billing-alert">
                        <AlertCircle size={18} />
                        <span>
                            You have crossed 80% of your monthly quota. Review plans soon to avoid
                            throttling or overage costs.
                        </span>
                    </div>
                )}

                <div className="billing-usage-grid">
                    <div className="billing-usage-tile">
                        <span className="billing-usage-tile__label">Used</span>
                        <strong>{totalRequests.toLocaleString()}</strong>
                    </div>
                    <div className="billing-usage-tile">
                        <span className="billing-usage-tile__label">Remaining</span>
                        <strong>{remainingRequests.toLocaleString()}</strong>
                    </div>
                    <div className="billing-usage-tile">
                        <span className="billing-usage-tile__label">Next Billing</span>
                        <strong>{nextBillingDate}</strong>
                    </div>
                </div>
            </SectionCard>

            <div className="plan-grid">
                <div className="card billing-callout">
                    <div className="billing-callout__icon">
                        <Clock className="text-muted" size={24} />
                    </div>
                    <h4>Weekly usage reports are next up</h4>
                    <p className="text-muted text-sm">
                        Automated summaries and invoice exports are on the roadmap. Your current
                        usage data is already being collected and displayed above.
                    </p>
                </div>
                <div className="card billing-faq">
                    <h4>Billing FAQ</h4>
                    <ul>
                        <li>
                            <p>How are overages calculated?</p>
                            <span className="text-muted">
                                Extra usage is measured against the plan overage rate shown above.
                            </span>
                        </li>
                        <li>
                            <p>Can I cancel anytime?</p>
                            <span className="text-muted">
                                Yes. Your current cycle stays active until the subscription end date.
                            </span>
                        </li>
                        <li>
                            <p>Why is payment disabled?</p>
                            <span className="text-muted">
                                Plan switching is live now; card collection is the next billing milestone.
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
