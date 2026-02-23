import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import type { ApiKey } from './apiKeys.api';
import { fetchApiKeys, createApiKey, revokeApiKey } from './apiKeys.api';

const ApiKeysDashboard: React.FC = () => {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const accountId = 'enterprise_01'; // Mock account ID

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        try {
            const response = await fetchApiKeys(accountId);
            setKeys(response.data);
        } catch (error) {
            console.error('Failed to fetch keys', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async () => {
        const name = prompt('Enter a name for your API Key:');
        if (!name) return;

        try {
            await createApiKey({ accountId, name });
            loadKeys();
        } catch (error) {
            alert('Failed to create key');
        }
    };

    const handleRevokeKey = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this key?')) return;
        try {
            await revokeApiKey(id);
            loadKeys();
        } catch (error) {
            alert('Failed to revoke key');
        }
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-bold mb-1">API Keys</h2>
                    <p className="text-gray-400 text-sm">Manage access keys for your applications.</p>
                </div>
                <button
                    onClick={handleCreateKey}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18} />
                    Create New Key
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-700/50 rounded-xl" />)}
                    </div>
                ) : keys.length === 0 ? (
                    <div className="text-center py-16 bg-gray-700/20 rounded-2xl border-2 border-dashed border-gray-700">
                        <Key className="mx-auto mb-4 text-gray-500" size={48} />
                        <p className="text-gray-400">No API keys found. Create one to get started.</p>
                    </div>
                ) : (
                    keys.map((apiKey) => (
                        <div
                            key={apiKey.id}
                            className="bg-gray-700/30 p-5 rounded-xl border border-gray-700/50 flex items-center justify-between hover:border-gray-600 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-blue-400 border border-gray-700">
                                    <Key size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="text-gray-500 text-xs font-mono bg-gray-800 px-2 py-1 rounded">
                                            {apiKey.isActive ? apiKey.key.replace(/(.{6}).*(.{4})/, '$1****$2') : 'Revoked'}
                                        </code>
                                        {apiKey.isActive && (
                                            <button
                                                onClick={() => copyToClipboard(apiKey.key)}
                                                className="text-gray-500 hover:text-white transition-colors"
                                            >
                                                {copiedKey === apiKey.key ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${apiKey.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                    {apiKey.isActive ? 'Active' : 'Revoked'}
                                </span>
                                {apiKey.isActive && (
                                    <button
                                        onClick={() => handleRevokeKey(apiKey.id)}
                                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                        Revoke
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default ApiKeysDashboard;
