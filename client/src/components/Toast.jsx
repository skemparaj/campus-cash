import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="text-mint" size={20} />;
      case 'error': return <XCircle className="text-danger" size={20} />;
      case 'warning': return <AlertCircle className="text-warning" size={20} />;
      default: return <Info className="text-violet" size={20} />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 20px',
      borderRadius: '16px',
      background: 'rgba(23, 27, 46, 0.92)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      color: '#F8F7F2',
      maxWidth: '400px',
      animation: 'slideUp 0.3s ease-out'
    }}>
      {getIcon()}
      <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{toast.message}</span>
    </div>
  );
}
