import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wallet, QrCode, Plus, Award, TrendingUp, ShoppingBag, ChevronRight, RefreshCw, Receipt, ArrowRight, CheckCircle2 } from 'lucide-react';
import CampusPulse from '../components/CampusPulse';

export default function StudentDashboard({ onNavigate, openQRModal, openRechargeModal }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#FF6B35', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Student Dashboard...</p>
      </div>
    );
  }

  const { walletBalance, todaySpending, monthlySpending, rewardPoints } = data || {};

  const displayBalance = walletBalance !== undefined && walletBalance !== null ? Number(walletBalance) : (user?.balance || 0);
  const displayToday = todaySpending !== undefined && todaySpending !== null ? Number(todaySpending) : 0;
  const displayMonthly = monthlySpending !== undefined && monthlySpending !== null ? Number(monthlySpending) : 0;
  const displayPoints = rewardPoints !== undefined && rewardPoints !== null ? rewardPoints : (user?.rewardPoints?.points_balance || 0);

  return (
    <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      
      {/* 1. TOP SUMMARY CARDS (Strict Two-Color Palette) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Card 1: Available Balance */}
        <div className="glass-card glass-card-hover" style={{
          padding: '24px',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          boxShadow: 'var(--shadow-main)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568', textTransform: 'uppercase' }}>
              Available Balance
            </span>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FF6B35', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(255, 107, 53, 0.3)' }}>
              <Wallet size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#101B3D', lineHeight: 1 }} className="font-heading">
            ₹{displayBalance.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#FF6B35', marginTop: '10px', display: 'block', fontWeight: 700 }}>
            Live verified wallet
          </span>
        </div>

        {/* Card 2: Today's Spending */}
        <div className="glass-card glass-card-hover" style={{
          padding: '24px',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '1px solid rgba(16, 27, 61, 0.12)',
          boxShadow: 'var(--shadow-main)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568', textTransform: 'uppercase' }}>
              Today's Spending
            </span>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#101B3D', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(16, 27, 61, 0.2)' }}>
              <ShoppingBag size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#101B3D', lineHeight: 1 }} className="font-heading">
            ₹{displayToday.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '10px', display: 'block', fontWeight: 600 }}>
            Daily QR expenditure
          </span>
        </div>

        {/* Card 3: Monthly Spending */}
        <div className="glass-card glass-card-hover" style={{
          padding: '24px',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '1px solid rgba(16, 27, 61, 0.12)',
          boxShadow: 'var(--shadow-main)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568', textTransform: 'uppercase' }}>
              Monthly Spending
            </span>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#101B3D', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(16, 27, 61, 0.2)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#101B3D', lineHeight: 1 }} className="font-heading">
            ₹{displayMonthly.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#FF6B35', marginTop: '10px', display: 'block', fontWeight: 700 }}>
            Current month total
          </span>
        </div>

        {/* Card 4: Reward Points */}
        <div className="glass-card glass-card-hover" style={{
          padding: '24px',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          boxShadow: 'var(--shadow-main)',
          cursor: 'pointer'
        }} onClick={() => onNavigate('/student/rewards')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF6B35', textTransform: 'uppercase' }}>
              Reward Points
            </span>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FF6B35', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(255, 107, 53, 0.3)' }}>
              <Award size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FF6B35', lineHeight: 1 }} className="font-heading">
            {displayPoints} PTS
          </div>
          <span style={{ fontSize: '0.78rem', color: '#101B3D', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            Earn 10 pts per ₹100 <ChevronRight size={14} color="#FF6B35" />
          </span>
        </div>

      </div>

      {/* 2. QUICK ACTION CARDS */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: '#101B3D' }} className="font-heading">
        Quick Actions
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Quick Action 1: SCAN & PAY */}
        <div
          onClick={openQRModal}
          className="glass-card glass-card-hover"
          style={{
            padding: '24px',
            borderRadius: '24px',
            background: '#FFFFFF',
            border: '1px solid rgba(16, 27, 61, 0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <QrCode size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">SCAN & PAY</div>
            <div style={{ fontSize: '0.78rem', color: '#4A5568' }}>Pay instantly via QR Code</div>
          </div>
        </div>

        {/* Quick Action 2: ADD MONEY */}
        <div
          onClick={openRechargeModal}
          className="glass-card glass-card-hover"
          style={{
            padding: '24px',
            borderRadius: '24px',
            background: '#FFFFFF',
            border: '1px solid rgba(16, 27, 61, 0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Plus size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">ADD MONEY</div>
            <div style={{ fontSize: '0.78rem', color: '#4A5568' }}>Top-up your wallet</div>
          </div>
        </div>

        {/* Quick Action 3: TRANSACTIONS */}
        <div
          onClick={() => onNavigate('/student/wallet')}
          className="glass-card glass-card-hover"
          style={{
            padding: '24px',
            borderRadius: '24px',
            background: '#FFFFFF',
            border: '1px solid rgba(16, 27, 61, 0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(16, 27, 61, 0.08)', color: '#101B3D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Receipt size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">TRANSACTIONS</div>
            <div style={{ fontSize: '0.78rem', color: '#4A5568' }}>View your history</div>
          </div>
        </div>

        {/* Quick Action 4: REWARDS */}
        <div
          onClick={() => onNavigate('/student/rewards')}
          className="glass-card glass-card-hover"
          style={{
            padding: '24px',
            borderRadius: '24px',
            background: '#FFFFFF',
            border: '1px solid rgba(16, 27, 61, 0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">REWARDS</div>
            <div style={{ fontSize: '0.78rem', color: '#4A5568' }}>Redeem and earn points</div>
          </div>
        </div>

      </div>

      {/* 3. CAMPUS HERO BANNER */}
      <div className="glass-card" style={{
        padding: '36px',
        borderRadius: '28px',
        background: '#FFFFFF',
        border: '1px solid rgba(255, 107, 53, 0.3)',
        marginBottom: '32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        alignItems: 'center',
        boxShadow: '0 10px 30px rgba(16, 27, 61, 0.06)'
      }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D', lineHeight: 1.15, marginBottom: '12px' }} className="font-heading">
            Your Campus. <br />
            Your Wallet. <br />
            Your <span style={{ color: '#FF6B35' }}>CASHLESS</span> Life.
          </h2>
          <p style={{ color: '#4A5568', fontSize: '0.98rem', marginBottom: '24px', maxWidth: '420px' }}>
            "A smarter way to pay, save and manage your campus expenses."
          </p>
          <button onClick={() => onNavigate('/student/wallet')} className="btn btn-coral btn-lg">
            Explore Campus Cash <ArrowRight size={18} />
          </button>
        </div>

        {/* 3D Smartphone Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            width: '240px',
            background: '#F7F5F0',
            borderRadius: '24px',
            padding: '20px',
            border: '2px solid #101B3D',
            boxShadow: '0 20px 40px rgba(16, 27, 61, 0.15)',
            transform: 'rotate(-3deg)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 107, 53, 0.15)', color: '#FF6B35', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '4px' }}>Payment Success</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#101B3D' }}>₹120.00</div>
              <div style={{ fontSize: '0.74rem', color: '#FF6B35', fontWeight: 700 }}>Paid to Canteen</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '12px', fontSize: '0.72rem', color: '#4A5568', textAlign: 'center', border: '1px solid rgba(16, 27, 61, 0.1)' }}>
              Balance: <strong style={{ color: '#FF6B35' }}>₹2,330.00</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CAMPUS PULSE & BOTTOM METRICS */}
      <div style={{ marginBottom: '32px' }}>
        <CampusPulse />
      </div>

      {/* BOTTOM CAMPUS METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', background: '#FFFFFF', textAlign: 'center', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Total Students</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#101B3D', margin: '4px 0' }} className="font-heading">2,845</div>
          <span style={{ fontSize: '0.74rem', color: '#FF6B35', fontWeight: 700 }}>+12.6%</span>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', background: '#FFFFFF', textAlign: 'center', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Active Vendors</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#101B3D', margin: '4px 0' }} className="font-heading">124</div>
          <span style={{ fontSize: '0.74rem', color: '#FF6B35', fontWeight: 700 }}>+4.3%</span>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', background: '#FFFFFF', textAlign: 'center', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Today's Payments</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FF6B35', margin: '4px 0' }} className="font-heading">2,840</div>
          <span style={{ fontSize: '0.74rem', color: '#FF6B35', fontWeight: 700 }}>+15.8%</span>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', background: '#FFFFFF', textAlign: 'center', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Total Volume</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#101B3D', margin: '4px 0' }} className="font-heading">₹1.82L</div>
          <span style={{ fontSize: '0.74rem', color: '#FF6B35', fontWeight: 700 }}>+18.7%</span>
        </div>

      </div>

    </div>
  );
}
