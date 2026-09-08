import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Wallet, Bell, Sun, Moon, Menu, Activity, LogOut, User, Settings, ChevronDown } from 'lucide-react';

export default function Navbar({ onNavigate, onToggleMobileSidebar, openLogoutModal }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  return (
    <nav style={{
      height: '76px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* LEFT SIDE: HAMBURGER & GREETING */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile Hamburger Menu button */}
        <button
          onClick={onToggleMobileSidebar}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="mobile-only-nav"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {user ? (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.1, color: 'var(--text-primary)' }} className="font-heading">
              Good Morning, <span style={{ color: '#FF6B35' }}>{user.name || 'Kemparaj S'}</span> 👋
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Welcome Back!
            </span>
          </div>
        ) : (
          <div 
            onClick={() => onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#FF6B35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet color="#FFFFFF" size={22} />
            </div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }} className="font-heading">
              CAMPUS <span style={{ color: '#FF6B35' }}>CASH</span>
            </h1>
          </div>
        )}
      </div>

      {/* RIGHT SIDE CONTROLS: CAMPUS PULSE, THEME TOGGLE, NOTIFICATIONS, PROFILE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* Campus Pulse Live Badge */}
        <div style={{
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: 'rgba(255, 107, 53, 0.1)',
          color: '#FF6B35',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="desktop-sidebar">
          <Activity size={14} className="animate-pulse-dot" />
          <span>Campus Pulse: Live Now</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon size={18} style={{ color: '#101B3D' }} /> : <Sun size={18} style={{ color: '#FF6B35' }} />}
        </button>

        {user ? (
          <>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#FF6B35',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifMenu && (
                <div style={{
                  position: 'absolute',
                  top: '52px',
                  right: '0',
                  width: '340px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  boxShadow: '0 16px 36px rgba(16, 27, 61, 0.15)',
                  padding: '18px',
                  zIndex: 200
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }} className="font-heading">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => handleMarkRead('all')}
                        style={{ background: 'none', border: 'none', color: '#FF6B35', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No notifications yet</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '12px',
                            background: n.is_read ? 'transparent' : 'rgba(255, 107, 53, 0.08)',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FF6B35' }}>{n.title}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Badge */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '20px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)'
                }}
              >
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
                  fontSize: '0.95rem'
                }}>
                  {(user.name || 'K')[0]}
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  top: '52px',
                  right: 0,
                  width: '220px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(16, 27, 61, 0.12)',
                  borderRadius: '18px',
                  boxShadow: '0 16px 36px rgba(16, 27, 61, 0.15)',
                  padding: '12px',
                  zIndex: 200
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(16, 27, 61, 0.08)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#101B3D' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4A5568' }}>{user.role}</div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigate(user.role === 'STUDENT' ? '/student/wallet' : `/${user.role.toLowerCase()}`);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      color: '#101B3D',
                      textAlign: 'left'
                    }}
                  >
                    <User size={16} style={{ color: '#FF6B35' }} /> Profile & Wallet
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      openLogoutModal();
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      color: '#FF6B35',
                      fontWeight: 700,
                      textAlign: 'left',
                      marginTop: '4px'
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button onClick={() => onNavigate('/login')} className="btn btn-coral btn-sm">
            Sign In / Demo Login
          </button>
        )}
      </div>
    </nav>
  );
}
