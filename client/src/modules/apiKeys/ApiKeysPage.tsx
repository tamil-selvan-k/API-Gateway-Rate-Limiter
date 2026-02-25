import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Plus, RotateCcw, ShieldOff, Copy, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import type { ApiResponse, Api, ApiKey, CreateApiKeyPayload } from '../../types/types';
import type { AxiosError } from 'axios';

export default function ApiKeysPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedApiId, setSelectedApiId] = useState<string>('');
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Fetch APIs for the dropdown
    const { data: apisRes } = useQuery({
        queryKey: ['apis'],
        queryFn: () => axiosInstance.get('/apis?limit=100') as Promise<ApiResponse<Api[]>>,
    });

    const apis = apisRes?.data ?? [];

    // Auto-select first API
    const activeApiId = selectedApiId || (apis.length > 0 ? apis[0].id : '');

    // Fetch keys for selected API
    const { data: keysRes, isLoading: keysLoading } = useQuery({
        queryKey: ['api-keys', activeApiId],
        queryFn: () =>
            axiosInstance.get(`/api-keys/api/${activeApiId}`) as Promise<ApiResponse<ApiKey[]>>,
        enabled: !!activeApiId,
    });

    const keys = keysRes?.data ?? [];

    // Create key mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateApiKeyPayload) =>
            axiosInstance.post('/api-keys', data) as Promise<ApiResponse<ApiKey>>,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['api-keys', activeApiId] });
            queryClient.invalidateQueries({ queryKey: ['api-keys-account'] });
            setNewKeyRaw(res.data.key);
            setShowCreate(false);
            showToast('API Key created — copy it now!', 'success');
        },
        onError: (err: AxiosError<ApiResponse<unknown>>) => {
            showToast(err.response?.data?.message || 'Failed to create key', 'error');
        },
    });

    // Revoke mutation
    const revokeMutation = useMutation({
        mutationFn: (id: string) =>
            axiosInstance.patch(`/api-keys/${id}/revoke`) as Promise<ApiResponse<ApiKey>>,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys', activeApiId] });
            queryClient.invalidateQueries({ queryKey: ['api-keys-account'] });
            showToast('Key revoked', 'success');
        },
        onError: (err: AxiosError<ApiResponse<unknown>>) => {
            showToast(err.response?.data?.message || 'Failed to revoke key', 'error');
        },
    });

    // Rotate mutation
    const rotateMutation = useMutation({
        mutationFn: (id: string) =>
            axiosInstance.post(`/api-keys/${id}/rotate`) as Promise<ApiResponse<ApiKey>>,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['api-keys', activeApiId] });
            queryClient.invalidateQueries({ queryKey: ['api-keys-account'] });
            setNewKeyRaw(res.data.key);
            showToast('Key rotated — copy the new key!', 'success');
        },
        onError: (err: AxiosError<ApiResponse<unknown>>) => {
            showToast(err.response?.data?.message || 'Failed to rotate key', 'error');
        },
    });

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const maskKey = (key: string) => {
        if (key.length > 10) {
            return key.slice(0, 6) + '••••••' + key.slice(-4);
        }
        return '••••••••';
    };

    return (
        <div>
            <div className="section-header">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h2>API Keys</h2>
                    <p>Manage access keys for your APIs</p>
                </div>
                <div className="flex items-center gap-3">
                    {apis.length > 0 && (
                        <div className="select-stack">
                            <span className="select-stack__label">Selected API</span>
                            <div className="select-wrapper">
                                <select
                                    value={activeApiId}
                                    onChange={(e) => setSelectedApiId(e.target.value)}
                                >
                                    {apis.map((api) => (
                                        <option key={api.id} value={api.id}>
                                            {api.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    <button
                        className="btn btn--primary"
                        onClick={() => setShowCreate(true)}
                        disabled={!activeApiId}
                    >
                        <Plus size={16} />
                        Create Key
                    </button>
                </div>
            </div>

            {/* New key display */}
            <AnimatePresence>
                {newKeyRaw && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                    >
                        <div className="card" style={{ borderColor: 'var(--green-500)', borderWidth: '1px' }}>
                            <div className="flex items-center justify-between mb-4">
                                <span style={{ fontWeight: 600, color: 'var(--green-400)' }}>
                                    🔑 New API Key — Copy it now! It won't be shown again.
                                </span>
                                <button
                                    className="btn btn--ghost btn--sm"
                                    onClick={() => setNewKeyRaw(null)}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="key-display">
                                <code>{newKeyRaw}</code>
                                <button
                                    className="btn btn--ghost btn--sm"
                                    onClick={() => handleCopy(newKeyRaw)}
                                >
                                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keys table */}
            {!activeApiId ? (
                <div className="empty-state">
                    <Key size={48} className="empty-state__icon" />
                    <h3>No APIs available</h3>
                    <p>Create an API first, then you can generate API keys for it.</p>
                </div>
            ) : keysLoading ? (
                <TableSkeleton rows={4} />
            ) : keys.length === 0 ? (
                <div className="empty-state">
                    <Key size={48} className="empty-state__icon" />
                    <h3>No API keys yet</h3>
                    <p>Create a key to authenticate requests to this API.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Key</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((apiKey) => (
                                <tr key={apiKey.id}>
                                    <td style={{ fontWeight: 600 }}>{apiKey.name}</td>
                                    <td>
                                        <code className="font-mono text-xs" style={{ color: 'var(--gray-400)' }}>
                                            {apiKey.isActive ? maskKey(apiKey.key) : 'Revoked'}
                                        </code>
                                    </td>
                                    <td>
                                        <span className={`badge ${apiKey.isActive ? 'badge--active' : 'badge--inactive'}`}>
                                            {apiKey.isActive ? 'Active' : 'Revoked'}
                                        </span>
                                    </td>
                                    <td className="text-sm text-muted">
                                        {new Date(apiKey.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        {apiKey.isActive && (
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn--ghost btn--sm"
                                                    onClick={() => {
                                                        if (window.confirm('Rotate this key? The old key will be revoked.')) {
                                                            rotateMutation.mutate(apiKey.id);
                                                        }
                                                    }}
                                                    title="Rotate key"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                                <button
                                                    className="btn btn--danger btn--sm"
                                                    onClick={() => {
                                                        if (window.confirm('Revoke this key? It cannot be undone.')) {
                                                            revokeMutation.mutate(apiKey.id);
                                                        }
                                                    }}
                                                    title="Revoke key"
                                                >
                                                    <ShieldOff size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Key Modal */}
            <AnimatePresence>
                {showCreate && user && (
                    <CreateKeyModal
                        accountId={user.id}
                        apiId={activeApiId}
                        onClose={() => setShowCreate(false)}
                        onSubmit={(data) => createMutation.mutate(data)}
                        loading={createMutation.isPending}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Create Key Modal ───
interface CreateKeyModalProps {
    accountId: string;
    apiId: string;
    onClose: () => void;
    onSubmit: (data: CreateApiKeyPayload) => void;
    loading: boolean;
}

function CreateKeyModal({ accountId, apiId, onClose, onSubmit, loading }: CreateKeyModalProps) {
    const [name, setName] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({
            accountId,
            apiId,
            name,
            ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
        });
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    <h3>Create API Key</h3>
                    <button className="modal__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="key-name">Key Name</label>
                        <input
                            id="key-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Production Key"
                            required
                            minLength={3}
                            maxLength={50}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="key-expires">Expiry Date (optional)</label>
                        <input
                            id="key-expires"
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                        />
                    </div>
                    <div className="modal__actions">
                        <button type="button" className="btn btn--ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary" disabled={loading}>
                            {loading ? <span className="loading-spinner loading-spinner--sm" /> : 'Generate Key'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
