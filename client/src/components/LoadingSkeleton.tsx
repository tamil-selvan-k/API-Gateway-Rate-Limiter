interface LoadingSkeletonProps {
    lines?: number;
    className?: string;
}

export default function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
    return (
        <div className={`skeleton-container ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton-line"
                    style={{ width: `${85 - i * 10}%` }}
                />
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="card skeleton-card">
            <div className="skeleton-line" style={{ width: '60%', height: '20px' }} />
            <div className="skeleton-line" style={{ width: '80%', height: '14px', marginTop: '12px' }} />
            <div className="skeleton-line" style={{ width: '40%', height: '14px', marginTop: '8px' }} />
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="skeleton-container">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="skeleton-row">
                    <div className="skeleton-line" style={{ width: '25%' }} />
                    <div className="skeleton-line" style={{ width: '35%' }} />
                    <div className="skeleton-line" style={{ width: '15%' }} />
                    <div className="skeleton-line" style={{ width: '10%' }} />
                </div>
            ))}
        </div>
    );
}
