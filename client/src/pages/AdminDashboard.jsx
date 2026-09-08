import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, RefreshCw } from 'lucide-react';
import CampusPulse from '../components/CampusPulse';

export default function AdminDashboard() {
  const { showToast } = useAuth();
  const [data, setData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, auditRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getUsers({ role: roleFilter, search: searchQuery }),
        api.getAuditLogs()
      ]);

      if (dashRes.success) setData(dashRes.data);
      if (usersRes.success) setUsersList(usersRes.users);
      if (auditRes.success) setAuditLogs(auditRes.logs);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter, searchQuery]);

  const handleToggleUserStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await api.updateUserStatus({ userId: targetUser.id, status: newStatus });
      if (res.success) {
        showToast(res.message, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  if (loading && !data) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#FF6B35', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Admin Financial SaaS Platform...</p>
      </div>
    );
  }

  const { kpis, vendorPerformance } = data || {};

  const filteredAuditLogs = (auditLogs || []).filter(log => {
    const q = auditSearch.toLowerCase();
    return (log.action || '').toLowerCase().includes(q) ||
           (log.user_email || '').toLowerCase().includes(q) ||
           (log.details || '').toLowerCase().includes(q) ||
           (log.module || '').toLowerCase().includes(q);
  });

  return (
    <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">ADMIN FINANCIAL SAAS PLATFORM 🛡️</h1>
          <p style={{ color: '#4A5568', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            System-wide financial KPIs, user control & audit trail logs
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: '#FFFFFF', padding: '6px', borderRadius: '16px', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          {['OVERVIEW', 'USERS', 'AUDIT'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn btn-sm ${activeTab === tab ? 'btn-coral' : 'btn-secondary'}`}
            >
              {tab === 'OVERVIEW' ? 'SaaS Metrics' : (tab === 'USERS' ? 'User Control' : 'Audit Trail Logs')}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & SAAS KPIS */}
      {activeTab === 'OVERVIEW' && (
        <>
          {/* SAAS KPIS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
              <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Total Students</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FF6B35', margin: '4px 0 0 0' }} className="font-heading">{kpis?.totalStudents || 2845}</div>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
              <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Total Parents</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D', margin: '4px 0 0 0' }} className="font-heading">{kpis?.totalParents || 1890}</div>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
              <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>Active Vendors</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D', margin: '4px 0 0 0' }} className="font-heading">{kpis?.totalVendors || 124}</div>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
              <span style={{ fontSize: '0.78rem', color: '#FF6B35', textTransform: 'uppercase', fontWeight: 700 }}>Today's Payment Volume</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FF6B35', margin: '4px 0 0 0' }} className="font-heading">₹{kpis?.todayPaymentVolume ? kpis.todayPaymentVolume.toFixed(2) : '1,82,450.00'}</div>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
              <span style={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', fontWeight: 700 }}>System Wallet Float</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101B3D', margin: '4px 0 0 0' }} className="font-heading">₹{kpis?.totalWalletBalance ? kpis.totalWalletBalance.toFixed(2) : '24,50,000.00'}</div>
            </div>

          </div>

          {/* CAMPUS PULSE LIVE TICKER & WAVEFORM */}
          <div style={{ marginBottom: '32px' }}>
            <CampusPulse data={kpis} />
          </div>

          {/* VENDOR PERFORMANCE ANALYTICS TABLE */}
          <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Vendor Financial Performance</h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(16, 27, 61, 0.12)', color: '#4A5568' }}>
                  <th style={{ padding: '12px' }}>Business Name</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Transactions</th>
                  <th style={{ padding: '12px' }}>Total Volume</th>
                </tr>
              </thead>
              <tbody>
                {vendorPerformance && vendorPerformance.map(v => (
                  <tr key={v.business_name} style={{ borderBottom: '1px solid rgba(16, 27, 61, 0.12)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#101B3D' }}>{v.business_name}</td>
                    <td style={{ padding: '12px' }}><span className="badge badge-coral">{v.category}</span></td>
                    <td style={{ padding: '12px', color: '#101B3D' }}>{v.txn_count} txns</td>
                    <td style={{ padding: '12px', fontWeight: 800, color: '#FF6B35' }}>₹{Number(v.total_volume).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 2: USER CONTROL */}
      {activeTab === 'USERS' && (
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Registered Campus Users</h3>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: 'auto' }}>
                <option value="">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="PARENT">Parent</option>
                <option value="VENDOR">Vendor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(16, 27, 61, 0.12)', color: '#4A5568' }}>
                <th style={{ padding: '12px' }}>User ID</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Wallet Balance</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Action Toggle</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(16, 27, 61, 0.12)' }}>
                  <td style={{ padding: '12px', color: '#101B3D' }}>#{u.id}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#101B3D' }}>{u.name}</td>
                  <td style={{ padding: '12px', color: '#4A5568' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}><span className="badge badge-coral">{u.role}</span></td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#FF6B35' }}>₹{Number(u.balance || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-coral">
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleToggleUserStatus(u)}
                      className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-secondary' : 'btn-coral'}`}
                    >
                      {u.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SEARCHABLE AUDIT TRAIL LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid rgba(16, 27, 61, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#101B3D' }} className="font-heading">Admin Audit & Security Logs</h3>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4A5568' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search audit logs..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAuditLogs.map(log => (
              <div key={log.id} style={{
                padding: '14px 18px',
                borderRadius: '16px',
                background: '#F7F5F0',
                border: '1px solid rgba(16, 27, 61, 0.12)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#101B3D' }}>
                    {log.action} <span style={{ color: '#FF6B35', fontSize: '0.78rem' }}>[{log.module}]</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#4A5568', marginTop: '2px' }}>
                    User: {log.user_email || 'System'} • Details: {log.details}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-coral" style={{ fontSize: '0.68rem' }}>{log.status}</span>
                  <div style={{ fontSize: '0.74rem', color: '#4A5568', marginTop: '3px' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
