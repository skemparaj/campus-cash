const db = require('../config/database');

function getVendorDashboard(req, res) {
  const vendorUserId = req.user.id;

  // 1. Vendor Profile & Wallet
  const vendor = db.prepare('SELECT * FROM vendors WHERE user_id = ?').get(vendorUserId);
  const wallet = db.prepare('SELECT balance, currency FROM wallets WHERE user_id = ?').get(vendorUserId);

  if (!vendor || !wallet) {
    return res.status(404).json({ success: false, error: 'Vendor profile or wallet not found.' });
  }

  // 2. Sales stats
  const todaySalesRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM payments
    WHERE vendor_id = ? AND DATE(created_at) = DATE('now')
  `).get(vendorUserId);

  const monthlySalesRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM payments
    WHERE vendor_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
  `).get(vendorUserId);

  const totalSalesRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM payments
    WHERE vendor_id = ?
  `).get(vendorUserId);

  // 3. QR Codes
  const qrCodes = db.prepare('SELECT * FROM qr_codes WHERE vendor_id = ?').all(vendorUserId);

  // 4. Sales list
  const recentTransactions = db.prepare(`
    SELECT p.*, u.name as student_name, u.email as student_email, wt.transaction_id, wt.created_at
    FROM payments p
    JOIN wallet_transactions wt ON p.transaction_id = wt.transaction_id
    JOIN users u ON p.student_id = u.id
    WHERE p.vendor_id = ?
    ORDER BY p.created_at DESC
    LIMIT 20
  `).all(vendorUserId);

  return res.json({
    success: true,
    data: {
      businessName: vendor.business_name,
      category: vendor.category,
      location: vendor.location,
      walletBalance: Number(wallet.balance),
      todaySales: Number(todaySalesRow.total),
      todayCount: Number(todaySalesRow.count),
      monthlySales: Number(monthlySalesRow.total),
      monthlyCount: Number(monthlySalesRow.count),
      totalRevenue: Number(totalSalesRow.total),
      totalTransactions: Number(totalSalesRow.count),
      qrCodes,
      recentTransactions
    }
  });
}

function generateQRCode(req, res) {
  const vendorUserId = req.user.id;
  const { fixedAmount, note } = req.body;

  const vendor = db.prepare('SELECT * FROM vendors WHERE user_id = ?').get(vendorUserId);
  if (!vendor) {
    return res.status(404).json({ success: false, error: 'Vendor profile not found.' });
  }

  const qrId = `QR_${vendor.category.toUpperCase().substring(0, 4)}_${Date.now()}`;
  const amountVal = fixedAmount && Number(fixedAmount) > 0 ? Number(fixedAmount) : null;

  db.prepare(`
    INSERT INTO qr_codes (qr_id, vendor_id, vendor_name, category, fixed_amount, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(qrId, vendorUserId, vendor.business_name, vendor.category, amountVal);

  db.prepare(`
    INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
    VALUES (?, ?, 'VENDOR', 'Generate QR Code', 'VENDOR', 'SUCCESS', ?)
  `).run(vendorUserId, req.user.email, `Generated QR ${qrId} (Fixed Amount: ₹${amountVal || 'Dynamic'})`);

  return res.status(201).json({
    success: true,
    message: 'QR Code Generated Successfully',
    qrCode: {
      qrId,
      vendorName: vendor.business_name,
      category: vendor.category,
      fixedAmount: amountVal,
      isActive: true
    }
  });
}

module.exports = {
  getVendorDashboard,
  generateQRCode
};
