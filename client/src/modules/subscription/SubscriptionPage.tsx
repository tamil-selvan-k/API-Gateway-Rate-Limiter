import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Gem } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../components/Toast';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import type { ApiResponse, Plan, Subscription } from '../../types/types';
import type { AxiosError } from 'axios';

export default function SubscriptionPage() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const { data: plansRes, isLoading: plansLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: () => axiosInstance.get('/plans') as Promise<ApiResponse<Plan[]>>,
    });

    const { data: subscriptionRes, isLoading: subscriptionLoading } = useQuery({
        queryKey: ['subscription-status'],
        queryFn: () =>
            axiosInstance.get('/subscriptions/status') as Promise<ApiResponse<Subscription | null>>,
    });

    const currentPlanId = subscriptionRes?.data?.plan?.id;
    const plans = useMemo(
        () =>
            [...(plansRes?.data ?? [])].sort(
                (a, b) => Number(a.monthlyPrice) - Number(b.monthlyPrice),
            ),
        [plansRes?.data],
    );

    const purchaseMutation = useMutation({
        mutationFn: async (plan: Plan) => {
            if (currentPlanId) {
                return axiosInstance.post('/subscriptions/upgrade', {
                    newPlanId: plan.id,
                }) as Promise<ApiResponse<Subscription>>;
            }
            return axiosInstance.post('/subscriptions/subscribe', {
                planId: plan.id,
            }) as Promise<ApiResponse<Subscription>>;
        },
        onSuccess: (_, plan) => {
            queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
            showToast(`Plan switched to ${plan.name}`, 'success');
        },
        onError: (err: AxiosError<ApiResponse<unknown>>) => {
            showToast(err.response?.data?.message || 'Could not update plan', 'error');
        },
    });

    const formatPrice = (price: string) => {
        const amount = Number(price);
        if (Number.isNaN(amount)) return '$0';
        return `$${amount.toLocaleString()}`;
    };

    const getPlanActionLabel = (plan: Plan) => {
        if (!currentPlanId) return 'Choose Plan';
        if (plan.id === currentPlanId) return 'Current Plan';

        const current = plans.find((p) => p.id === currentPlanId);
        if (!current) return 'Switch Plan';

        return Number(plan.monthlyPrice) > Number(current.monthlyPrice)
            ? 'Upgrade Plan'
            : 'Downgrade Plan';
    };

    const isLoading = plansLoading || subscriptionLoading;

    return (
        <div>
            <div className="page-header">
                <h2>Subscription</h2>
                <p>Choose a plan that matches your API traffic and scaling needs</p>
            </div>

            <div className="subscription-banner">
                <div className="subscription-banner__icon">
                    <Gem size={20} />
                </div>
                <div>
                    <strong>Stripe integration is coming soon.</strong>
                    <p className="text-muted">For now, selecting a plan activates it immediately.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="plan-grid">
                    {[1, 2, 3].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : plans.length === 0 ? (
                <div className="empty-state">
                    <Gem size={48} className="empty-state__icon" />
                    <h3>No plans available</h3>
                    <p>Plan catalog is empty. Please add active plans from backend.</p>
                </div>
            ) : (
                <div className="plan-grid">
                    {plans.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;
                        const isPending = purchaseMutation.isPending && purchaseMutation.variables?.id === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`plan-card ${isCurrent ? 'plan-card--current' : ''}`}
                            >
                                <div className="plan-card__name">{plan.name}</div>
                                <p className="text-sm text-muted">
                                    {plan.description || 'Built for reliable API management at scale.'}
                                </p>
                                <div className="plan-card__price">
                                    {formatPrice(plan.monthlyPrice)}
                                    <span>/month</span>
                                </div>

                                <ul className="plan-card__features">
                                    <li>
                                        <Check size={16} />
                                        <span>
                                            {plan.monthlyRequestLimit.toLocaleString()} requests per month
                                        </span>
                                    </li>
                                    <li>
                                        <Check size={16} />
                                        <span>{plan.requestsPerSecond} requests per second</span>
                                    </li>
                                    <li>
                                        <Check size={16} />
                                        <span>{plan.burstLimit} burst limit</span>
                                    </li>
                                    <li>
                                        <Check size={16} />
                                        <span>
                                            Overage: $
                                            {Number(plan.overagePricePerMillion ?? 0).toLocaleString()}
                                            /1M requests
                                        </span>
                                    </li>
                                </ul>

                                <button
                                    className={`btn ${isCurrent ? 'btn--ghost' : 'btn--primary'} btn--full`}
                                    disabled={isCurrent || isPending}
                                    onClick={() => purchaseMutation.mutate(plan)}
                                >
                                    {isPending ? 'Processing...' : getPlanActionLabel(plan)}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
