import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, QrCode, Award, TrendingUp, FileText, Users, Shield, Bell, LogOut, Store, CreditCard } from 'lucide-react';

export default function Sidebar({ currentPath, onNavigate, openLogoutModal }) {
  const { user } = useAuth();
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
    { label: 'Dashboard', path: getHomePath(), icon: LayoutDashboard },
    { label: 'Parent', path: '/parent', icon: Users, roleLock: 'PARENT' },
    { label: 'Wallet Recharge', path: role === 'STUDENT' ? '/student/wallet' : getHomePath(), icon: CreditCard },
    { label: 'Student Wallet', path: '/student/wallet', icon: Wallet, roleLock: 'STUDENT' },
    { label: 'QR Payment', path: '/student', icon: QrCode, roleLock: 'STUDENT' },
    { label: 'Vendor', path: '/vendor', icon: Store, roleLock: 'VENDOR' },
    { label: 'Transaction Record', path: '/student/wallet', icon: FileText },
    { label: 'Parent Notification', path: '/parent', icon: Bell, roleLock: 'PARENT' },
    { label: 'AI Expense Tracker', path: '/student/ai-expense', icon: TrendingUp, roleLock: 'STUDENT' },
    { label: 'Rewards', path: '/student/rewards', icon: Award, roleLock: 'STUDENT' },
    { label: 'Monthly Reports', path: '/student/monthly-report', icon: FileText, roleLock: 'STUDENT' },
    { label: 'Admin Analytics', path: '/admin', icon: Shield, roleLock: 'ADMIN' }
  ];

  const visibleLinks = navItems.filter(item => {
    if (!item.roleLock) return true;
    return item.roleLock === role;
  });

  return (
    <aside style={{
      width: '260px',
      background: '#101B3D',
      color: '#FFFFFF',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      borderTopRightRadius: '24px',
      borderBottomRightRadius: '24px',
      padding: '24px 18px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 150,
      boxShadow: '8px 0 25px rgba(16, 27, 61, 0.15)'
    }} className="desktop-sidebar">
      
      <div>
        {/* Top Brand Header */}
        <div
          onClick={() => onNavigate(getHomePath())}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '32px', paddingLeft: '8px' }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: '#FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(255, 107, 53, 0.4)'
          }}>
            <Wallet color="#FFFFFF" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#FFFFFF', lineHeight: 1.1 }} className="font-heading">
              CAMPUS <span style={{ color: '#FF6B35' }}>CASH</span>
            </h1>
            <span style={{ fontSize: '0.65rem', color: '#CBD5E1', letterSpacing: '0.08em', fontWeight: 700 }}>
              SMART DIGITAL WALLET
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.label}
                onClick={() => onNavigate(link.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: isActive ? '#FF6B35' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  minHeight: '44px',
                  boxShadow: isActive ? '0 6px 16px rgba(255, 107, 53, 0.35)' : 'none'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#FFFFFF' : '#FF6B35'
                }}>
                  <Icon size={16} />
                </div>
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile & Prominent Logout Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '12px 14px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#FF6B35',
            color: '#FFFFFF',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            flexShrink: 0
          }}>
            {(user.name || 'K')[0]}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '2px' }}>{role}</div>
          </div>
        </div>

        <button
          onClick={openLogoutModal}
          aria-label="Logout"
          className="btn btn-coral"
          style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem', justifyContent: 'center' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

    </aside>
  );
}
