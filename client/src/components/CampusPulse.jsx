import React from 'react';
import { Activity, Zap, Store } from 'lucide-react';

export default function CampusPulse({ data }) {
  const todayCount = data?.todayTransactions || 2840;
  const todayVolume = data?.todayPaymentVolume ? `₹${(data.todayPaymentVolume / 1000).toFixed(1)}k` : '₹1.82L';
  const activeVendors = data?.activeVendors || 124;

  return (
    <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', background: '#FFFFFF', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
      {/* Background Pulse Animation Glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(255, 107, 53, 0.12)',
            color: '#FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">CAMPUS PULSE</h3>
            <span style={{ fontSize: '0.75rem', color: '#4A5568' }}>Live Financial Activity Stream</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 107, 53, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B35' }} className="animate-pulse-dot" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF6B35' }}>LIVE NETWORK</span>
        </div>
      </div>

      {/* Pulse Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#F7F5F0', padding: '14px', borderRadius: '14px', border: '1px solid rgba(16, 27, 61, 0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: '#4A5568', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={14} style={{ color: '#FF6B35' }} /> Payments Today
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#101B3D' }}>{todayCount.toLocaleString()}</div>
        </div>

        <div style={{ background: '#F7F5F0', padding: '14px', borderRadius: '14px', border: '1px solid rgba(16, 27, 61, 0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: '#4A5568', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={14} style={{ color: '#FF6B35' }} /> Volume Today
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FF6B35' }}>{todayVolume}</div>
        </div>

        <div style={{ background: '#F7F5F0', padding: '14px', borderRadius: '14px', border: '1px solid rgba(16, 27, 61, 0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: '#4A5568', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Store size={14} style={{ color: '#101B3D' }} /> Active Vendors
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#101B3D' }}>{activeVendors}</div>
        </div>
      </div>

      {/* Visual Activity Waveform SVG */}
      <div style={{ width: '100%', height: '50px', position: 'relative' }}>
        <svg viewBox="0 0 400 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#101B3D" />
              <stop offset="50%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#101B3D" />
            </linearGradient>
          </defs>
          <path
            d="M0,25 Q30,10 60,35 T120,20 T180,40 T240,15 T300,30 T360,10 T400,25"
            fill="none"
            stroke="url(#pulseGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
