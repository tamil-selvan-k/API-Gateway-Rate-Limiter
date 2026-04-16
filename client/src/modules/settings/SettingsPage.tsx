import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Globe, Monitor, Save, Shield, Trash2, User } from 'lucide-react';
import SectionCard from '../../components/SectionCard';
import settingsService from '../../api/settingsService';
import axiosInstance from '../../api/axiosInstance';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import type { Api, ApiResponse } from '../../types/types';

const DEFAULT_THEME = 'system' as const;
const DEFAULT_USAGE_THRESHOLD = 80;
const DEFAULT_KEY_EXPIRY_DAYS = 90;

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isProfileHydrated, setIsProfileHydrated] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [securityForm, setSecurityForm] = useState({
        currentPassword: '',
        newPassword: '',
        weeklyUsageSummary: false,
    });
    const [preferencesForm, setPreferencesForm] = useState({
        theme: DEFAULT_THEME,
        usageAlertThreshold: DEFAULT_USAGE_THRESHOLD,
        defaultApiKeyExpiryDays: DEFAULT_KEY_EXPIRY_DAYS,
    });
    const [apiTimeouts, setApiTimeouts] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!successMessage) return;
        const timer = setTimeout(() => setSuccessMessage(null), 3000);
        return () => clearTimeout(timer);
    }, [successMessage]);

    const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
    });

    const { data: apisData } = useQuery({
        queryKey: ['apis'],
        queryFn: () => axiosInstance.get('/apis?limit=100') as Promise<ApiResponse<Api[]>>,
    });

    const account = settingsData?.data.account;
    const settings = settingsData?.data.settings;
    const apis = apisData?.data ?? [];

    useEffect(() => {
        if (!account) {
            setIsProfileHydrated(false);
            return;
        }
        setProfileForm({ name: account.name ?? '', email: account.email ?? '' });
        setIsProfileHydrated(true);
    }, [account?.email, account?.name]);

    useEffect(() => {
        setSecurityForm((current) => ({
            ...current,
            weeklyUsageSummary: settings?.weeklyUsageSummary ?? false,
        }));
        setPreferencesForm({
            theme: settings?.theme ?? DEFAULT_THEME,
            usageAlertThreshold: settings?.usageAlertThreshold ?? DEFAULT_USAGE_THRESHOLD,
            defaultApiKeyExpiryDays: settings?.defaultApiKeyExpiryDays ?? DEFAULT_KEY_EXPIRY_DAYS,
        });
    }, [
        settings?.defaultApiKeyExpiryDays,
        settings?.theme,
        settings?.usageAlertThreshold,
        settings?.weeklyUsageSummary,
    ]);

    useEffect(() => {
        setApiTimeouts(
            apis.reduce<Record<string, string>>((drafts, api) => {
                drafts[api.id] = String(api.requestTimeoutMs ?? 10000);
                return drafts;
            }, {}),
        );
    }, [apis]);

    const updateProfileMutation = useMutation({
        mutationFn: settingsService.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setSuccessMessage('Profile updated successfully');
        },
    });

    const updateSecurityMutation = useMutation({
        mutationFn: settingsService.updateSecurity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setSecurityForm((current) => ({ ...current, currentPassword: '', newPassword: '' }));
            setSuccessMessage('Security settings updated');
        },
    });

    const updatePreferencesMutation = useMutation({
        mutationFn: settingsService.updatePreferences,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setSuccessMessage('Preferences saved');
        },
    });

    const updateApiTimeoutMutation = useMutation({
        mutationFn: ({ apiId, timeoutMs }: { apiId: string; timeoutMs: number }) =>
            settingsService.updateApiTimeout(apiId, timeoutMs),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apis'] });
            setSuccessMessage('API timeout updated');
        },
    });

    const deleteAccountMutation = useMutation({
        mutationFn: settingsService.deleteAccount,
        onSuccess: () => {
            window.location.href = '/login';
        },
    });

    const saveSecurity = () => {
        const payload: {
            currentPassword?: string;
            newPassword?: string;
            weeklyUsageSummary: boolean;
        } = {
            weeklyUsageSummary: securityForm.weeklyUsageSummary,
        };

        if (securityForm.currentPassword.trim()) payload.currentPassword = securityForm.currentPassword;
        if (securityForm.newPassword.trim()) payload.newPassword = securityForm.newPassword;

        updateSecurityMutation.mutate(payload);
    };

    const savePreferences = () => {
        updatePreferencesMutation.mutate({
            theme: preferencesForm.theme,
            usageAlertThreshold: preferencesForm.usageAlertThreshold,
            defaultApiKeyExpiryDays: preferencesForm.defaultApiKeyExpiryDays,
        });
    };

    const saveApiTimeout = (api: Api) => {
        const parsed = Number.parseInt(apiTimeouts[api.id] ?? '', 10);
        if (Number.isNaN(parsed) || parsed < 1000 || parsed > 60000 || parsed === api.requestTimeoutMs) return;
        updateApiTimeoutMutation.mutate({ apiId: api.id, timeoutMs: parsed });
    };

    if (isLoadingSettings) {
        return (
            <div>
                <div className="page-header">
                    <h2>Settings</h2>
                    <p>Manage your organization's configuration and security</p>
                </div>
                <div className="plan-grid">
                    {[1, 2, 3].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="settings-container" style={{ maxWidth: '880px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Settings</h2>
                <p className="text-muted">Manage your organization's configuration and security</p>
            </div>
            {successMessage && (
                <div className="alert alert--success" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} />
                    <span>{successMessage}</span>
                </div>
            )}

            <SectionCard
                title="Organization Profile"
                description="Fetched account details are shown here and can be edited."
                icon={User}
                footer={
                    <button
                        className="btn btn--primary"
                        onClick={() => updateProfileMutation.mutate({ name: profileForm.name.trim(), email: profileForm.email.trim() })}
                        disabled={updateProfileMutation.isPending || !isProfileHydrated || !profileForm.name.trim() || !profileForm.email.trim()}
                    >
                        <Save size={16} />
                        <span>Save Changes</span>
                    </button>
                }
            >
                {!isProfileHydrated ? (
                    <CardSkeleton />
                ) : (
                    <>
                        <div className="form-group">
                            <label htmlFor="org-name">Organization Name</label>
                            <input id="org-name" type="text" className="input" value={profileForm.name} onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))} />
                        </div>
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label htmlFor="org-email">Admin Email</label>
                            <input id="org-email" type="email" className="input" value={profileForm.email} onChange={(e) => setProfileForm((current) => ({ ...current, email: e.target.value }))} />
                        </div>
                    </>
                )}
            </SectionCard>

            <SectionCard title="Appearance" description="Your current theme is fetched and can be changed before saving." icon={Monitor}>
                <div className="theme-toggle-group" style={{ display: 'flex', gap: '12px' }}>
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                        <button
                            key={theme}
                            className={`btn ${preferencesForm.theme === theme ? 'btn--primary' : 'btn--outline'}`}
                            style={{ flex: 1, textTransform: 'capitalize' }}
                            disabled={updatePreferencesMutation.isPending}
                            onClick={() => {
                                setPreferencesForm((current) => ({ ...current, theme }));
                                updatePreferencesMutation.mutate({ theme });
                            }}
                        >
                            {theme}
                        </button>
                    ))}
                </div>
            </SectionCard>

            <SectionCard
                title="Security"
                description="Passwords stay blank until you choose to change them. Other settings are loaded from your account."
                icon={Shield}
                footer={
                    <button className="btn btn--primary" onClick={saveSecurity} disabled={updateSecurityMutation.isPending}>
                        <Save size={16} />
                        <span>Update Security</span>
                    </button>
                }
            >
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label htmlFor="curr-pass">Current Password</label>
                        <input id="curr-pass" type="password" className="input" placeholder="Required only to change password" value={securityForm.currentPassword} onChange={(e) => setSecurityForm((current) => ({ ...current, currentPassword: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="new-pass">New Password</label>
                        <input id="new-pass" type="password" className="input" placeholder="Leave blank to keep current password" value={securityForm.newPassword} onChange={(e) => setSecurityForm((current) => ({ ...current, newPassword: e.target.value }))} />
                    </div>
                </div>
                <div className="checkbox-group" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input id="weekly-alert" type="checkbox" checked={securityForm.weeklyUsageSummary} onChange={(e) => setSecurityForm((current) => ({ ...current, weeklyUsageSummary: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="weekly-alert" style={{ margin: 0, fontWeight: 500 }}>Receive weekly usage summary via email</label>
                </div>
            </SectionCard>

            <SectionCard
                title="GateZentry Behaviour"
                description="Fetched preferences are editable here, including per-API timeout values."
                icon={Globe}
                footer={
                    <button className="btn btn--primary" onClick={savePreferences} disabled={updatePreferencesMutation.isPending}>
                        <Save size={16} />
                        <span>Save Preferences</span>
                    </button>
                }
            >
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label htmlFor="usage-threshold">Usage Alert Threshold (%)</label>
                        <input id="usage-threshold" type="number" className="input" min="0" max="100" value={preferencesForm.usageAlertThreshold} onChange={(e) => setPreferencesForm((current) => ({ ...current, usageAlertThreshold: Number.parseInt(e.target.value || '0', 10) }))} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="key-expiry">Default API Key Expiry (Days)</label>
                        <input id="key-expiry" type="number" className="input" min="1" value={preferencesForm.defaultApiKeyExpiryDays} onChange={(e) => setPreferencesForm((current) => ({ ...current, defaultApiKeyExpiryDays: Number.parseInt(e.target.value || '1', 10) }))} />
                    </div>
                </div>

                <div className="sub-section" style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>Individual API Timeouts</h4>
                    <div className="api-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {apis.map((api) => (
                            <div key={api.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                                <span>{api.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="number" className="input" min="1000" max="60000" style={{ width: '110px', padding: '4px 8px' }} value={apiTimeouts[api.id] ?? ''} onChange={(e) => setApiTimeouts((current) => ({ ...current, [api.id]: e.target.value }))} onBlur={() => saveApiTimeout(api)} />
                                    <span className="text-muted">ms</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Danger Zone" description="Irreversible actions for your organization account." icon={AlertTriangle} isDanger>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Delete Organization Account</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>This will disable all APIs and delete all associated data.</p>
                    </div>
                    <button className="btn btn--danger" onClick={() => { if (window.confirm('Are you absolutely sure? This action is irreversible.')) deleteAccountMutation.mutate(); }} disabled={deleteAccountMutation.isPending}>
                        <Trash2 size={16} />
                        <span>Delete Account</span>
                    </button>
                </div>
            </SectionCard>
        </div>
    );
}
