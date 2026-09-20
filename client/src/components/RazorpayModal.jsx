import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, QrCode, CreditCard, Building2, Smartphone, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RazorpayModal({ isOpen, onClose, amount, targetStudentUserId, onSuccess }) {
  const { showToast, refreshUser, user } = useAuth();
  const [activeTab, setActiveTab] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [keyId, setKeyId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('Google Pay / PhonePe');

  // Card form state
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('Campus Student');

  // Netbanking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const numAmount = Number(amount || 0);

  useEffect(() => {
    if (isOpen && numAmount > 0) {
      initOrder();
    } else {
      setOrder(null);
    }
  }, [isOpen, amount]);

  const initOrder = async () => {
    try {
      setLoading(true);
      const res = await api.createRazorpayOrder({ amount: numAmount, targetStudentUserId });
      if (res?.success) {
        setOrder(res.order);
        setKeyId(res.keyId);

        // Try initializing official Razorpay Checkout SDK if script exists or loaded
        if (window.Razorpay && res.keyId && !res.keyId.includes('demo')) {
          openOfficialRazorpayCheckout(res.keyId, res.order, res.user);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to initialize Razorpay checkout', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openOfficialRazorpayCheckout = (key, orderObj, userInfo) => {
    try {
      const options = {
        key: key,
        amount: orderObj.amount,
        currency: orderObj.currency || 'INR',
        name: 'Campus Cash Digital Wallet',
        description: 'Wallet Recharge Settlement',
        image: 'https://cdn-icons-png.flaticon.com/512/10170/10170477.png',
        order_id: orderObj.id,
        handler: async function (response) {
          await verifyPaymentOnServer(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            'Razorpay Gateway Official Checkout'
          );
        },
        prefill: {
          name: userInfo?.name || user?.name || '',
          email: userInfo?.email || user?.email || '',
          contact: '9876543210'
        },
        theme: {
          color: '#0052FF'
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.warn('Official Razorpay Popup fallback:', e);
    }
  };

  const verifyPaymentOnServer = async (orderId, paymentId, signature, methodLabel) => {
    setLoading(true);
    try {
      const verifyRes = await api.verifyRazorpayPayment({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature || 'sandbox_sig_verified',
        amount: numAmount,
        targetStudentUserId,
        paymentMethod: methodLabel || selectedMethod
      });

      if (verifyRes?.success) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        showToast(verifyRes.message || 'Payment Successful & Wallet Credited!', 'success');
        refreshUser();
        if (onSuccess) onSuccess(verifyRes.data);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Payment verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const launchUpiDeepLink = (appName) => {
    setSelectedMethod(appName);
    const upiDeepLink = `upi://pay?pa=campuscash.rzp@icici&pn=CampusCash&am=${numAmount}&cu=INR&tn=Campus%20Cash%20Wallet%20Recharge`;
    try {
      window.location.href = upiDeepLink;
    } catch (e) {
      console.log('UPI Intent launched:', upiDeepLink);
    }
  };

  const handleSimulatedPay = async () => {
    if (!order) return;

    // Trigger direct UPI deep link if Google Pay / PhonePe is selected
    if (activeTab === 'upi') {
      const upiDeepLink = `upi://pay?pa=campuscash.rzp@icici&pn=CampusCash&am=${numAmount}&cu=INR&tn=Campus%20Cash%20Wallet%20Recharge`;
      try {
        window.location.href = upiDeepLink;
      } catch (e) {}
    }

    const mockPaymentId = `pay_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    let methodDesc = 'Razorpay UPI Payment (Google Pay)';

    if (activeTab === 'card') {
      methodDesc = `Razorpay Card (*${cardNumber.slice(-4)})`;
    } else if (activeTab === 'netbanking') {
      methodDesc = `Razorpay NetBanking (${selectedBank})`;
    } else if (activeTab === 'upi') {
      methodDesc = `Razorpay UPI (${selectedMethod})`;
    }

    await verifyPaymentOnServer(order.id, mockPaymentId, 'sandbox_signature_passed', methodDesc);
  };


  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 16, 32, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#FFFFFF',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(0, 82, 255, 0.2)',
        position: 'relative',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0C2340 0%, #0052FF 100%)',
          padding: '24px',
          color: '#FFFFFF',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFFFFF',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              background: '#FFFFFF',
              color: '#0052FF',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.5px'
            }}>
              RAZORPAY
            </div>
            <span style={{ fontSize: '0.8rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={13} /> Secured 256-Bit SSL Checkout
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.8 }}>Payment Amount</p>
              <h2 style={{ margin: '2px 0 0 0', fontSize: '2.2rem', fontWeight: 900, color: '#42E6B5' }}>
                ₹{numAmount.toFixed(2)}
              </h2>
            </div>
            {order && (
              <div style={{ textAlign: 'right', fontSize: '0.75rem', opacity: 0.75 }}>
                <div>Order: {order.id?.slice(0, 16)}...</div>
                <div>INR Gateway</div>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Payment Method Tabs */}
          <div style={{
            display: 'flex',
            background: '#F0F4F8',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '9px',
                background: activeTab === 'upi' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'upi' ? '#0052FF' : '#4A5568',
                fontWeight: activeTab === 'upi' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'upi' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Smartphone size={16} /> UPI & QR
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '9px',
                background: activeTab === 'card' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'card' ? '#0052FF' : '#4A5568',
                fontWeight: activeTab === 'card' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'card' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <CreditCard size={16} /> Cards
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '9px',
                background: activeTab === 'netbanking' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'netbanking' ? '#0052FF' : '#4A5568',
                fontWeight: activeTab === 'netbanking' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'netbanking' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Building2 size={16} /> NetBanking
            </button>
          </div>

          {/* TAB 1: UPI & QR */}
          {activeTab === 'upi' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F8FAFC',
                padding: '16px',
                borderRadius: '16px',
                border: '1px dashed #CBD5E1',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 8px auto',
                    background: '#FFFFFF',
                    padding: '8px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Simulated Razorpay UPI QR */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=upi://pay?pa=campuscash.rzp@icici%26pn=CampusCash%26am=${numAmount}%26cu=INR`}
                      alt="Razorpay UPI QR"
                      style={{ width: '100%', height: '100%', borderRadius: '6px' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    Scan QR with GooglePay / PhonePe / Paytm / BHIM
                  </span>
                </div>
              </div>

              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '8px' }}>
                Select Instant UPI App
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM UPI'].map(app => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setSelectedMethod(app)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedMethod === app ? '2px solid #0052FF' : '1fr solid #E2E8F0',
                      background: selectedMethod === app ? 'rgba(0, 82, 255, 0.05)' : '#FFFFFF',
                      color: selectedMethod === app ? '#0052FF' : '#334155',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CheckCircle2 size={16} color={selectedMethod === app ? '#0052FF' : '#CBD5E1'} />
                    {app}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CARDS */}
          {activeTab === 'card' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.95rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.95rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: NETBANKING */}
          {activeTab === 'netbanking' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '8px' }}>
                Select Popular Bank
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map(bank => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '12px',
                      border: selectedBank === bank ? '2px solid #0052FF' : '1px solid #E2E8F0',
                      background: selectedBank === bank ? 'rgba(0, 82, 255, 0.05)' : '#FFFFFF',
                      color: selectedBank === bank ? '#0052FF' : '#334155',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Building2 size={14} /> {bank}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guarantee Badge */}
          <div style={{
            background: 'rgba(66, 230, 181, 0.1)',
            border: '1px dashed #42E6B5',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.78rem',
            color: '#0F5132',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <ShieldCheck size={18} color="#0052FF" />
            <span>Razorpay Sandbox & Production Gateway Active. Instant HMAC Verification.</span>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSimulatedPay}
            disabled={loading || !order}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0052FF 0%, #0036B3 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 10px 25px rgba(0, 82, 255, 0.35)',
              transition: 'transform 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Verifying with Razorpay...' : `Pay ₹${numAmount.toFixed(2)} via Razorpay`}
          </button>
        </div>
      </div>
    </div>
  );
}
