const db = require('../config/database');

function getParentDashboard(req, res) {
  const parentUserId = req.user.id;

  // 1. Fetch linked students
  const students = db.prepare(`
    SELECT s.*, u.name as student_name, u.email as student_email, w.balance as wallet_balance
    FROM students s
    JOIN users u ON s.user_id = u.id
    JOIN wallets w ON s.user_id = w.user_id
    WHERE s.parent_id = ?
  `).all(parentUserId);

  if (students.length === 0) {
    return res.json({
      success: true,
      data: {
        parentName: req.user.name,
        students: [],
        primaryStudent: null,
        childWallet: { balance: 0, currency: 'INR' },
        spendingLimits: { daily_limit: 500, weekly_limit: 2500, monthly_limit: 5000, action_on_exceed: 'WARNING' },
        studentTodaySpend: 0,
        childTransactions: [],
        notifications: []
      }
    });
  }

  const primaryStudent = students[0];
  const studentUserId = primaryStudent.user_id;

  // 2. Spending Stats for child
  const todaySpend = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM payments
    WHERE student_id = ? AND DATE(created_at) = DATE('now') AND status = 'SUCCESS'
  `).get(studentUserId);

  const monthlySpend = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM payments
    WHERE student_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND status = 'SUCCESS'
  `).get(studentUserId);

  // 3. Spending Limits & Child Wallet
  const limits = db.prepare('SELECT * FROM spending_limits WHERE student_id = ?').get(studentUserId);
  const childWallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(studentUserId);

  // 4. Child transactions
  const childTransactions = db.prepare(`
    SELECT wt.*, p.category, v.business_name as vendor_name
    FROM wallet_transactions wt
    LEFT JOIN payments p ON wt.transaction_id = p.transaction_id
    LEFT JOIN vendors v ON p.vendor_id = v.user_id
    WHERE wt.user_id = ?
    ORDER BY wt.created_at DESC
    LIMIT 15
  `).all(studentUserId);

  // 5. Parent Notifications
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
  `).all(parentUserId);

  const activeLimits = limits || { daily_limit: 500, weekly_limit: 2500, monthly_limit: 5000, action_on_exceed: 'WARNING' };
  const currentChildBal = childWallet ? Number(childWallet.balance) : 0;
  const currentTodaySpend = Number(todaySpend.total);

  return res.json({
    success: true,
    data: {
      parentName: req.user.name,
      students,
      primaryStudent: {
        ...primaryStudent,
        wallet_balance: currentChildBal,
        todaySpending: currentTodaySpend,
        monthlySpending: Number(monthlySpend.total),
        limits: activeLimits
      },
      childWallet: { balance: currentChildBal, currency: 'INR' },
      spendingLimits: activeLimits,
      studentTodaySpend: currentTodaySpend,
      childTransactions,
      notifications
    }
  });
}

function rechargeStudentWallet(req, res) {
  const { studentUserId, amount } = req.body;
  const parentUserId = req.user.id;
  const numAmount = Number(amount);

  if (!studentUserId || !numAmount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Student and valid recharge amount are required.' });
  }

  // Security Check: Enforce parent-child authorization
  const isLinked = db.prepare('SELECT id FROM students WHERE user_id = ? AND parent_id = ?').get(studentUserId, parentUserId);
  if (!isLinked) {
    return res.status(403).json({ success: false, error: 'Unauthorized. This student is not linked to your parent account.' });
  }

  try {
    const result = db.transaction(() => {
      const studentWallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(studentUserId);
      if (!studentWallet) throw new Error('Student wallet not found.');

      const studentUser = db.prepare('SELECT name, email FROM users WHERE id = ?').get(studentUserId);

      // Financial precision: integer minor units (paise)
      const numAmountPaise = Math.round(numAmount * 100);
      const currentBalPaise = Math.round(Number(studentWallet.balance) * 100);
      const newBalPaise = currentBalPaise + numAmountPaise;

      const currentBalRupees = currentBalPaise / 100;
      const newBalRupees = newBalPaise / 100;
      const txId = `TXN_PAR_RCH_${Date.now()}`;

      // Update student wallet
      db.prepare('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newBalRupees, studentWallet.id);

      // Record transaction
      db.prepare(`
        INSERT INTO wallet_transactions
        (transaction_id, wallet_id, user_id, type, amount, previous_balance, new_balance, reference_id, status, description)
        VALUES (?, ?, ?, 'RECHARGE', ?, ?, ?, ?, 'SUCCESS', ?)
      `).run(
        txId,
        studentWallet.id,
        studentUserId,
        numAmount,
        currentBalRupees,
        newBalRupees,
        `PARENT_${parentUserId}`,
        `Wallet Recharge by Parent ${req.user.name}`
      );

      // Create notification for student
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Wallet Recharged!', ?, 'Recharge')
      `).run(studentUserId, `Your parent ${req.user.name} added ₹${numAmount} to your wallet. New balance: ₹${newBalRupees.toFixed(2)}.`);

      // Create notification for parent
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Recharge Successful', ?, 'Recharge')
      `).run(parentUserId, `Wallet recharge of ₹${numAmount} for ${studentUser.name} was successful.`);

      // Audit Log
      db.prepare(`
        INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
        VALUES (?, ?, 'PARENT', 'Remote Wallet Recharge', 'WALLET', 'SUCCESS', ?)
      `).run(parentUserId, req.user.email, `Recharged ₹${numAmount} for ${studentUser.name}`);

      return { txId, previousBalance: currentBalRupees, newBalance: newBalRupees, studentName: studentUser.name };
    })();

    return res.json({
      success: true,
      message: `Successfully added ₹${numAmount} to ${result.studentName}'s wallet!`,
      data: result
    });
  } catch (err) {
    console.error('Parent Recharge Error:', err);
    return res.status(400).json({ success: false, error: err.message || 'Failed to recharge student wallet.' });
  }
}

