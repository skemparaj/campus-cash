import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, X, ShieldCheck, Zap } from 'lucide-react';
import RazorpayModal from './RazorpayModal';

export default function QuickRechargeModal({ isOpen, onClose, onSuccess }) {
  const { user, refreshUser, showToast } = useAuth();
  const [amount, setAmount] = useState('500');
  const [source] = useState('Demo NetBanking / UPI');
  const [loading, setLoading] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  if (!isOpen) return null;

  const quickPresetAmounts = [100, 250, 500, 1000, 2000];

  const handleDemoRecharge = async (e) => {
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

  const handleOpenRazorpay = () => {
    const numAmt = Number(amount);
    if (!numAmt || numAmt <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setIsRazorpayOpen(true);
  };

  return (
    <>
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
          maxWidth: '460px',
          background: '#FFFFFF',
          borderRadius: '28px',
          padding: '32px',
          position: 'relative',
          border: '1px solid rgba(0, 82, 255, 0.3)',
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
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(0, 82, 255, 0.12) 0%, rgba(66, 230, 181, 0.15) 100%)',
              color: '#0052FF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              <CreditCard size={30} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#101B3D' }} className="font-heading">RECHARGE WALLET</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#4A5568' }}>
              Add money instantly via Razorpay UPI / Cards or Demo mode
            </p>
          </div>

          <div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#101B3D', fontWeight: 700 }}>Select Quick Amount (₹)</label>
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
                      background: Number(amount) === val ? '#0052FF' : '#F7F5F0',
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
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  color: '#0052FF',
                  background: '#F0F4F8',
                  border: '2px solid rgba(0, 82, 255, 0.2)'
                }}
              />
            </div>

            {/* Razorpay Gateway Button (Primary) */}
            <button
              type="button"
              onClick={handleOpenRazorpay}
              disabled={!amount || Number(amount) <= 0}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0052FF 0%, #0036B3 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 82, 255, 0.3)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Zap size={18} fill="#FFFFFF" /> Pay ₹{Number(amount || 0).toFixed(2)} via Razorpay
            </button>

            {/* Instant Demo Top Up Button (Secondary) */}
            <button
              type="button"
              onClick={handleDemoRecharge}
              disabled={loading || !amount || Number(amount) <= 0}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: '#F7F5F0',
                color: '#101B3D',
                border: '1px solid rgba(16, 27, 61, 0.2)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={16} color="#FF6B35" />
              {loading ? 'Processing...' : 'Instant Demo Wallet Credit (No Payment)'}
            </button>
          </div>
        </div>
      </div>

      {/* Razorpay Payment Checkout Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={Number(amount)}
        onSuccess={(data) => {
          setIsRazorpayOpen(false);
          refreshUser();
          if (onSuccess) onSuccess(data);
          onClose();
        }}
      />
    </>
  );
}
