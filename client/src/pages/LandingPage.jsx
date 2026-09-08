import React from 'react';
import { Wallet, Bell, Award, Smartphone, ArrowRight, Store, Users, Lock, ChevronRight, Sparkles, Shield } from 'lucide-react';
import MoneyTrail from '../components/MoneyTrail';

export default function LandingPage({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative', zIndex: 1 }}>
      
      {/* 1. HERO SECTION */}
      <section style={{
        padding: '70px 24px 50px 24px',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(255, 107, 53, 0.12)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            color: '#FF6B35',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            <Sparkles size={16} className="animate-pulse-dot" />
            Next-Gen Campus Wallet Platform
          </div>

          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, fontWeight: 800, marginBottom: '16px', color: '#101B3D' }} className="font-heading">
            CAMPUS <span style={{ color: '#FF6B35' }}>CASH</span>
          </h1>
          <h2 style={{ fontSize: '1.5rem', color: '#101B3D', fontWeight: 700, marginBottom: '16px' }}>
            "Your Campus. Your Wallet. Your <span style={{ color: '#FF6B35' }}>CASHLESS</span> Life."
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#4A5568', marginBottom: '32px', maxWidth: '540px' }}>
            A smarter digital wallet built for the modern campus. Unifying students, parents, vendors, and administration into one seamless financial ecosystem.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('/login')} className="btn btn-coral btn-lg">
              Get Started <ArrowRight size={20} />
            </button>
            <button onClick={() => onNavigate('/login')} className="btn btn-purple btn-lg">
              Explore Campus Cash
            </button>
          </div>
        </div>

        {/* Hero Visual: 3D Floating Digital Card & Surrounding UI Chips */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', minHeight: '360px', alignItems: 'center' }}>
          
          {/* Main 3D Card */}
          <div className="glass-card animate-float" style={{
            width: '100%',
            maxWidth: '400px',
            borderRadius: '28px',
            padding: '28px',
            background: '#101B3D',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(16, 27, 61, 0.3)',
            border: '1px solid rgba(255, 107, 53, 0.4)',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#FF6B35',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Wallet color="#FFFFFF" size={20} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.05em' }}>CAMPUS CASH</span>
              </div>
              <span className="badge badge-coral">ACTIVE</span>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Balance</span>
              <div style={{ fontSize: '2.6rem', fontWeight: 800, color: '#FF6B35', lineHeight: 1.1 }}>₹2,450.00</div>
              <span style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Roll #: 2026CS1088 • Kemparaj S</span>
            </div>

            {/* Recent Payment Snippet inside card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Recent Payment</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>Campus Canteen</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FF6B35' }}>₹120</div>
                <span className="badge badge-coral" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>SUCCESS</span>
              </div>
            </div>
          </div>

          {/* Floating UI Chip 1: Wallet Recharge */}
          <div className="glass-card" style={{
            position: 'absolute',
            top: '0px',
            left: '-10px',
            padding: '10px 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid rgba(255, 107, 53, 0.4)',
            boxShadow: '0 10px 30px rgba(16, 27, 61, 0.12)',
            zIndex: 3
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B35' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FF6B35' }}>+₹1,000 Wallet Recharge</span>
          </div>

          {/* Floating UI Chip 2: Parent Alert */}
          <div className="glass-card" style={{
            position: 'absolute',
            bottom: '10px',
            left: '0px',
            padding: '10px 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid rgba(16, 27, 61, 0.2)',
            boxShadow: '0 10px 30px rgba(16, 27, 61, 0.12)',
            zIndex: 3
          }}>
            <Bell size={16} style={{ color: '#FF6B35' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#101B3D' }}>Parent Alert</span>
          </div>

          {/* Floating UI Chip 3: Reward Points */}
          <div className="glass-card" style={{
            position: 'absolute',
            top: '20px',
            right: '-10px',
            padding: '10px 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid rgba(255, 107, 53, 0.4)',
            boxShadow: '0 10px 30px rgba(16, 27, 61, 0.12)',
            zIndex: 3
          }}>
            <Award size={16} style={{ color: '#FF6B35' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FF6B35' }}>+15 Reward Points</span>
          </div>

          {/* Floating UI Chip 4: Secure Payment */}
          <div className="glass-card" style={{
            position: 'absolute',
            bottom: '20px',
            right: '-10px',
            padding: '10px 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid rgba(16, 27, 61, 0.2)',
            boxShadow: '0 10px 30px rgba(16, 27, 61, 0.12)',
            zIndex: 3
          }}>
            <Lock size={16} style={{ color: '#101B3D' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#101B3D' }}>Secure Payment</span>
          </div>

        </div>
      </section>

      {/* HOW MONEY MOVES SECTION */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <MoneyTrail />
      </section>

      {/* STAKEHOLDERS MODULE OVERVIEW */}
      <section style={{ padding: '60px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">THE SMART CAMPUS ECOSYSTEM</h2>
          <p style={{ color: '#4A5568', fontSize: '1.05rem', marginTop: '8px' }}>
            Integrated role-based dashboards tailored for students, parents, vendors, and administration.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          
          {/* Module 1: Student */}
          <div className="glass-card glass-card-hover" style={{ padding: '28px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Smartphone size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#101B3D' }}>1. Student Module</h3>
            <p style={{ fontSize: '0.88rem', color: '#4A5568', marginBottom: '16px' }}>
              QR Scanner, wallet balance, transaction history, reward points catalog, and AI expense tracker.
            </p>
            <button onClick={() => onNavigate('/login')} className="btn btn-coral btn-sm">
              Demo Student Login <ChevronRight size={14} />
            </button>
          </div>

          {/* Module 2: Parent */}
          <div className="glass-card glass-card-hover" style={{ padding: '28px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 27, 61, 0.08)', color: '#101B3D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#101B3D' }}>2. Parent Module</h3>
            <p style={{ fontSize: '0.88rem', color: '#4A5568', marginBottom: '16px' }}>
              Remote wallet top-up, spending limit controls, payment notifications, and monthly summaries.
            </p>
            <button onClick={() => onNavigate('/login')} className="btn btn-purple btn-sm">
              Demo Parent Login <ChevronRight size={14} />
            </button>
          </div>

          {/* Module 3: Vendor */}
          <div className="glass-card glass-card-hover" style={{ padding: '28px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Store size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#101B3D' }}>3. Vendor Module</h3>
            <p style={{ fontSize: '0.88rem', color: '#4A5568', marginBottom: '16px' }}>
              POS style QR Generator, real-time sales feed, search, and downloadable revenue reports.
            </p>
            <button onClick={() => onNavigate('/login')} className="btn btn-coral btn-sm">
              Demo Vendor Login <ChevronRight size={14} />
            </button>
          </div>

          {/* Module 4: Admin */}
          <div className="glass-card glass-card-hover" style={{ padding: '28px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 27, 61, 0.08)', color: '#101B3D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#101B3D' }}>4. Admin Module</h3>
            <p style={{ fontSize: '0.88rem', color: '#4A5568', marginBottom: '16px' }}>
              System financial KPIs, Campus Pulse metrics, user status management, vendor approvals, and audit trail.
            </p>
            <button onClick={() => onNavigate('/login')} className="btn btn-purple btn-sm">
              Demo Admin Login <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#101B3D', borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '40px 24px 20px 24px', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800, color: '#FFFFFF' }}>CAMPUS <span style={{ color: '#FF6B35' }}>CASH</span></h3>
            <span style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Smart Digital Campus Wallet Platform</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>
            Production Fintech Architecture • Deep Navy + Electric Orange Brand System
          </div>
        </div>
      </footer>

    </div>
  );
}
