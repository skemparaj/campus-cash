import React from 'react';
import { Wallet, Printer, Download, X, CheckCircle, QrCode, Share2 } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Transaction ID,Student,Vendor,Amount,Category,Date,Previous Balance,Remaining Balance\n"
      + `${receipt.transaction_id},${receipt.student_name || 'Kemparaj S'},${receipt.vendor_name},${receipt.amount},${receipt.vendor_category || 'General'},${receipt.created_at},${receipt.previous_balance},${receipt.new_balance}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `receipt_${receipt.transaction_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Campus Cash Digital Receipt: ${receipt.transaction_id} - ₹${receipt.amount} paid to ${receipt.vendor_name}`);
      alert('Receipt transaction details copied to clipboard!');
    }
  };

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
      <div className="glass-card printable-area" style={{
        width: '100%',
        maxWidth: '460px',
        background: '#FFFFFF',
        borderRadius: '28px',
        padding: '32px',
        position: 'relative',
        border: '1px solid rgba(255, 107, 53, 0.3)',
        boxShadow: '0 25px 50px rgba(16, 27, 61, 0.25)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="no-print"
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

        {/* Receipt Header */}
        <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(16, 27, 61, 0.15)', paddingBottom: '20px', marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: '#FF6B35',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            boxShadow: '0 6px 16px rgba(255, 107, 53, 0.4)'
          }}>
            <Wallet color="#FFFFFF" size={26} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">CAMPUS CASH</h2>
          <span style={{ fontSize: '0.74rem', color: '#4A5568', letterSpacing: '0.08em', fontWeight: 700 }}>
            OFFICIAL DIGITAL RECEIPT
          </span>
        </div>

        {/* Status & Amount */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="badge badge-coral" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            <CheckCircle size={14} /> PAYMENT SUCCESSFUL
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FF6B35', marginTop: '8px' }}>
            ₹{Number(receipt.amount).toFixed(2)}
          </div>
        </div>

        {/* Receipt Details Breakdown */}
        <div style={{
          background: '#F7F5F0',
          padding: '18px',
          borderRadius: '20px',
          fontSize: '0.86rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '24px',
          border: '1px solid rgba(16, 27, 61, 0.12)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4A5568' }}>Transaction ID:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#FF6B35' }}>{receipt.transaction_id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4A5568' }}>Student:</span>
            <span style={{ fontWeight: 700, color: '#101B3D' }}>{receipt.student_name || 'Kemparaj S'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4A5568' }}>Vendor:</span>
            <span style={{ fontWeight: 800, color: '#101B3D' }}>{receipt.vendor_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4A5568' }}>Payment Method:</span>
            <span style={{ fontWeight: 700, color: '#FF6B35' }}>Campus Cash Digital Wallet</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4A5568' }}>Date & Time:</span>
            <span style={{ color: '#101B3D' }}>{new Date(receipt.created_at).toLocaleString()}</span>
          </div>
          <div style={{ borderTop: '1px dashed rgba(16, 27, 61, 0.15)', paddingTop: '8px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#4A5568' }}>Previous Balance:</span>
              <span style={{ color: '#101B3D' }}>₹{Number(receipt.previous_balance || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4A5568' }}>Remaining Balance:</span>
              <span style={{ fontWeight: 800, color: '#101B3D' }}>₹{Number(receipt.new_balance || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Verification QR Code */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-block',
            padding: '10px',
            background: '#F7F5F0',
            borderRadius: '12px',
            border: '1px solid rgba(16, 27, 61, 0.12)'
          }}>
            <QrCode size={65} color="#101B3D" />
          </div>
          <div style={{ fontSize: '0.72rem', color: '#4A5568', marginTop: '6px' }}>
            Token: {receipt.transaction_id}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownloadCSV} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            <Download size={15} /> CSV
          </button>
          <button onClick={handleShare} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            <Share2 size={15} /> Share
          </button>
          <button onClick={handlePrint} className="btn btn-coral btn-sm" style={{ flex: 1 }}>
            <Printer size={15} /> Print PDF
          </button>
        </div>
      </div>
    </div>
  );
}
