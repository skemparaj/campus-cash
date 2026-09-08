import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login, showToast } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');

  const demoAccounts = [
    { label: 'Student Demo', email: 'student@campuscash.demo', pass: 'Student@123', role: 'STUDENT', name: 'Kemparaj S', color: '#FF6B35', desc: '₹1,850 Balance • QR Pay • AI Expense' },
    { label: 'Parent Demo', email: 'parent@campuscash.demo', pass: 'Parent@123', role: 'PARENT', name: 'Dhanusri S', color: '#101B3D', desc: 'Remote Recharge • Limits • Payment Alerts' },
    { label: 'Vendor Demo', email: 'vendor@campuscash.demo', pass: 'Vendor@123', role: 'VENDOR', name: 'Campus Canteen', color: '#FF6B35', desc: 'POS Terminal • Dynamic QR • Live Sales' },
    { label: 'Admin Demo', email: 'admin@campuscash.demo', pass: 'Admin@123', role: 'ADMIN', name: 'Campus Officer', color: '#101B3D', desc: 'Campus Pulse • User Control • Audit Log' }
  ];

  const handleQuickDemoLogin = async (account) => {
    setLoading(true);
    try {
      const res = await api.login({ email: account.email, password: account.pass });
      if (res.success) {
        login(res.token, res.user);
        onNavigate(`/${res.user.role.toLowerCase()}`);
      }
    } catch (err) {
      showToast(err.message || 'Demo Login Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({ email, password, name, role });
        if (res.success) {
          login(res.token, res.user);
          showToast('Account registered successfully!', 'success');
          onNavigate(`/${res.user.role.toLowerCase()}`);
        }
      } else {
        const res = await api.login({ email, password });
        if (res.success) {
          login(res.token, res.user);
          onNavigate(`/${res.user.role.toLowerCase()}`);
        }
      }
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 76px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'transparent',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ width: '100%', maxWidth: '1100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '36px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: DEMO ACCOUNTS */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <span className="badge badge-coral" style={{ marginBottom: '10px' }}>
              <Sparkles size={14} /> DEMO MODE ENABLED
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">
              SINGLE-CLICK <span style={{ color: '#FF6B35' }}>DEMO LOGIN</span>
            </h2>
            <p style={{ color: '#4A5568', fontSize: '0.92rem', marginTop: '6px' }}>
              Test any campus role instantly with pre-loaded virtual balance and records:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {demoAccounts.map(acc => (
              <div
                key={acc.role}
                className="glass-card glass-card-hover"
                onClick={() => handleQuickDemoLogin(acc)}
                style={{
                  padding: '18px 22px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: `4px solid ${acc.color}`,
                  background: '#FFFFFF',
                  borderTop: '1px solid rgba(16, 27, 61, 0.12)',
                  borderRight: '1px solid rgba(16, 27, 61, 0.12)',
                  borderBottom: '1px solid rgba(16, 27, 61, 0.12)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#101B3D' }}>{acc.label}</span>
                    <span className="badge badge-coral" style={{ fontSize: '0.65rem' }}>DEMO ACCOUNT</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#4A5568', marginTop: '3px' }}>{acc.name} • {acc.email}</div>
                  <div style={{ fontSize: '0.74rem', color: '#718096', marginTop: '2px' }}>{acc.desc}</div>
                </div>
                <button className="btn btn-sm btn-coral">
                  Login <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '24px',
            padding: '18px',
            borderRadius: '20px',
            background: '#FFFFFF',
            border: '1px solid rgba(16, 27, 61, 0.12)',
            fontSize: '0.84rem',
            color: '#4A5568'
          }}>
            <div style={{ fontWeight: 700, color: '#101B3D', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#FF6B35' }} /> Role-Based Access Control Active
            </div>
            All routes are guarded with JWT authentication. Students cannot access Admin or Parent portals.
          </div>
        </div>

        {/* RIGHT COLUMN: MANUAL AUTH FORM */}
        <div className="glass-card" style={{
          padding: '36px',
          borderRadius: '28px',
          background: '#FFFFFF',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          boxShadow: '0 25px 50px rgba(16, 27, 61, 0.12)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#101B3D' }} className="font-heading">
              {isRegister ? 'CREATE ACCOUNT' : 'SECURE SIGN IN'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#4A5568', marginTop: '6px' }}>
              {isRegister ? 'Join Campus Cash cashless ecosystem' : 'Sign in to access your digital wallet'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#101B3D' }}>Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kemparaj S"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#101B3D' }}>Select Account Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="PARENT">Parent</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label" style={{ color: '#101B3D' }}>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="student@campuscash.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ color: '#101B3D' }}>Password</label>
                {!isRegister && (
                  <span
                    onClick={() => showToast('Demo Passwords: Student@123, Parent@123, Vendor@123, Admin@123', 'info')}
                    style={{ fontSize: '0.78rem', color: '#FF6B35', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Forgot Password?
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#4A5568',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-coral btn-lg"
              style={{ width: '100%', marginTop: '12px' }}
            >
              {loading ? 'Authenticating...' : (isRegister ? 'Complete Registration' : 'Sign In')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ fontSize: '0.88rem', color: '#4A5568' }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', border: 'none', color: '#FF6B35', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
            >
              {isRegister ? 'Sign In Here' : 'Register Account'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
