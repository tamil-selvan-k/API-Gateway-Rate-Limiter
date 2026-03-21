import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SectionCardProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    footer?: React.ReactNode;
    isDanger?: boolean;
}

export default function SectionCard({
    title,
    description,
    icon: Icon,
    children,
    footer,
    isDanger = false,
}: SectionCardProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card ${isDanger ? 'card--danger' : ''}`}
            style={{
                marginBottom: '24px',
                border: isDanger ? '1px solid var(--danger-border)' : undefined,
                backgroundColor: isDanger ? 'var(--danger-bg-subtle)' : undefined,
            }}
        >
            <div className="card__header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {Icon && (
                    <div className={`icon-container ${isDanger ? 'icon-container--danger' : ''}`}>
                        <Icon size={20} className={isDanger ? 'text-danger' : 'text-primary'} />
                    </div>
                )}
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h3>
                    {description && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="card__content">
                {children}
            </div>

            {footer && (
                <div 
                    className="card__footer" 
                    style={{ 
                        marginTop: '24px', 
                        paddingTop: '20px', 
                        borderTop: '1px solid var(--border-light)',
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    {footer}
                </div>
            )}
        </motion.section>
    );
}
