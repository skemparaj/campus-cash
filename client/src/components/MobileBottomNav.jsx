import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Wallet, QrCode, Award, User, LogOut, X } from 'lucide-react';

export default function MobileBottomNav({ currentPath, onNavigate, openQRModal, openLogoutModal }) {
  const { user } = useAuth();
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  if (!user) return null;

  const role = user.role;

  const getHomePath = () => {
    if (role === 'STUDENT') return '/student';
    if (role === 'PARENT') return '/parent';
    if (role === 'VENDOR') return '/vendor';
    if (role === 'ADMIN') return '/admin';
    return '/';
  };

  const navItems = [
    { label: 'Home', icon: Home, path: getHomePath() },
    { label: 'Wallet', icon: Wallet, path: role === 'STUDENT' ? '/student/wallet' : getHomePath() },
    { label: 'SCAN', icon: QrCode, isScan: true },
    { label: 'Rewards', icon: Award, path: role === 'STUDENT' ? '/student/rewards' : getHomePath() },
    { label: 'Profile', icon: User, isProfile: true }
  ];

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70px',
          background: '#FFFFFF',
          borderTop: '1px solid rgba(16, 27, 61, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 12px',
          zIndex: 900,
          boxShadow: '0 -4px 20px rgba(16, 27, 61, 0.08)'
        }}
        className="mobile-only-nav"
      >
        {navItems.map((item, idx) => {
          if (item.isScan) {
            return (
              <button
                key={idx}
                onClick={openQRModal}
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: '#FF6B35',
                  border: '4px solid #FFFFFF',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px -4px rgba(255, 107, 53, 0.6)',
                  marginTop: '-24px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                title="Scan & Pay"
                aria-label="Scan QR Code"
              >
                <QrCode size={28} />
              </button>
            );
          }

          if (item.isProfile) {
            return (
              <button
                key={idx}
                onClick={() => setShowProfileDrawer(!showProfileDrawer)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  color: showProfileDrawer ? '#FF6B35' : '#101B3D',
                  fontSize: '0.72rem',
                  fontWeight: showProfileDrawer ? '700' : '500',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  minHeight: '44px'
                }}
                aria-label="Profile and Settings"
              >
                <User size={20} color={showProfileDrawer ? '#FF6B35' : '#101B3D'} />
                <span>Profile</span>
              </button>
            );
          }

          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={idx}
              onClick={() => onNavigate(item.path)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                color: isActive ? '#FF6B35' : '#101B3D',
                fontSize: '0.72rem',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '8px',
                minHeight: '44px'
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? '#FF6B35' : '#101B3D'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Profile Drawer */}
      {showProfileDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 17, 40, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileDrawer(false);
          }}
        >
          <div
            className="glass-card animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#FFFFFF',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              padding: '24px',
              border: '1px solid rgba(255, 107, 53, 0.4)',
              boxShadow: '0 -10px 40px rgba(16, 27, 61, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#FF6B35',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  {(user.name || 'K')[0]}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#101B3D' }}>{user.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: '#4A5568' }}>{user.role} • {user.email}</span>
                </div>
              </div>
              <button
                onClick={() => setShowProfileDrawer(false)}
                aria-label="Close profile drawer"
                style={{ background: 'none', border: 'none', color: '#4A5568', padding: '6px' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => {
                  setShowProfileDrawer(false);
                  onNavigate(getHomePath());
                }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', minHeight: '44px' }}
              >
                <Home size={18} /> Dashboard Home
              </button>
              {role === 'STUDENT' && (
                <button
                  onClick={() => {
                    setShowProfileDrawer(false);
                    onNavigate('/student/wallet');
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', minHeight: '44px' }}
                >
                  <Wallet size={18} /> Digital Wallet
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setShowProfileDrawer(false);
                openLogoutModal();
              }}
              className="btn btn-coral"
              style={{ width: '100%', minHeight: '46px', fontSize: '0.95rem' }}
            >
              <LogOut size={18} /> Logout Account
            </button>
          </div>
        </div>
      )}
    </>
  );
}
