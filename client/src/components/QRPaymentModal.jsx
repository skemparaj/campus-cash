import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QrCode, CheckCircle2, X, Store } from 'lucide-react';

export default function QRPaymentModal({ isOpen, onClose, onSuccess }) {
  const { user, refreshUser, showToast } = useAuth();
  const [step, setStep] = useState(1); // 1: Select/Scan QR, 2: Confirm, 3: Success
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [customAmount, setCustomAmount] = useState('120');
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const [qrInput, setQrInput] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');

  if (!isOpen) return null;

  const demoVendors = [
    { qrId: 'QR_CANTEEN_01', name: 'Campus Canteen', category: 'Food & Drinks', defaultAmount: 120 },
    { qrId: 'QR_STATIONERY_02', name: 'Campus Central Store', category: 'Stationery & Books', defaultAmount: 80 },
    { qrId: 'QR_PRINTING_03', name: 'Express Print Hub', category: 'Printing & Xerox', defaultAmount: 30 },
    { qrId: 'QR_BUS_04', name: 'Campus Transport Bus', category: 'Transit Pass', defaultAmount: 50 }
  ];

  const handleQrLookup = async (targetQrId) => {
    const codeToSearch = targetQrId || qrInput || 'QR_CANTEEN_01';
    setLoading(true);
    try {
      const res = await api.initiatePayment({ qrCodeId: codeToSearch });
      if (res?.success && res?.data) {
        setSelectedVendor({
          qrId: res.data.qrId,
          name: res.data.vendorName,
          category: res.data.category,
          defaultAmount: res.data.suggestedAmount || 100
        });
        setCustomAmount((res.data.suggestedAmount || 100).toString());
        setIdempotencyKey(`PAY_IDEM_${Date.now()}_${Math.random().toString(36).substring(7)}`);
        setStep(2);
      } else {
        const fallback = demoVendors.find(v => v.qrId === codeToSearch) || demoVendors[0];
        handleSelectVendor(fallback);
      }
    } catch (err) {
      const fallback = demoVendors.find(v => v.qrId === codeToSearch) || demoVendors[0];
      handleSelectVendor(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVendor = (v) => {
    setSelectedVendor(v);
    setCustomAmount(v.defaultAmount.toString());
    setIdempotencyKey(`PAY_IDEM_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    setStep(2);
  };


  const handleConfirmPayment = async () => {
    if (!selectedVendor || !customAmount || Number(customAmount) <= 0 || loading) return;

    setLoading(true);
    try {
      const activeIdempotencyKey = idempotencyKey || `PAY_IDEM_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const res = await api.confirmPayment({
        qrCodeId: selectedVendor.qrId,
        qrId: selectedVendor.qrId,
        amount: Number(customAmount),
        idempotencyKey: activeIdempotencyKey
      });

      if (res.success) {
        setPaymentResult(res.data);
        setStep(3);
        refreshUser();
        if (onSuccess) onSuccess(res.data);
        showToast('Payment Successful!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedVendor(null);
    setPaymentResult(null);
    setIdempotencyKey('');
    onClose();
  };

  const walletBalance = user?.balance ?? (user?.wallet?.balance ?? 0);
  const payAmt = Number(customAmount || 0);
  const remaining = walletBalance - payAmt;

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
        maxWidth: '460px',
        background: '#FFFFFF',
        borderRadius: '28px',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(16, 27, 61, 0.25)',
        border: '1px solid rgba(255, 107, 53, 0.3)'
      }}>
        {/* Close Button */}
        <button
          onClick={handleReset}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F7F5F0',
            border: 'none',
            color: '#101B3D',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* STEP 1: SCAN VENDOR QR CODE */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#101B3D' }} className="font-heading">
                Scan & Pay
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#4A5568', margin: '4px 0 0 0' }}>
                Scan a Campus Cash vendor QR code
              </p>
            </div>

            {/* 3D Smartphone Frame Scanner Simulation */}
            <div 
              onClick={() => handleSelectVendor(demoVendors[0])}
              style={{
                background: '#101B3D',
                borderRadius: '24px',
                padding: '24px',
                textAlign: 'center',
                color: '#FFFFFF',
                marginBottom: '24px',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF6B35'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{
                width: '160px',
                height: '160px',
                margin: '0 auto 16px auto',
                border: '3px dashed #FF6B35',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                position: 'relative'
              }}>
                <QrCode size={90} style={{ color: '#FF6B35' }} />
                <div className="animate-scan" style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#FF6B35',
                  boxShadow: '0 0 10px #FF6B35'
                }} />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FF6B35', marginBottom: '4px' }}>
                📸 Tap Scanner to Auto-Detect QR
              </div>
              <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                Point camera at QR code or tap frame to scan
              </span>
            </div>

            {/* QR Input Search Box */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#101B3D', display: 'block', marginBottom: '6px' }}>
                📷 Enter or Paste Scanned QR Code ID
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. QR_CANTEEN_01"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#101B3D'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleQrLookup(qrInput || 'QR_CANTEEN_01')}
                  disabled={loading}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: '#FF6B35',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Scanning...' : 'Scan & Pay'}
                </button>
              </div>
            </div>


            {/* DEMO VENDOR SELECTION */}
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#101B3D', textTransform: 'uppercase', marginBottom: '10px' }}>
              Or Select Merchant:

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {demoVendors.map(v => (
                <button
                  key={v.qrId}
                  onClick={() => handleSelectVendor(v)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: '#F7F5F0',
                    border: '1px solid rgba(16, 27, 61, 0.12)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#101B3D', fontSize: '0.9rem' }}>{v.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4A5568' }}>{v.category}</div>
                  </div>
                  <span className="badge badge-coral">Pay ₹{v.defaultAmount}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT CONFIRMATION */}
        {step === 2 && selectedVendor && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Store size={28} />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#101B3D' }} className="font-heading">
                {selectedVendor.name}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#4A5568' }}>{selectedVendor.category}</span>
            </div>

            {/* Custom Amount Input & Breakdown Card */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#101B3D', display: 'block', marginBottom: '6px' }}>
                Enter Custom Amount (₹)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  color: '#FF6B35',
                  background: '#F7F5F0',
                  border: '2px solid rgba(255, 107, 53, 0.3)',
                  borderRadius: '16px'
                }}
              />
            </div>

            <div style={{ background: '#F7F5F0', padding: '20px', borderRadius: '20px', marginBottom: '24px', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.88rem' }}>
                <span style={{ color: '#4A5568' }}>Payment Amount:</span>
                <span style={{ fontWeight: 800, color: '#FF6B35', fontSize: '1.1rem' }}>₹{payAmt.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.88rem' }}>
                <span style={{ color: '#4A5568' }}>Current Balance:</span>
                <span style={{ color: '#101B3D', fontWeight: 700 }}>₹{walletBalance.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed #CBD5E1', fontSize: '0.88rem' }}>
                <span style={{ color: '#4A5568' }}>Remaining Balance:</span>
                <span style={{ fontWeight: 800, color: '#101B3D' }}>₹{remaining.toFixed(2)}</span>
              </div>
            </div>


            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="btn btn-coral btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? 'Processing...' : 'CONFIRM PAYMENT'}
            </button>
          </div>
        )}

        {/* STEP 3: PAYMENT SUCCESSFUL SCREEN */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <CheckCircle2 size={42} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#101B3D', margin: 0 }} className="font-heading">
              Payment Successful
            </h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FF6B35', margin: '8px 0' }} className="font-heading">
              ₹{paymentResult?.amount || customAmount}.00
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#101B3D', marginBottom: '20px' }}>
              Paid to {selectedVendor?.name || 'Campus Canteen'}
            </div>

            {/* Transaction Receipt Details */}
            <div style={{ background: '#F7F5F0', padding: '16px', borderRadius: '18px', fontSize: '0.82rem', marginBottom: '24px', textAlign: 'left', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#4A5568' }}>Transaction ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#FF6B35' }}>{paymentResult?.transaction_id || `CC20260816${Math.floor(1000 + Math.random() * 9000)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4A5568' }}>Remaining Balance:</span>
                <span style={{ fontWeight: 800, color: '#101B3D' }}>₹{paymentResult?.new_balance || remaining}.00</span>
              </div>
            </div>

            {/* Receipt Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ flex: 1 }}>
                Download Receipt
              </button>
              <button onClick={handleReset} className="btn btn-coral" style={{ flex: 1 }}>
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
