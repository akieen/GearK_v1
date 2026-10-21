import React from 'react';
import { useToastState } from '../../context/ToastContext';
import Icons from './Icons';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastState();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          {toast.type === 'success' && <Icons.Check size={18} style={{ color: '#10B981' }} />}
          {toast.type === 'error' && <Icons.X size={18} style={{ color: '#EF4444' }} />}
          {toast.type === 'warning' && <Icons.Flame size={18} style={{ color: '#F59E0B' }} />}
          {toast.type === 'info' && <Icons.Sparkles size={18} style={{ color: '#3B82F6' }} />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ color: '#9CA3AF', padding: 2, display: 'flex' }}
          >
            <Icons.X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 480 }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            onClick={onClose}
            style={{ color: '#6B7280', display: 'flex', padding: 4 }}
          >
            <Icons.X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};
