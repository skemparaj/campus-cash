import React from 'react';
import { Users, CreditCard, Wallet, QrCode, Store, FileCheck, Bell, ShieldCheck } from 'lucide-react';

export default function MoneyTrail() {
  const steps = [
    { title: 'Parent', desc: 'Remote Top-up', icon: Users },
    { title: 'Wallet Recharge', desc: 'Instant Funds', icon: CreditCard },
    { title: 'Student Wallet', desc: 'Secure Balance', icon: Wallet },
    { title: 'QR Payment', desc: 'Scan & Pay', icon: QrCode },
    { title: 'Vendor', desc: 'Instant Credit', icon: Store },
    { title: 'Transaction Record', desc: 'Atomic Ledger', icon: FileCheck },
    { title: 'Parent Notification', desc: 'Real-time Alert', icon: Bell },
    { title: 'Admin Analytics', desc: 'Campus Pulse', icon: ShieldCheck }
  ];

  return (
    <section style={{ margin: '40px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#101B3D' }} className="font-heading">
          How Your <span style={{ color: '#FF6B35' }}>Money Moves</span>
        </h2>
        <p style={{ color: '#4A5568', fontSize: '0.95rem', marginTop: '6px' }}>
          An end-to-end connected, atomic digital ledger flow designed for total campus transparency.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        position: 'relative'
      }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isOdd = idx % 2 === 0;
          return (
            <div
              key={step.title}
              className="glass-card glass-card-hover"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                background: '#FFFFFF',
                border: isOdd ? '1px solid rgba(255, 107, 53, 0.3)' : '1px solid rgba(16, 27, 61, 0.12)',
                boxShadow: '0 10px 30px rgba(16, 27, 61, 0.06)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: isOdd ? 'rgba(255, 107, 53, 0.12)' : 'rgba(16, 27, 61, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isOdd ? '#FF6B35' : '#101B3D'
                }}>
                  <Icon size={22} />
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#FF6B35',
                  background: '#F7F5F0',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  0{idx + 1}
                </span>
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#101B3D' }}>
                  {step.title}
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#4A5568' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
