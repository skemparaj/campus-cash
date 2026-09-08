const db = require('../config/database');

// Resolve QR Code details before confirming payment
function initiatePayment(req, res) {
  const { qrCodeId, amount } = req.body;
  const studentUserId = req.user.id;

  if (!qrCodeId) {
    return res.status(400).json({ success: false, error: 'QR Code is required.' });
  }

  // 1. Resolve QR code
  const qrRecord = db.prepare(`
    SELECT q.*, v.user_id as vendor_user_id, u.name as vendor_owner_name, v.business_name
    FROM qr_codes q
    JOIN vendors v ON q.vendor_id = v.user_id
    JOIN users u ON v.user_id = u.id
    WHERE q.qr_id = ? AND q.is_active = 1
  `).get(qrCodeId);

  if (!qrRecord) {
    return res.status(404).json({ success: false, error: 'This QR code is invalid or expired.' });
  }

  // 2. Fetch student wallet
  const studentWallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(studentUserId);
  if (!studentWallet) {
    return res.status(404).json({ success: false, error: 'Student wallet not found.' });
  }

  const finalAmount = qrRecord.fixed_amount ? Number(qrRecord.fixed_amount) : (amount ? Number(amount) : null);

  return res.json({
    success: true,
    data: {
      qrId: qrRecord.qr_id,
      vendorUserId: qrRecord.vendor_user_id,
      vendorName: qrRecord.business_name || qrRecord.vendor_name,
      category: qrRecord.category,
      walletBalance: Number(studentWallet.balance),
      suggestedAmount: finalAmount,
      isFixedAmount: Boolean(qrRecord.fixed_amount)
    }
  });
}

