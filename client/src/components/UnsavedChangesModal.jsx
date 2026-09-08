import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function UnsavedChangesModal({ isOpen, onClose, onDiscard }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 17, 40, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid rgba(255, 107, 53, 0.4)',
          boxShadow: '0 25px 50px rgba(16, 27, 61, 0.25)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#4A5568',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255, 107, 53, 0.12)',
            color: '#FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <AlertTriangle size={28} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#101B3D', margin: '0 0 6px 0' }} className="font-heading">
            DISCARD CHANGES?
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#4A5568', margin: 0 }}>
            You have unsaved changes on this page. Are you sure you want to discard them?
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1, minHeight: '44px' }}>
            Continue Editing
          </button>
          <button onClick={onDiscard} className="btn btn-coral" style={{ flex: 1, minHeight: '44px' }}>
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
