import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Globe,
    Key,
    BarChart3,
    Gem,
    Settings,
    LogOut,
    Zap,
    Menu,
    X,
    RefreshCw,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import type { ApiResponse, Subscription } from '../types/types';

const NAV_ITEMS = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/apis', icon: Globe, label: 'APIs' },
    { to: '/api-keys', icon: Key, label: 'API Keys' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/subscription', icon: Gem, label: 'Subscription' },
] as const;

const BOTTOM_NAV = [
    { to: '/settings', icon: Settings, label: 'Settings' },
] as const;

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });

    const { data: subscription } = useQuery({
        queryKey: ['subscription-status'],
        queryFn: () =>
            axiosInstance.get('/subscriptions/status') as Promise<ApiResponse<Subscription | null>>,
    });

    const planName = subscription?.data?.plan?.name ?? 'No Plan';

    useEffect(() => {
        setIsMobileNavOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    const handleLogout = () => {
        if (!window.confirm('Are you sure you want to logout?')) return;
        logout();
    };

    const handleSync = () => {
        window.location.reload();
    };

    return (
        <div className={`dashboard ${isSidebarCollapsed ? 'dashboard--sidebar-collapsed' : ''}`}>
            {isMobileNavOpen && (
                <button
                    className="sidebar-backdrop"
                    onClick={() => setIsMobileNavOpen(false)}
                    aria-label="Close navigation menu"
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileNavOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar__brand">
                    <div className="sidebar__logo">
                        <Zap size={20} />
                    </div>
                    <span className="sidebar__title">API Gateway</span>
                    <button
                        className="sidebar__close"
                        onClick={() => setIsMobileNavOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="sidebar__nav">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                            }
                        >
                            {({ isActive }) => (
                                <motion.div
                                    className="sidebar__link-inner"
                                    whileHover={{ x: 4 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <Icon size={18} className={isActive ? 'icon--active' : ''} />
                                    <span>{label}</span>
                                </motion.div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar__bottom">
                    <div className="sidebar__plan-card">
                        <span className="sidebar__plan-label">Current Plan</span>
                        <span className="sidebar__plan-name">{planName}</span>
                    </div>
                    <div className="sidebar__divider" />
                    {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                            }
                        >
                            <div className="sidebar__link-inner">
                                <Icon size={18} />
                                <span>{label}</span>
                            </div>
                        </NavLink>
                    ))}
                </div>
            </aside>

            {/* Main content area */}
            <div className="main-area">
                {/* Top bar */}
                <header className="topbar">
                    <div className="topbar__left">
                        <button
                            className="mobile-nav-btn"
                            onClick={() => setIsMobileNavOpen(true)}
                            aria-label="Open navigation menu"
                        >
                            <Menu size={18} />
                        </button>
                        <button
                            className="sidebar-toggle-btn"
                            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                        </button>
                        <h1 className="topbar__title">{user?.name ?? 'Dashboard'}</h1>
                    </div>
                    <div className="topbar__right">
                        <button className="btn btn--ghost btn--sm sync-btn" onClick={handleSync}>
                            <RefreshCw size={14} />
                            <span>Sync</span>
                        </button>
                        <span className="badge badge--plan">{planName}</span>
                        <NavLink to="/profile" className="topbar__avatar-link" aria-label="Open profile page">
                            <div className="topbar__avatar">
                                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                            </div>
                        </NavLink>
                        <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