// Atomic Payment Execution Engine
function confirmPayment(req, res) {
  const { amount, vendorUserId, idempotencyKey: bodyIdempotencyKey } = req.body;
  const qrCodeId = req.body.qrCodeId || req.body.qrId;
  const idempotencyKey = req.headers['x-idempotency-key'] || bodyIdempotencyKey;
  const studentUserId = req.user.id;

  const numAmount = Number(amount);

  // 1. Validations
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Please enter a valid payment amount greater than zero.' });
  }

  // Prevent absurdly high accidental payments (e.g. > 10,000)
  if (numAmount > 10000) {
    return res.status(400).json({ success: false, error: 'Maximum single demo transaction limit is ₹10,000.' });
  }

  // Integer minor units (paise) for exact financial precision without float drift
  const numAmountPaise = Math.round(numAmount * 100);

  // Idempotency check: prevent duplicate payments if retry occurs
  if (idempotencyKey) {
    const existingTx = db.prepare(`
      SELECT wt.*, p.payment_id, v.business_name as vendor_name, p.category
      FROM wallet_transactions wt
      LEFT JOIN payments p ON wt.transaction_id = p.transaction_id
      LEFT JOIN vendors v ON p.vendor_id = v.user_id
      WHERE wt.reference_id = ? AND wt.user_id = ? AND wt.status = 'SUCCESS'
    `).get(idempotencyKey, studentUserId);

    if (existingTx) {
      return res.json({
        success: true,
        message: 'Payment already processed (Idempotent response)',
        data: {
          transactionId: existingTx.transaction_id,
          paymentId: existingTx.payment_id || `PAY_${existingTx.id}`,
          amount: Number(existingTx.amount),
          vendorName: existingTx.vendor_name || 'Campus Merchant',
          previousBalance: Number(existingTx.previous_balance),
          remainingBalance: Number(existingTx.new_balance),
          pointsEarned: Math.floor(Number(existingTx.amount) * 0.10),
          timestamp: existingTx.created_at
        }
      });
    }
  }

  try {
    const result = db.transaction(() => {
      // Fetch student user & student profile
      const studentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(studentUserId);
      if (!studentUser || studentUser.status === 'DISABLED') {
        throw new Error('Student account disabled or invalid.');
      }
      const studentProfile = db.prepare('SELECT * FROM students WHERE user_id = ?').get(studentUserId);

      // Lock & fetch student wallet
      const studentWallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(studentUserId);
      if (!studentWallet) {
        throw new Error('Student wallet not found.');
      }

      // Financial precision: calculate balance in integer minor units (paise)
      const currentBalancePaise = Math.round(Number(studentWallet.balance) * 100);
      if (currentBalancePaise < numAmountPaise) {
        const balRupees = (currentBalancePaise / 100).toFixed(2);
        const reqRupees = (numAmountPaise / 100).toFixed(2);
        throw new Error(`Your wallet balance (₹${balRupees}) is insufficient for this ₹${reqRupees} payment.`);
      }

      // Check Parent Spending Limits if configured
      if (studentProfile && studentProfile.parent_id) {
        const spendingLimit = db.prepare('SELECT * FROM spending_limits WHERE student_id = ?').get(studentUserId);
        if (spendingLimit) {
          const dailyLimitPaise = Math.round(Number(spendingLimit.daily_limit || 500) * 100);
          const weeklyLimitPaise = Math.round(Number(spendingLimit.weekly_limit || 2500) * 100);
          const monthlyLimitPaise = Math.round(Number(spendingLimit.monthly_limit || 5000) * 100);

          const todaySpentRow = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments
            WHERE student_id = ? AND DATE(created_at) = DATE('now') AND status = 'SUCCESS'
          `).get(studentUserId);

          const weeklySpentRow = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments
            WHERE student_id = ? AND strftime('%Y-%W', created_at) = strftime('%Y-%W', 'now') AND status = 'SUCCESS'
          `).get(studentUserId);

          const monthlySpentRow = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments
            WHERE student_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND status = 'SUCCESS'
          `).get(studentUserId);

          const todaySpentPaise = Math.round(Number(todaySpentRow.total) * 100);
          const weeklySpentPaise = Math.round(Number(weeklySpentRow.total) * 100);
          const monthlySpentPaise = Math.round(Number(monthlySpentRow.total) * 100);

          const isDailyExceeded = (todaySpentPaise + numAmountPaise) > dailyLimitPaise;
          const isWeeklyExceeded = (weeklySpentPaise + numAmountPaise) > weeklyLimitPaise;
          const isMonthlyExceeded = (monthlySpentPaise + numAmountPaise) > monthlyLimitPaise;

          if (spendingLimit.action_on_exceed === 'BLOCK') {
            if (isDailyExceeded) {
              throw new Error(`Payment blocked! Daily spending limit of ₹${spendingLimit.daily_limit} exceeded.`);
            }
            if (isWeeklyExceeded) {
              throw new Error(`Payment blocked! Weekly spending limit of ₹${spendingLimit.weekly_limit} exceeded.`);
            }
            if (isMonthlyExceeded) {
              throw new Error(`Payment blocked! Monthly spending limit of ₹${spendingLimit.monthly_limit} exceeded.`);
            }
          } else if (spendingLimit.action_on_exceed === 'WARNING' && (isDailyExceeded || isWeeklyExceeded || isMonthlyExceeded)) {
            // Trigger warning notification to parent and student
            const warnMsg = `Warning: Payment of ₹${numAmount} exceeded spending limit threshold set by parent.`;
            db.prepare(`
              INSERT INTO notifications (user_id, title, message, category)
              VALUES (?, 'Spending Limit Warning', ?, 'Warning')
            `).run(studentProfile.parent_id, warnMsg);

            db.prepare(`
              INSERT INTO notifications (user_id, title, message, category)
              VALUES (?, 'Spending Limit Warning', ?, 'Warning')
            `).run(studentUserId, warnMsg);
          }
        }
      }

      // Fetch vendor details via user_id, qr_code_id, or qr_codes table qr_id
      const vendorUser = db.prepare(`
        SELECT v.*, u.name as owner_name, u.id as vendor_user_id
        FROM vendors v
        JOIN users u ON v.user_id = u.id
        LEFT JOIN qr_codes q ON v.user_id = q.vendor_id
        WHERE v.user_id = ? OR v.qr_code_id = ? OR q.qr_id = ?
      `).get(vendorUserId || null, qrCodeId || null, qrCodeId || null);

      if (!vendorUser) {
        throw new Error('Vendor account could not be found for the provided QR/merchant ID.');
      }

      const vendorWallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(vendorUser.user_id);
      if (!vendorWallet) {
        throw new Error('Vendor wallet not found.');
      }

      // Generate Unique Transaction ID
      const txId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentId = `PAY_${Date.now()}`;

      // Calculate balances in paise and convert back to rupees
      const newStudentBalPaise = currentBalancePaise - numAmountPaise;
      const vendorCurrentBalPaise = Math.round(Number(vendorWallet.balance) * 100);
      const newVendorBalPaise = vendorCurrentBalPaise + numAmountPaise;

      const currentBalanceRupees = (currentBalancePaise / 100);
      const newStudentBalRupees = (newStudentBalPaise / 100);
      const vendorCurrentBalRupees = (vendorCurrentBalPaise / 100);
      const newVendorBalRupees = (newVendorBalPaise / 100);

      // Deduct student wallet with atomic balance check in SQL
      const updateStudentRes = db.prepare('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND balance >= ?')
        .run(newStudentBalRupees, studentWallet.id, numAmount);

      if (updateStudentRes.changes === 0) {
        throw new Error('Atomic payment deduction failed due to balance update mismatch.');
      }

      // Credit vendor wallet
      db.prepare('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newVendorBalRupees, vendorWallet.id);

      // Record Ledger Transaction for Student (store idempotencyKey as reference_id if provided)
      const refIdToStore = idempotencyKey || null;

      db.prepare(`
        INSERT INTO wallet_transactions
        (transaction_id, wallet_id, user_id, type, amount, previous_balance, new_balance, reference_id, status, description)
        VALUES (?, ?, ?, 'PAYMENT', ?, ?, ?, ?, 'SUCCESS', ?)
      `).run(
        txId,
        studentWallet.id,
        studentUserId,
        numAmount,
        currentBalanceRupees,
        newStudentBalRupees,
        refIdToStore,
        `Payment to ${vendorUser.business_name}`
      );

      // Record Ledger Transaction for Vendor
      db.prepare(`
        INSERT INTO wallet_transactions
        (transaction_id, wallet_id, user_id, type, amount, previous_balance, new_balance, reference_id, status, description)
        VALUES (?, ?, ?, 'PAYMENT', ?, ?, ?, ?, 'SUCCESS', ?)
      `).run(
        `TXN_VEND_${Date.now()}`,
        vendorWallet.id,
        vendorUser.user_id,
        numAmount,
        vendorCurrentBalRupees,
        newVendorBalRupees,
        txId,
        `Received payment from ${studentUser.name}`
      );

      // Record Payment Entity
      db.prepare(`
        INSERT INTO payments (payment_id, transaction_id, student_id, vendor_id, amount, category, status)
        VALUES (?, ?, ?, ?, ?, ?, 'SUCCESS')
      `).run(paymentId, txId, studentUserId, vendorUser.user_id, numAmount, vendorUser.category || 'Food');

      // Award Reward Points (₹100 = 10 points => 10% points)
      const pointsEarned = Math.floor(numAmount * 0.10);
      if (pointsEarned > 0) {
        db.prepare(`
          INSERT INTO reward_points (student_id, points_balance, lifetime_points)
          VALUES (?, ?, ?)
          ON CONFLICT(student_id) DO UPDATE SET
            points_balance = points_balance + excluded.points_balance,
            lifetime_points = lifetime_points + excluded.lifetime_points,
            updated_at = CURRENT_TIMESTAMP
        `).run(studentUserId, pointsEarned, pointsEarned);

        // Notify student about reward points
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, category)
          VALUES (?, 'Reward Points Earned!', ?, 'Reward')
        `).run(studentUserId, `You earned +${pointsEarned} reward points for spending ₹${numAmount} at ${vendorUser.business_name}.`);
      }

      // Send Parent Notification if student has linked parent
      if (studentProfile && studentProfile.parent_id) {
        const notifMsg = `₹${numAmount} payment completed at ${vendorUser.business_name} by ${studentUser.name}.`;
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, category)
          VALUES (?, 'Payment Alert', ?, 'Payment')
        `).run(studentProfile.parent_id, notifMsg);
      }

      // Record Audit Log
      db.prepare(`
        INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
        VALUES (?, ?, 'STUDENT', 'QR Payment Completed', 'PAYMENT', 'SUCCESS', ?)
      `).run(studentUserId, studentUser.email, `Paid ₹${numAmount} to ${vendorUser.business_name} (Tx: ${txId})`);

      return {
        transactionId: txId,
        paymentId,
        amount: numAmount,
        vendorName: vendorUser.business_name,
        vendorCategory: vendorUser.category,
        previousBalance: currentBalanceRupees,
        remainingBalance: newStudentBalRupees,
        pointsEarned,
        timestamp: new Date().toISOString()
      };
    })();

    return res.json({
      success: true,
      message: 'Payment Successful',
      data: result
    });

  } catch (err) {
    console.error('Payment Error:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || "We couldn't complete the payment. Please try again."
    });
  }
}

// Fetch single payment / digital receipt by transactionId
function getPaymentReceipt(req, res) {
  const { id } = req.params;

  const payment = db.prepare(`
    SELECT p.*, t.previous_balance, t.new_balance, t.created_at,
           u_s.name as student_name, u_s.email as student_email,
           v.business_name as vendor_name, v.category as vendor_category, v.location as vendor_location
    FROM payments p
    JOIN wallet_transactions t ON p.transaction_id = t.transaction_id
    JOIN users u_s ON p.student_id = u_s.id
    JOIN vendors v ON p.vendor_id = v.user_id
    WHERE p.transaction_id = ? OR p.payment_id = ?
  `).get(id, id);

  if (!payment) {
    return res.status(404).json({ success: false, error: 'Receipt not found.' });
  }

  return res.json({
    success: true,
    receipt: payment
  });
}

// Fetch payment history for current logged-in user
function getPaymentHistory(req, res) {
  const userId = req.user.id;
  const role = req.user.role;

  let transactions = [];
  if (role === 'STUDENT') {
    transactions = db.prepare(`
      SELECT wt.*, p.category, p.payment_id, v.business_name as vendor_name
      FROM wallet_transactions wt
      LEFT JOIN payments p ON wt.transaction_id = p.transaction_id
      LEFT JOIN vendors v ON p.vendor_id = v.user_id
      WHERE wt.user_id = ?
      ORDER BY wt.created_at DESC
    `).all(userId);
  } else if (role === 'VENDOR') {
    transactions = db.prepare(`
      SELECT p.*, wt.transaction_id, wt.created_at, u.name as student_name, u.email as student_email
      FROM payments p
      JOIN wallet_transactions wt ON p.transaction_id = wt.transaction_id
      JOIN users u ON p.student_id = u.id
      WHERE p.vendor_id = ?
      ORDER BY p.created_at DESC
    `).all(userId);
  } else if (role === 'ADMIN') {
    transactions = db.prepare(`
      SELECT p.*, wt.created_at, u_s.name as student_name, v.business_name as vendor_name
      FROM payments p
      JOIN wallet_transactions wt ON p.transaction_id = wt.transaction_id
      JOIN users u_s ON p.student_id = u_s.id
      JOIN vendors v ON p.vendor_id = v.user_id
      ORDER BY p.created_at DESC
    `).all();
  }

  return res.json({
    success: true,
    transactions
  });
}

module.exports = {
  initiatePayment,
  confirmPayment,
  getPaymentReceipt,
  getPaymentHistory
};
