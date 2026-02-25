import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { UserPlus, Zap } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '../../types/types';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(name, email, password);
            showToast('Account created successfully', 'success');
            navigate('/', { replace: true });
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<ApiResponse<unknown>>;
            showToast(axiosErr.response?.data?.message || 'Registration failed', 'error');
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
                    <h1>Create account</h1>
                    <p>Get started with your API Gateway</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                            autoComplete="name"
                        />
                    </div>

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
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner loading-spinner--sm" />
                        ) : (
                            <>
                                <UserPlus size={16} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
