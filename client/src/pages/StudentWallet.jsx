import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QrCode, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function StudentWallet({ openRechargeModal, openQRModal, openReceiptModal, onNavigate }) {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentWallet();
      if (res.success) {
        setWalletData(res.data);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#FF6B35', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Digital Wallet...</p>
      </div>
    );
  }

  const { walletBalance, balance, wallet_number = 'CC-8842-1092-2026', recentTransactions = [] } = walletData || {};

  const activeBalance = walletBalance !== undefined && walletBalance !== null
    ? Number(walletBalance)
    : (balance !== undefined && balance !== null ? Number(balance) : (user?.balance || 0));

  const displayList = (recentTransactions && recentTransactions.length > 0)
    ? recentTransactions.filter(tx => filterType === 'ALL' || tx.type === filterType)
    : [];

  return (
    <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      
      {/* PAGE HEADER WITH BACK BUTTON */}
      <PageHeader
        title="MY DIGITAL WALLET 💳"
        subtitle="Manage your balance, top-up funds, and view verified transaction history"
        onNavigate={onNavigate}
        backFallback="/student"
      />

      {/* LARGE 3D DIGITAL WALLET CARD */}
      <div className="glass-card" style={{
        padding: '36px',
        borderRadius: '28px',
        background: '#101B3D',
        color: '#FFFFFF',
        boxShadow: '0 20px 40px rgba(16, 27, 61, 0.25)',
        marginBottom: '36px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255, 107, 53, 0.25)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', letterSpacing: '0.1em', fontWeight: 700 }}>CAMPUS CASH DIGITAL WALLET</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>{user?.name || 'Kemparaj S'}</div>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            {wallet_number}
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '0.8rem', color: '#CBD5E1', textTransform: 'uppercase', fontWeight: 700 }}>Available Balance</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#FF6B35', lineHeight: 1.1 }} className="font-heading">
            ₹{Number(activeBalance).toFixed(2)}
          </div>
        </div>

        {/* Buttons: Add Money & Scan & Pay */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={openRechargeModal} className="btn btn-coral btn-lg">
            <Plus size={20} /> Add Money
          </button>
          <button onClick={openQRModal} className="btn btn-secondary btn-lg" style={{ background: '#FFFFFF', color: '#101B3D' }}>
            <QrCode size={20} /> Scan & Pay
          </button>
        </div>
      </div>

      {/* RECENT TRANSACTIONS CARDS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Recent Transactions</h3>
        
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'RECHARGE', 'PAYMENT', 'REWARD'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`btn btn-sm ${filterType === type ? 'btn-coral' : 'btn-secondary'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* TRANSACTION LIST CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayList.map(tx => {
          const isIncome = tx.direction === 'IN' || tx.type === 'RECHARGE' || tx.type === 'REWARD';
          return (
            <div
              key={tx.id}
              onClick={() => openReceiptModal && openReceiptModal(tx)}
              className="glass-card glass-card-hover"
              style={{
                padding: '18px 24px',
                borderRadius: '20px',
                background: '#FFFFFF',
                border: '1px solid rgba(16, 27, 61, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: isIncome ? 'rgba(255, 107, 53, 0.12)' : 'rgba(16, 27, 61, 0.08)',
                  color: isIncome ? '#FF6B35' : '#101B3D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isIncome ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#101B3D' }}>{tx.title || tx.vendor_name || 'Campus Payment'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '2px' }}>
                    {tx.category || 'General'} • {tx.date || new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isIncome ? '#FF6B35' : '#101B3D' }}>
                  {isIncome ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                </div>
                <span className="badge badge-coral" style={{ fontSize: '0.65rem' }}>COMPLETED</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
