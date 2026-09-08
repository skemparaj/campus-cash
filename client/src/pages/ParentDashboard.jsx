import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, Sliders, RefreshCw, Plus } from 'lucide-react';

export default function ParentDashboard({ openRechargeModal }) {
  const { showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Spending Limit Form State
  const [dailyLimit, setDailyLimit] = useState('500');
  const [monthlyLimit, setMonthlyLimit] = useState('5000');
  const [updatingLimits, setUpdatingLimits] = useState(false);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      const res = await api.getParentDashboard();
      if (res.success) {
        setData(res.data);
        if (res.data.spendingLimits) {
          setDailyLimit(res.data.spendingLimits.daily_limit.toString());
          setMonthlyLimit(res.data.spendingLimits.monthly_limit.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load parent dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  const handleUpdateLimits = async (e) => {
    e.preventDefault();
    if (!data?.primaryStudent) return;
    setUpdatingLimits(true);
    try {
      const res = await api.updateSpendingLimits({
        studentUserId: data.primaryStudent.user_id,
        dailyLimit: Number(dailyLimit),
        monthlyLimit: Number(monthlyLimit)
      });
      if (res.success) {
        showToast('Spending limits updated successfully!', 'success');
        fetchParentData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update limits', 'error');
    } finally {
      setUpdatingLimits(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#FF6B35', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Parent Control Portal...</p>
      </div>
    );
  }

  const { primaryStudent, childWallet, spendingLimits, studentTodaySpend, notifications = [] } = data || {};
  const studentName = primaryStudent?.name || primaryStudent?.student_name || 'Linked Student';
  const balance = childWallet?.balance !== undefined ? Number(childWallet.balance) : (primaryStudent?.wallet_balance || 0);
  const dLimit = spendingLimits?.daily_limit || primaryStudent?.limits?.daily_limit || 500;
  const currentTodaySpend = studentTodaySpend !== undefined ? Number(studentTodaySpend) : (primaryStudent?.todaySpending || 0);

  const todayPct = Math.min(100, Math.round((currentTodaySpend / dLimit) * 100));
  let limitStatus = 'SAFE';

  if (todayPct >= 100) {
    limitStatus = 'LIMIT REACHED';
  } else if (todayPct >= 75) {
    limitStatus = 'WARNING';
  }

  return (
    <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">PARENT CONTROL DASHBOARD 🛡️</h1>
          <p style={{ color: '#4A5568', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            Monitor student expenses, enforce spending limits & recharge wallet
          </p>
        </div>

        <button onClick={openRechargeModal} className="btn btn-coral btn-lg">
          <Plus size={20} /> Recharge Student Wallet
        </button>
      </div>

      {/* STUDENT SUMMARY CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Student Profile Card */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Linked Student</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#101B3D', margin: '6px 0 0 0' }} className="font-heading">{studentName}</div>
          <span style={{ fontSize: '0.76rem', color: '#4A5568' }}>Roll No: 2026CS1088 • CS Dept</span>
        </div>

        {/* Student Wallet Balance */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
          <div style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Wallet Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FF6B35', margin: '6px 0 0 0' }} className="font-heading">₹{balance.toFixed(2)}</div>
          <span style={{ fontSize: '0.76rem', color: '#101B3D', fontWeight: 700 }}>Active Verified Balance</span>
        </div>

        {/* Today's Spending */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Today's Spending</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D', margin: '6px 0 0 0' }} className="font-heading">₹{(studentTodaySpend || 320).toFixed(2)}</div>
          <span style={{ fontSize: '0.76rem', color: '#4A5568' }}>Daily Limit: ₹{dLimit}</span>
        </div>

        {/* Limit Status Bar */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Limit Monitor</span>
            <span className="badge badge-coral">{limitStatus}</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#F7F5F0', borderRadius: '5px', overflow: 'hidden', margin: '8px 0' }}>
            <div style={{ width: `${todayPct}%`, height: '100%', background: '#FF6B35', borderRadius: '5px' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: '#4A5568' }}>{todayPct}% of daily budget used</span>
        </div>

      </div>

      {/* SPENDING LIMIT CONTROL FORM & NOTIFICATIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* SPENDING LIMITS FORM */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35' }}>
              <Sliders size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Configure Spending Limits</h3>
          </div>

          <form onSubmit={handleUpdateLimits}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#101B3D' }}>Max Daily Spending Limit (₹)</label>
              <input
                type="number"
                className="form-input"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#101B3D' }}>Max Monthly Spending Limit (₹)</label>
              <input
                type="number"
                className="form-input"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={updatingLimits} className="btn btn-coral btn-lg" style={{ width: '100%', marginTop: '10px' }}>
              {updatingLimits ? 'Updating...' : 'Save Limit Configuration'}
            </button>
          </form>
        </div>

        {/* PARENT NOTIFICATIONS DRAWER */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 27, 61, 0.08)', color: '#101B3D' }}>
              <Bell size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Real-Time Spending Alerts</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto' }}>
            {notifications && notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  background: '#F7F5F0',
                  border: '1px solid rgba(16, 27, 61, 0.12)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#101B3D' }}>{n.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '2px' }}>{n.message}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#FF6B35', fontWeight: 600 }}>
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#4A5568', textAlign: 'center', padding: '20px 0' }}>No notification alerts yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
