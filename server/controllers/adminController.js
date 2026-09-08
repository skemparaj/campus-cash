const db = require('../config/database');

function getAdminDashboard(req, res) {
  // 1. High level KPIs
  const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'").get().count;
  const totalParents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'PARENT'").get().count;
  const totalVendors = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'VENDOR'").get().count;

  const todayVolumeRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM wallet_transactions
    WHERE type = 'PAYMENT' AND status = 'SUCCESS' AND DATE(created_at) = DATE('now')
  `).get();

  const totalSystemBalanceRow = db.prepare('SELECT COALESCE(SUM(balance), 0) as total FROM wallets').get();

  // 2. Campus Pulse Metrics
  const activeVendors = db.prepare("SELECT COUNT(*) as count FROM vendors WHERE is_approved = 1").get().count;
  const totalTxnsEver = db.prepare("SELECT COUNT(*) as count FROM wallet_transactions WHERE status = 'SUCCESS'").get().count;

  // 3. Category Breakdown
  const categoryBreakdown = db.prepare(`
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM payments
    GROUP BY category
    ORDER BY total DESC
  `).all();

  // 4. Daily transaction volume trend
  const dailyTrend = db.prepare(`
    SELECT DATE(created_at) as date, SUM(amount) as volume, COUNT(*) as count
    FROM wallet_transactions
    WHERE type = 'PAYMENT' AND status = 'SUCCESS'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 14
  `).all();

  // 5. Vendor Performance
  const vendorPerformance = db.prepare(`
    SELECT v.business_name, v.category, COALESCE(SUM(p.amount), 0) as total_volume, COUNT(p.id) as txn_count
    FROM vendors v
    LEFT JOIN payments p ON v.user_id = p.vendor_id
    GROUP BY v.id
    ORDER BY total_volume DESC
  `).all();

  return res.json({
    success: true,
    data: {
      kpis: {
        totalStudents,
        totalParents,
        totalVendors,
        todayTransactions: Number(todayVolumeRow.count),
        todayPaymentVolume: Number(todayVolumeRow.total),
        totalWalletBalance: Number(totalSystemBalanceRow.total),
        activeVendors,
        totalTxnsEver
      },
      categoryBreakdown,
      dailyTrend,
      vendorPerformance
    }
  });
}

function getUsers(req, res) {
  const { role, search } = req.query;

  let sql = `
    SELECT u.id, u.email, u.name, u.role, u.phone, u.status, u.created_at, w.balance
    FROM users u
    LEFT JOIN wallets w ON u.id = w.user_id
    WHERE 1=1
  `;
  const params = [];

  if (role) {
    sql += ' AND u.role = ?';
    params.push(role);
  }

  if (search) {
    sql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY u.created_at DESC';

  const users = db.prepare(sql).all(...params);
  return res.json({ success: true, users });
}

function updateUserStatus(req, res) {
  const { userId, status } = req.body;
  const adminUserId = req.user.id;

  if (!userId || !status) {
    return res.status(400).json({ success: false, error: 'User ID and status are required.' });
  }

  const validStatuses = ['ACTIVE', 'DISABLED', 'PENDING'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status.' });
  }

  const user = db.prepare('SELECT email, role FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, userId);

  // If vendor, update vendor approval flag
  if (user.role === 'VENDOR') {
    db.prepare('UPDATE vendors SET is_approved = ? WHERE user_id = ?').run(status === 'ACTIVE' ? 1 : 0, userId);
  }

  db.prepare(`
    INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
    VALUES (?, ?, 'ADMIN', 'Update User Status', 'ADMIN', 'SUCCESS', ?)
  `).run(adminUserId, req.user.email, `Set user ${user.email} status to ${status}`);

  return res.json({
    success: true,
    message: `User ${user.email} status updated to ${status}.`
  });
}

function getAuditLogs(req, res) {
  const logs = db.prepare(`
    SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50
  `).all();

  return res.json({ success: true, logs });
}

module.exports = {
  getAdminDashboard,
  getUsers,
  updateUserStatus,
  getAuditLogs
};
