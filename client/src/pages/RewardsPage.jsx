import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Gift, Printer, Coffee, BookOpen, Shirt } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function RewardsPage({ onNavigate }) {
  const { showToast, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await api.getRewardsCatalog();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleRedeem = async (reward) => {
    setRedeemingId(reward.id);
    try {
      const res = await api.redeemReward({ rewardId: reward.id });
      if (res.success) {
        showToast(`Redeemed "${reward.title}"! Code: ${res.data.code}`, 'success');
        refreshUser();
        fetchRewards();
      }
    } catch (err) {
      showToast(err.message || 'Redemption failed', 'error');
    } finally {
      setRedeemingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#FF6B35', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Campus Rewards Store...</p>
      </div>
    );
  }

  const { pointsBalance = 1280, rewards } = data || {};
  const nextGoalPoints = 1500;
  const progressPct = Math.min(100, Math.round((pointsBalance / nextGoalPoints) * 100));

  const defaultRewards = [
    { id: 1, title: 'Free Printing (20 Pages)', category: 'Printing', points_required: 150, description: 'Free B&W document printing voucher at Central Lab.', icon: Printer },
    { id: 2, title: 'Canteen ₹50 Discount', category: 'Food', points_required: 300, description: '₹50 instant discount on snacks & beverages at Campus Canteen.', icon: Coffee },
    { id: 3, title: 'Stationery Coupon (₹100)', category: 'Stationery', points_required: 500, description: '₹100 off on notebooks, pens, and lab journals at Campus Store.', icon: BookOpen },
    { id: 4, title: 'Campus Merchandise Hoodie', category: 'Merchandise', points_required: 1200, description: 'Official college branded fleece hoodie with custom print.', icon: Shirt }
  ];

  const catalogItems = rewards && rewards.length > 0 ? rewards : defaultRewards;

  return (
    <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      
      {/* PAGE HEADER WITH BACK BUTTON */}
      <PageHeader
        title="CAMPUS REWARDS STORE 🎁"
        subtitle="Earn 10 points for every ₹100 spent at campus vendors"
        onNavigate={onNavigate}
        backFallback="/student"
      >
        {/* 1,280 POINTS BADGE */}
        <div className="glass-card" style={{
          padding: '12px 20px',
          borderRadius: '20px',
          background: '#FFFFFF',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          boxShadow: 'var(--shadow-main)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: `conic-gradient(#FF6B35 ${progressPct}%, #F7F5F0 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FF6B35',
              fontWeight: 800,
              fontSize: '0.72rem'
            }}>
              {progressPct}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#4A5568', fontWeight: 700, textTransform: 'uppercase' }}>Available Balance</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FF6B35', lineHeight: 1 }} className="font-heading">{pointsBalance} POINTS</div>
          </div>
        </div>
      </PageHeader>

      {/* REWARDS CATALOG GRID */}
      <h3 style={{ margin: '0 0 18px 0', fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Redeemable Campus Rewards</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        {catalogItems.map(reward => {
          const reqPoints = reward.points_required || 300;
          const canAfford = pointsBalance >= reqPoints;
          const IconComponent = reward.icon || Gift;

          return (
            <div
              key={reward.id}
              className="glass-card glass-card-hover"
              style={{
                padding: '24px',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                border: canAfford ? '1px solid rgba(255, 107, 53, 0.3)' : '1px solid rgba(16, 27, 61, 0.12)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComponent size={22} />
                  </div>
                  <span className="badge badge-coral" style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                    {reqPoints} Points
                  </span>
                </div>
                <h4 style={{ fontSize: '1.15rem', margin: '0 0 8px 0', fontWeight: 700, color: '#101B3D' }}>{reward.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#4A5568', marginBottom: '20px' }}>
                  {reward.description}
                </p>
              </div>

              <button
                onClick={() => handleRedeem(reward)}
                disabled={!canAfford || redeemingId === reward.id}
                className={`btn ${canAfford ? 'btn-coral' : 'btn-secondary'}`}
                style={{ width: '100%' }}
              >
                {redeemingId === reward.id ? 'Redeeming...' : (canAfford ? 'Redeem Voucher' : `Need ${reqPoints - pointsBalance} More Pts`)}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
