import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, X, ShieldCheck } from 'lucide-react';

export default function QuickRechargeModal({ isOpen, onClose, onSuccess }) {
  const { user, refreshUser, showToast } = useAuth();
  const [amount, setAmount] = useState('500');
  const [source] = useState('Demo NetBanking / UPI');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPresetAmounts = [100, 250, 500, 1000, 2000];

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (loading) return;
    const numAmt = Number(amount);
    if (!numAmt || numAmt <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (user?.role === 'STUDENT') {
        res = await api.rechargeStudentWallet({ amount: numAmt, source });
      } else if (user?.role === 'PARENT') {
        const dashboard = await api.getParentDashboard();
        const student = dashboard.data?.primaryStudent;
        if (!student) {
          showToast('No linked student found to recharge', 'error');
          return;
        }
        res = await api.rechargeChildWallet({ studentUserId: student.user_id, amount: numAmt });
      }

      if (res?.success) {
        showToast(res.message || 'Demo Wallet Recharged Successfully!', 'success');
        refreshUser();
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Recharge failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(16, 27, 61, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        background: '#FFFFFF',
        borderRadius: '28px',
        padding: '32px',
        position: 'relative',
        border: '1px solid rgba(255, 107, 53, 0.3)',
        boxShadow: '0 25px 50px rgba(16, 27, 61, 0.25)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F7F5F0',
            border: 'none',
            color: '#101B3D',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(255, 107, 53, 0.12)',
            color: '#FF6B35',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <CreditCard size={28} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#101B3D' }} className="font-heading">ADD DEMO MONEY</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#4A5568' }}>
            Instant virtual balance top-up for testing
          </p>
        </div>

        <form onSubmit={handleRecharge}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#101B3D' }}>Select Quick Amount (₹)</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {quickPresetAmounts.map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  style={{
                    flex: '1 1 60px',
                    padding: '8px',
                    borderRadius: '12px',
                    background: Number(amount) === val ? '#FF6B35' : '#F7F5F0',
                    border: '1px solid rgba(16, 27, 61, 0.12)',
                    color: Number(amount) === val ? '#FFFFFF' : '#101B3D',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    minHeight: '44px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  +₹{val}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Or enter custom amount"
              style={{ fontSize: '1.3rem', fontWeight: 800, textAlign: 'center', color: '#FF6B35', background: '#F7F5F0', border: '1px solid rgba(16, 27, 61, 0.15)' }}
            />
          </div>

          <div style={{
            background: 'rgba(255, 107, 53, 0.08)',
            padding: '12px',
            borderRadius: '14px',
            border: '1px dashed rgba(255, 107, 53, 0.3)',
            marginBottom: '20px',
            fontSize: '0.78rem',
            color: '#101B3D',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={18} color="#FF6B35" />
            <span>Demo Gateway Simulation: Virtual credit added instantly.</span>
          </div>

          <button
            type="submit"
            disabled={loading || !amount || Number(amount) <= 0}
            className="btn btn-coral btn-lg"
            style={{ width: '100%' }}
          >
            {loading ? 'Processing...' : `Confirm Recharge ₹${Number(amount || 0).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
