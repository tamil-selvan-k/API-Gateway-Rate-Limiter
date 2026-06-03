import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'primary';
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'primary'
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={onClose}>
                    <motion.div
                        className="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal__header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {type === 'danger' && <AlertTriangle size={20} color="var(--red-400)" />}
                                <h3>{title}</h3>
                            </div>
                            <button className="modal__close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="modal__body">
                            <p style={{ color: 'var(--gray-400)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                {message}
                            </p>
                        </div>

                        <div className="modal__actions">
                            <button className="btn btn--ghost" onClick={onClose}>
                                {cancelText}
                            </button>
                            <button 
                                className={`btn ${type === 'danger' ? 'btn--danger' : 'btn--primary'}`} 
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
