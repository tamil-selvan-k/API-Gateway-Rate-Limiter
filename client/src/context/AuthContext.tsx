import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import axiosInstance from '../api/axiosInstance';
import type { Account, ApiResponse, LoginResponse } from '../types/types';

interface AuthContextValue {
    user: Account | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Account | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate user on mount if token exists
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        (axiosInstance.get('/accounts/profile') as Promise<ApiResponse<Account>>)
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => {
                localStorage.removeItem('token');
                setUser(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = (await axiosInstance.post('/accounts/login', {
            email,
            password,
        })) as ApiResponse<LoginResponse>;

        localStorage.setItem('token', res.data.token);
        setUser(res.data.account);
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        await axiosInstance.post('/accounts/register', { name, email, password });
        // After successful registration, auto-login
        await login(email, password);
    }, [login]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
