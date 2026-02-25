import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../modules/auth/LoginPage';
import RegisterPage from '../modules/auth/RegisterPage';
import DashboardPage from '../modules/dashboard/DashboardPage';
import ApisPage from '../modules/apis/ApisPage';
import ApiKeysPage from '../modules/apiKeys/ApiKeysPage';
import AnalyticsPage from '../modules/analytics/AnalyticsPage';
import BillingPage from '../modules/billing/BillingPage';
import SettingsPage from '../modules/settings/SettingsPage';
import SubscriptionPage from '../modules/subscription/SubscriptionPage';
import ProfilePage from '../modules/profile/ProfilePage';

export default function AppRouter() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected dashboard routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="apis" element={<ApisPage />} />
                <Route path="api-keys" element={<ApiKeysPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
