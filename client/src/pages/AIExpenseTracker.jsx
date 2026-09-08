import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sparkles, RefreshCw, BrainCircuit } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function AIExpenseTracker({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAIAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.getAIExpenseAnalysis();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load AI Expense Analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#FF6B35', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Analyzing transactions with AI Financial Analytics Engine...</p>
      </div>
    );
  }

  const { totalSpent = 0, totalTransactions = 0, highestCategory = 'N/A', highestCategorySpent = 0, highestCatPercentage = 0, averageDailySpend = 0, categoryBreakdown = [], insights = [] } = data || {};

  const colors = ['#FF6B35', '#101B3D', '#3B82F6', '#10B981', '#8B5CF6'];
  const categories = (categoryBreakdown && categoryBreakdown.length > 0)
    ? categoryBreakdown.map((c, i) => ({
        name: c.category,
        amount: Number(c.total),
        pct: totalSpent > 0 ? Math.round((Number(c.total) / totalSpent) * 100) : 0,
        color: colors[i % colors.length]
      }))
    : [];

  const mainTip = (insights && insights.length > 0)
    ? insights[0]
    : `Logged ${totalTransactions} campus payments totaling ₹${totalSpent.toFixed(2)}.`;

  return (
    <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      
      {/* PAGE HEADER WITH BACK BUTTON */}
      <PageHeader
        title="AI EXPENSE TRACKER & BUDGET ADVISOR 🤖"
        subtitle="Intelligent spending analysis, predictions & recommendations for campus life"
        onNavigate={onNavigate}
        backFallback="/student"
      />

      {/* MAIN AI EXPENSE INSIGHT CARD */}
      <div className="glass-card" style={{
        padding: '32px',
        borderRadius: '28px',
        background: '#FFFFFF',
        border: '1px solid rgba(255, 107, 53, 0.3)',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-main)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#FF6B35', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#FF6B35', fontWeight: 700, textTransform: 'uppercase' }}>AI FINANCIAL ADVISOR</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#101B3D', margin: 0 }} className="font-heading">
              "{mainTip}"
            </h2>
          </div>
        </div>
        <p style={{ color: '#4A5568', fontSize: '0.92rem', margin: 0, maxWidth: '600px' }}>
          Based on {totalTransactions} campus payments logged. Real-time budget analytics active.
        </p>
      </div>

      {/* INTELLIGENT METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#101B3D', textTransform: 'uppercase' }}>Total Spending</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FF6B35', margin: '6px 0 0 0' }} className="font-heading">₹{Number(totalSpent).toFixed(2)}</div>
          <span style={{ fontSize: '0.76rem', color: '#101B3D', fontWeight: 700 }}>Total logged expenses</span>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FF6B35', textTransform: 'uppercase' }}>Highest Category</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D', margin: '6px 0 0 0' }} className="font-heading">{highestCategory}</div>
          <span style={{ fontSize: '0.76rem', color: '#4A5568' }}>₹{Number(highestCategorySpent).toFixed(2)} ({highestCatPercentage}%)</span>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#101B3D', textTransform: 'uppercase' }}>Average Daily Spend</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FF6B35', margin: '6px 0 0 0' }} className="font-heading">₹{averageDailySpend} / day</div>
          <span style={{ fontSize: '0.76rem', color: '#4A5568' }}>Calculated daily average</span>
        </div>

      </div>

      {/* CATEGORY BREAKDOWN LIST */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Category Spending Breakdown</h3>

        {categories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categories.map(c => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#101B3D' }}>{c.name}</span>
                  <span style={{ fontWeight: 800, color: '#FF6B35' }}>₹{c.amount.toFixed(2)} ({c.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '10px', borderRadius: '5px', background: '#F7F5F0', overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: '5px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#4A5568', textAlign: 'center', padding: '20px 0' }}>No category payments logged yet.</p>
        )}
      </div>

    </div>
  );
}
