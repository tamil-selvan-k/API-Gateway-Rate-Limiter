import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Plus, Trash2, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../components/Toast';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import type { ApiResponse, Api, CreateApiPayload, UpdateApiPayload } from '../../types/types';
import type { AxiosError } from 'axios';

export default function ApisPage() {
    const [showCreate, setShowCreate] = useState(false);
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const { data: apisRes, isLoading } = useQuery({
        queryKey: ['apis'],
        queryFn: () => axiosInstance.get('/apis?limit=100') as Promise<ApiResponse<Api[]>>,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateApiPayload) =>
            axiosInstance.post('/apis', data) as Promise<ApiResponse<Api>>,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apis'] });
            showToast('API created successfully', 'success');
            setShowCreate(false);
        },
        onError: (err: AxiosError<ApiResponse<unknown>>) => {
            showToast(err.response?.data?.message || 'Failed to create API', 'error');
        },
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            axiosInstance.patch(`/apis/${id}`, { isActive } as UpdateApiPayload) as Promise<
                ApiResponse<Api>
            >,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apis'] });
        },
        onError: (err: AxiosError<ApiResponse<unknown>>) => {
            showToast(err.response?.data?.message || 'Failed to update API', 'error');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            axiosInstance.delete(`/apis/${id}`) as Promise<ApiResponse<null>>,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apis'] });
            showToast('API deleted', 'success');
        },
        onError: (err: AxiosError<ApiResponse<unknown>>) => {
            showToast(err.response?.data?.message || 'Failed to delete API', 'error');
        },
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
            deleteMutation.mutate(id);
        }
    };

    const apis = apisRes?.data ?? [];

    return (
        <div>
            <div className="section-header">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h2>APIs</h2>
                    <p>Manage your API endpoints and gateway routing</p>
                </div>
                <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
                    <Plus size={16} />
                    Create API
                </button>
            </div>

            {isLoading ? (
                <TableSkeleton rows={4} />
            ) : apis.length === 0 ? (
                <div className="empty-state">
                    <Globe size={48} className="empty-state__icon" />
                    <h3>No APIs yet</h3>
                    <p>Create your first API to start routing traffic through the gateway.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Gateway ID</th>
                                <th>Upstream URL</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apis.map((api) => (
                                <tr key={api.id}>
                                    <td style={{ fontWeight: 600 }}>{api.name}</td>
                                    <td>
                                        <code className="font-mono text-xs" style={{ color: 'var(--gray-400)' }}>
                                            {api.gatewayId}
                                        </code>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className="truncate" style={{ maxWidth: '240px' }}>
                                                {api.upstreamBaseUrl}
                                            </span>
                                            <a
                                                href={api.upstreamBaseUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ color: 'var(--gray-500)' }}
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </td>
                                    <td>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={api.isActive}
                                                onChange={() =>
                                                    toggleMutation.mutate({ id: api.id, isActive: !api.isActive })
                                                }
                                            />
                                            <span className="toggle__slider" />
                                        </label>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn--danger btn--sm"
                                            onClick={() => handleDelete(api.id, api.name)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create API Modal */}
            <AnimatePresence>
                {showCreate && (
                    <CreateApiModal
                        onClose={() => setShowCreate(false)}
                        onSubmit={(data) => createMutation.mutate(data)}
                        loading={createMutation.isPending}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Create API Modal ───
interface CreateApiModalProps {
    onClose: () => void;
    onSubmit: (data: CreateApiPayload) => void;
    loading: boolean;
}

function CreateApiModal({ onClose, onSubmit, loading }: CreateApiModalProps) {
    const [name, setName] = useState('');
    const [upstreamBaseUrl, setUpstreamBaseUrl] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({ name, upstreamBaseUrl });
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
                    <h3>Create New API</h3>
                    <button className="modal__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="api-name">Name</label>
                        <input
                            id="api-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My API"
                            required
                            minLength={3}
                            maxLength={50}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="api-url">Upstream Base URL</label>
                        <input
                            id="api-url"
                            type="url"
                            value={upstreamBaseUrl}
                            onChange={(e) => setUpstreamBaseUrl(e.target.value)}
                            placeholder="https://api.example.com"
                            required
                        />
                        <span className="text-xs text-muted" style={{ marginTop: '4px', display: 'block' }}>
                            Must use HTTPS
                        </span>
                    </div>
                    <div className="modal__actions">
                        <button type="button" className="btn btn--ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary" disabled={loading}>
                            {loading ? <span className="loading-spinner loading-spinner--sm" /> : 'Create API'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