function updateSpendingLimit(req, res) {
  const { studentUserId, dailyLimit, weeklyLimit, monthlyLimit, actionOnExceed } = req.body;
  const parentUserId = req.user.id;

  if (!studentUserId) {
    return res.status(400).json({ success: false, error: 'Student ID is required.' });
  }

  // Security Check: Enforce parent-child authorization
  const isLinked = db.prepare('SELECT id FROM students WHERE user_id = ? AND parent_id = ?').get(studentUserId, parentUserId);
  if (!isLinked) {
    return res.status(403).json({ success: false, error: 'Unauthorized. This student is not linked to your parent account.' });
  }

  const dLimit = Number(dailyLimit) || 500;
  const wLimit = Number(weeklyLimit) || 2500;
  const mLimit = Number(monthlyLimit) || 5000;
  const action = actionOnExceed === 'BLOCK' ? 'BLOCK' : 'WARNING';

  db.prepare(`
    INSERT INTO spending_limits (student_id, parent_id, daily_limit, weekly_limit, monthly_limit, action_on_exceed)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
      daily_limit = excluded.daily_limit,
      weekly_limit = excluded.weekly_limit,
      monthly_limit = excluded.monthly_limit,
      action_on_exceed = excluded.action_on_exceed,
      updated_at = CURRENT_TIMESTAMP
  `).run(studentUserId, parentUserId, dLimit, wLimit, mLimit, action);

  // Notify student
  db.prepare(`
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Spending Limits Updated', ?, 'Warning')
  `).run(studentUserId, `Your parent updated your spending limits. Daily: ₹${dLimit}, Monthly: ₹${mLimit} (${action}).`);

  // Audit
  db.prepare(`
    INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
    VALUES (?, ?, 'PARENT', 'Update Spending Limits', 'LIMITS', 'SUCCESS', ?)
  `).run(parentUserId, req.user.email, `Set limits D: ₹${dLimit}, M: ₹${mLimit} (${action})`);

  return res.json({
    success: true,
    message: 'Spending limits updated successfully!'
  });
}

module.exports = {
  getParentDashboard,
  rechargeStudentWallet,
  updateSpendingLimit
};
