import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QrCode, Download, RefreshCw } from 'lucide-react';

export default function VendorDashboard() {
  const { showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // QR Modal Form State
  const [showQRModal, setShowQRModal] = useState(false);
  const [fixedAmount, setFixedAmount] = useState('');
  const [generatedQR, setGeneratedQR] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const res = await api.getVendorDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setQrLoading(true);
    try {
      const res = await api.generateQR({ fixedAmount: fixedAmount ? Number(fixedAmount) : null });
      if (res.success) {
        setGeneratedQR({
          qrId: res.qrCode.qrId,
          fixedAmount: res.qrCode.fixedAmount,
          secureToken: `VEND_TOKEN_${Date.now()}_${Math.random().toString(36).substring(7)}`
        });
        showToast('Merchant QR Code Generated Successfully!', 'success');
        fetchVendorData();
      }
    } catch (err) {
      showToast(err.message || 'QR generation failed', 'error');
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadReportCSV = () => {
    if (!data?.recentTransactions) return;
    const csvRows = [
      "Payment ID,Student Name,Student Email,Amount,Category,Date"
    ];
    data.recentTransactions.forEach(t => {
      csvRows.push(`${t.payment_id},${t.student_name},${t.student_email},${t.amount},${t.category},${t.created_at}`);
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vendor_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#FF6B35', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Vendor POS Terminal...</p>
      </div>
    );
  }

  const { businessName = 'Campus POS', category = 'Merchant Store', location = 'Campus Plaza', todaySales = 0, todayCount = 0, monthlySales = 0, qrCodes = [], recentTransactions = [] } = data || {};
  const avgOrderValue = todayCount > 0 ? (todaySales / todayCount) : 0;

  return (
    <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      
      {/* VENDOR POS HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">
            {businessName} POS Terminal 🏪
          </h1>
          <p style={{ color: '#4A5568', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            Category: <strong style={{ color: '#FF6B35' }}>{category}</strong> • Location: {location}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownloadReportCSV} className="btn btn-secondary">
            <Download size={18} /> Export Sales Report
          </button>
          <button onClick={() => setShowQRModal(true)} className="btn btn-coral">
            <QrCode size={18} /> Generate Custom Amount QR
          </button>
        </div>
      </div>

      {/* POS METRICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Today's Sales Card */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4A5568', textTransform: 'uppercase' }}>
            Today's Sales
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FF6B35', margin: '6px 0 0 0' }} className="font-heading">
            ₹{Number(todaySales).toFixed(2)}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#101B3D', fontWeight: 700 }}>Real-time POS credit</span>
        </div>

        {/* Total Transactions Card */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4A5568', textTransform: 'uppercase' }}>
            Today's Transactions
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#101B3D', margin: '6px 0 0 0' }} className="font-heading">
            {todayCount} Orders
          </div>
          <span style={{ fontSize: '0.74rem', color: '#4A5568' }}>Completed QR scans</span>
        </div>

        {/* Average Order Value */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4A5568', textTransform: 'uppercase' }}>
            Average Order Value
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#101B3D', margin: '6px 0 0 0' }} className="font-heading">
            ₹{avgOrderValue.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#4A5568' }}>Per order average</span>
        </div>

        {/* Monthly Revenue */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FF6B35', textTransform: 'uppercase' }}>
            Monthly Revenue
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FF6B35', margin: '6px 0 0 0' }} className="font-heading">
            ₹{monthlySales.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#101B3D', fontWeight: 700 }}>Current Month Total</span>
        </div>

      </div>

      {/* TWO COLUMN POS LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* ACTIVE MERCHANT QR CODES */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Active Merchant QR Codes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {qrCodes && qrCodes.length > 0 ? (
              qrCodes.map(qr => (
                <div key={qr.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#F7F5F0',
                  border: '1px solid rgba(16, 27, 61, 0.12)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', borderRadius: '14px', background: '#101B3D', color: '#FFFFFF' }}>
                      <QrCode size={26} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FF6B35' }}>{qr.qr_id}</div>
                      <div style={{ fontSize: '0.78rem', color: '#4A5568' }}>
                        {qr.fixed_amount ? `Fixed Price: ₹${qr.fixed_amount}` : 'Dynamic Customer Input'}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-coral">ACTIVE</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#4A5568', textAlign: 'center', padding: '20px 0' }}>No active QR codes generated.</p>
            )}
          </div>
        </div>

        {/* LIVE SALES FEED */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Live Sales Transactions</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map(t => (
                <div key={t.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#F7F5F0',
                  border: '1px solid rgba(16, 27, 61, 0.12)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#101B3D' }}>{t.student_name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#4A5568' }}>
                      Txn: {t.transaction_id} • {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FF6B35' }}>
                      +₹{Number(t.amount).toFixed(2)}
                    </div>
                    <span className="badge badge-coral" style={{ fontSize: '0.65rem' }}>SUCCESS</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#4A5568', textAlign: 'center', padding: '20px 0' }}>No sales received yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* GENERATE QR MODAL */}
      {showQRModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(16, 27, 61, 0.75)',
          backdropFilter: 'blur(16px)',
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
            padding: '28px',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            boxShadow: '0 25px 50px rgba(16, 27, 61, 0.25)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', color: '#101B3D' }} className="font-heading">Generate Merchant QR</h3>
            
            <form onSubmit={handleGenerateQR}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#101B3D' }}>Fixed Payment Amount (₹ - Optional)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Leave empty for customer to input amount"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                />
              </div>

              {generatedQR && (
                <div style={{ background: '#F7F5F0', padding: '18px', borderRadius: '20px', border: '1px solid rgba(255, 107, 53, 0.3)', marginBottom: '16px', textAlign: 'center' }}>
                  <QrCode size={70} style={{ color: '#FF6B35', margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 800, color: '#101B3D', fontSize: '1.1rem' }}>{generatedQR.qrId}</div>
                  <div style={{ fontSize: '0.8rem', color: '#4A5568' }}>
                    {generatedQR.fixedAmount ? `Fixed Price: ₹${generatedQR.fixedAmount}` : 'Dynamic Customer Amount QR'}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => { setShowQRModal(false); setGeneratedQR(null); }} className="btn btn-secondary" style={{ flex: 1 }}>
                  Close
                </button>
                <button type="submit" disabled={qrLoading} className="btn btn-coral" style={{ flex: 1 }}>
                  {qrLoading ? 'Generating...' : 'Create Secure QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
