import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { LogIn, Zap } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '../../types/types';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            showToast('Login successful', 'success');
            navigate('/', { replace: true });
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<ApiResponse<unknown>>;
            showToast(axiosErr.response?.data?.message || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card__header">
                    <div className="auth-card__logo">
                        <Zap size={24} />
                    </div>
                    <h1>Welcome back</h1>
                    <p>Sign in to your API Gateway account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner loading-spinner--sm" />
                        ) : (
                            <>
                                <LogIn size={16} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
