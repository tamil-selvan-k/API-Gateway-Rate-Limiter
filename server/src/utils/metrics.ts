type MetricsSnapshot = {
    startedAt: string;
    totalRequests: number;
    totalErrors: number;
    totalLatencyMs: number;
};

const metrics: MetricsSnapshot = {
    startedAt: new Date().toISOString(),
    totalRequests: 0,
    totalErrors: 0,
    totalLatencyMs: 0,
};

export const recordRequest = (statusCode: number, latencyMs: number) => {
    metrics.totalRequests += 1;
    metrics.totalLatencyMs += latencyMs;
    if (statusCode >= 500) {
        metrics.totalErrors += 1;
    }
};

export const getMetricsSnapshot = () => {
    const avgLatencyMs = metrics.totalRequests > 0
        ? Math.round(metrics.totalLatencyMs / metrics.totalRequests)
        : 0;

    return {
        ...metrics,
        avgLatencyMs,
    };
};
