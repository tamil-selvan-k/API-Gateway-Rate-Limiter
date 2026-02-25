import axios from 'axios';
import type { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach Bearer token from localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error),
);

// Response interceptor — unwrap response.data, handle 401 globally
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Only redirect if we're not already on login/register
            const path = window.location.pathname;
            if (path !== '/login' && path !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

export default axiosInstance;
