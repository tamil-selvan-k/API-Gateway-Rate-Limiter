import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <AlertCircle size={48} className="error-boundary__icon" />
                    <h2>Something went wrong</h2>
                    <p className="error-boundary__message">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button className="btn btn--primary" onClick={this.handleReset}>
                        <RotateCcw size={16} />
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
