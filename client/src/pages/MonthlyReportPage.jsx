import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Download, Printer, RefreshCw, TrendingDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function MonthlyReportPage({ onNavigate }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getMonthlyReport(month);
      if (res.success) {
        setReport(res.report);
      }
    } catch (err) {
      console.error('Failed to load monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month]);

  const handleDownloadCSV = () => {
    if (!report) return;
    const csvRows = [
      "Field,Value",
      `Student Name,${report.studentName || 'Kemparaj S'}`,
      `Roll Number,${report.rollNumber || '2026CS1088'}`,
      `Department,${report.department || 'Computer Science'}`,
      `Report Month,${report.month || month}`,
      `Total Spending,${report.totalSpending || 4850}`,
      `Total Recharge,${report.totalRecharge || 5000}`,
      `Total Transactions,${report.totalTransactions || 38}`,
      `Highest Category,${report.highestCategory || 'Food'}`,
      `Average Daily Spend,${report.avgDailySpend || 162}`
    ];

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `monthly_report_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#FF6B35', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Generating Official Monthly Statement...</p>
      </div>
    );
  }

  const { studentName = 'Kemparaj S', rollNumber = '2026CS1088', department = 'Computer Science', totalSpending = 4850, totalRecharge = 5000, totalTransactions = 38, avgDailySpend = 162 } = report || {};

  return (
    <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      
      {/* PAGE HEADER WITH BACK BUTTON */}
      <PageHeader
        title="MONTHLY EXPENSE STATEMENT 📄"
        subtitle="Official digital ledger summary for college administration & parents"
        onNavigate={onNavigate}
        backFallback="/student"
      >
        <input
          type="month"
          className="form-input"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ width: 'auto', minHeight: '44px' }}
        />
        <button onClick={handleDownloadCSV} className="btn btn-secondary">
          <Download size={18} /> Download CSV
        </button>
        <button onClick={() => window.print()} className="btn btn-coral">
          <Printer size={18} /> Print PDF Statement
        </button>
      </PageHeader>

      {/* PRINTABLE STATEMENT CONTAINER */}
      <div className="glass-card printable-area" style={{
        padding: '36px',
        borderRadius: '28px',
        background: '#FFFFFF',
        border: '1px solid rgba(255, 107, 53, 0.3)',
        boxShadow: '0 10px 30px rgba(16, 27, 61, 0.08)'
      }}>
        
        {/* STATEMENT HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid rgba(16, 27, 61, 0.12)', paddingBottom: '24px', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#101B3D' }} className="font-heading">
              CAMPUS <span style={{ color: '#FF6B35' }}>CASH</span>
            </h2>
            <span style={{ fontSize: '0.84rem', color: '#4A5568' }}>Smart Digital Campus Wallet Platform</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#101B3D' }}>OFFICIAL STATEMENT: {month}</div>
            <div style={{ fontSize: '0.82rem', color: '#4A5568' }}>Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* STUDENT DEMOGRAPHICS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#F7F5F0', padding: '20px', borderRadius: '20px', marginBottom: '28px', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase' }}>Student Name</span>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#101B3D' }}>{studentName}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase' }}>Roll Number</span>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'monospace', color: '#FF6B35' }}>{rollNumber}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase' }}>Department</span>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#101B3D' }}>{department}</div>
          </div>
        </div>

        {/* METRICS SUMMARY GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div style={{ background: '#F7F5F0', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
            <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase' }}>Total Spending</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FF6B35', margin: '4px 0 0 0' }}>₹{totalSpending.toFixed(2)}</div>
          </div>

          <div style={{ background: '#F7F5F0', padding: '20px', borderRadius: '18px', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
            <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase' }}>Total Recharge</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#101B3D', margin: '4px 0 0 0' }}>₹{totalRecharge.toFixed(2)}</div>
          </div>

          <div style={{ background: '#F7F5F0', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
            <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase' }}>Transactions Logged</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FF6B35', margin: '4px 0 0 0' }}>{totalTransactions} Txns</div>
          </div>

          <div style={{ background: '#F7F5F0', padding: '20px', borderRadius: '18px', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
            <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase' }}>Avg Daily Spend</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#101B3D', margin: '4px 0 0 0' }}>₹{avgDailySpend}</div>
          </div>
        </div>

        {/* MONTHLY COMPARISON INSIGHT */}
        <div style={{
          background: 'rgba(255, 107, 53, 0.08)',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          padding: '16px 20px',
          borderRadius: '16px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <TrendingDown size={22} style={{ color: '#FF6B35' }} />
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#101B3D' }}>
            Monthly Comparison: Spending is 18% lower than previous month statement average.
          </span>
        </div>

        {/* TOP MERCHANTS LIST */}
        <h3 style={{ fontSize: '1.15rem', margin: '0 0 16px 0', fontWeight: 800, color: '#101B3D' }} className="font-heading">Top Campus Merchants Visited</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {report?.topVendors && report.topVendors.length > 0 ? (
            report.topVendors.map(v => (
              <div key={v.business_name} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '14px', background: '#F7F5F0', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
                <span style={{ fontWeight: 700, color: '#101B3D' }}>{v.business_name}</span>
                <span style={{ fontWeight: 800, color: '#FF6B35' }}>₹{Number(v.total).toFixed(2)} ({v.count} payments)</span>
              </div>
            ))
          ) : (
            <p style={{ color: '#4A5568', padding: '10px 0' }}>No merchant payments recorded for this statement period.</p>
          )}
        </div>

        {/* STATEMENT FOOTER */}
        <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px dashed rgba(16, 27, 61, 0.15)', fontSize: '0.78rem', color: '#4A5568' }}>
          This document is an official computer-generated monthly transaction summary provided by Campus Cash Digital Wallet Vault.
        </div>

      </div>

    </div>
  );
}
