import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PageHeader({
  title,
  subtitle,
  showBack = true,
  onNavigate,
  backFallback,
  onBackClick,
  children
}) {
  const { user } = useAuth();

  const getRoleDashboard = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'PARENT': return '/parent';
      case 'VENDOR': return '/vendor';
      case 'ADMIN': return '/admin';
      case 'STUDENT':
      default:
        return '/student';
    }
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }

    const defaultTarget = backFallback || getRoleDashboard();

    if (window.history.length > 2) {
      window.history.back();
    } else if (onNavigate) {
      onNavigate(defaultTarget);
    } else {
      window.location.href = defaultTarget;
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="btn-back"
            style={{
              height: '44px',
              minWidth: '44px',
              padding: '0 16px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '1px solid rgba(16, 27, 61, 0.2)',
              color: '#101B3D',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 27, 61, 0.05)',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        )}

        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D', margin: 0 }} className="font-heading">
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: '#4A5568', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {children}
        </div>
      )}
    </div>
  );
}
