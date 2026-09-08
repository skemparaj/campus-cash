const db = require('../config/database');

function getStudentDashboard(req, res) {
  const userId = req.user.id;

  // 1. Fetch wallet
  const wallet = db.prepare('SELECT balance, currency FROM wallets WHERE user_id = ?').get(userId);
  if (!wallet) {
    return res.status(404).json({ success: false, error: 'Student wallet not found.' });
  }

  // 2. Spending stats
  const todaySpendRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM wallet_transactions
    WHERE user_id = ? AND type = 'PAYMENT' AND status = 'SUCCESS'
      AND DATE(created_at) = DATE('now')
  `).get(userId);

  const monthlySpendRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM wallet_transactions
    WHERE user_id = ? AND type = 'PAYMENT' AND status = 'SUCCESS'
      AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
  `).get(userId);

  // 3. Reward Points
  const rewardPoints = db.prepare('SELECT points_balance, lifetime_points FROM reward_points WHERE student_id = ?').get(userId);

  // 4. Category breakdown
  const categoryBreakdown = db.prepare(`
    SELECT p.category, SUM(p.amount) as total, COUNT(*) as count
    FROM payments p
    WHERE p.student_id = ?
    GROUP BY p.category
    ORDER BY total DESC
  `).all(userId);

  // 5. Recent transactions
  const recentTransactions = db.prepare(`
    SELECT wt.*, v.business_name as vendor_name, p.category
    FROM wallet_transactions wt
    LEFT JOIN payments p ON wt.transaction_id = p.transaction_id
    LEFT JOIN vendors v ON p.vendor_id = v.user_id
    WHERE wt.user_id = ?
    ORDER BY wt.created_at DESC
    LIMIT 10
  `).all(userId);

  return res.json({
    success: true,
    data: {
      studentName: req.user.name,
      walletBalance: Number(wallet.balance),
      todaySpending: Number(todaySpendRow.total),
      monthlySpending: Number(monthlySpendRow.total),
      rewardPoints: rewardPoints ? rewardPoints.points_balance : 0,
      lifetimePoints: rewardPoints ? rewardPoints.lifetime_points : 0,
      categoryBreakdown,
      recentTransactions
    }
  });
}

function rechargeWallet(req, res) {
  const { amount, source } = req.body;
  const userId = req.user.id;
  const numAmount = Number(amount);

  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Please enter a valid recharge amount greater than zero.' });
  }

  if (numAmount > 50000) {
    return res.status(400).json({ success: false, error: 'Maximum single demo recharge limit is ₹50,000.' });
  }

  try {
    const result = db.transaction(() => {
      const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
      if (!wallet) throw new Error('Student wallet not found.');

      // Integer minor units (paise) for exact precision
      const numAmountPaise = Math.round(numAmount * 100);
      const currentBalPaise = Math.round(Number(wallet.balance) * 100);
      const newBalPaise = currentBalPaise + numAmountPaise;

      const currentBalRupees = currentBalPaise / 100;
      const newBalRupees = newBalPaise / 100;
      const txId = `TXN_RCH_${Date.now()}`;

      // Update wallet balance
      db.prepare('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newBalRupees, wallet.id);

      // Record transaction ledger
      db.prepare(`
        INSERT INTO wallet_transactions
        (transaction_id, wallet_id, user_id, type, amount, previous_balance, new_balance, reference_id, status, description)
        VALUES (?, ?, ?, 'RECHARGE', ?, ?, ?, 'DEMO_GATEWAY', 'SUCCESS', ?)
      `).run(txId, wallet.id, userId, numAmount, currentBalRupees, newBalRupees, `Virtual Wallet Recharge via ${source || 'Self-Topup'}`);

      // Notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Wallet Recharge Successful', ?, 'Recharge')
      `).run(userId, `Wallet top-up of ₹${numAmount} successful. New balance: ₹${newBalRupees.toFixed(2)}.`);

      // Audit Log
      db.prepare(`
        INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
        VALUES (?, ?, ?, 'Wallet Recharge', 'WALLET', 'SUCCESS', ?)
      `).run(userId, req.user.email, req.user.role, `Recharged ₹${numAmount}`);

      return { txId, previousBalance: currentBalRupees, newBalance: newBalRupees };
    })();

    return res.json({
      success: true,
      message: 'Demo Wallet Recharge Successful',
      data: result
    });
  } catch (err) {
    console.error('Recharge Error:', err);
    return res.status(500).json({ success: false, error: 'Recharge failed. Please try again.' });
  }
}

function getRewardsCatalog(req, res) {
  const userId = req.user.id;

  const pointsRow = db.prepare('SELECT points_balance, lifetime_points FROM reward_points WHERE student_id = ?').get(userId);
  const rewards = db.prepare('SELECT * FROM rewards WHERE is_active = 1').all();
  const redemptions = db.prepare(`
    SELECT rr.*, r.title, r.reward_code
    FROM reward_redemptions rr
    JOIN rewards r ON rr.reward_id = r.id
    WHERE rr.student_id = ?
    ORDER BY rr.redeemed_at DESC
  `).all(userId);

  return res.json({
    success: true,
    pointsBalance: pointsRow ? pointsRow.points_balance : 0,
    lifetimePoints: pointsRow ? pointsRow.lifetime_points : 0,
    rewards,
    redemptions
  });
}

function redeemReward(req, res) {
  const { rewardId } = req.body;
  const userId = req.user.id;

  try {
    const result = db.transaction(() => {
      const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND is_active = 1').get(rewardId);
      if (!reward) throw new Error('Reward item not found or unavailable.');

      const pointsRow = db.prepare('SELECT * FROM reward_points WHERE student_id = ?').get(userId);
      if (!pointsRow || pointsRow.points_balance < reward.points_required) {
        throw new Error(`Insufficient reward points! Required: ${reward.points_required}, Available: ${pointsRow ? pointsRow.points_balance : 0}`);
      }

      // Deduct points
      db.prepare('UPDATE reward_points SET points_balance = points_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE student_id = ?')
        .run(reward.points_required, userId);

      // Record redemption
      db.prepare(`
        INSERT INTO reward_redemptions (student_id, reward_id, points_spent, status)
        VALUES (?, ?, ?, 'REDEEMED')
      `).run(userId, reward.id, reward.points_required);

      // Notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Reward Redeemed!', ?, 'Reward')
      `).run(userId, `You successfully redeemed "${reward.title}" for ${reward.points_required} points! Coupon code: ${reward.reward_code}`);

      return { rewardTitle: reward.title, code: reward.reward_code, pointsSpent: reward.points_required };
    })();

    return res.json({
      success: true,
      message: 'Reward redeemed successfully!',
      data: result
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// Rule 12: Rule-Based AI Expense Tracker Engine with fallback/ready architecture
function getAIExpenseAnalysis(req, res) {
  const userId = req.user.id;

  const totalSpentRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM payments
    WHERE student_id = ?
  `).get(userId);

  const categoryBreakdown = db.prepare(`
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM payments
    WHERE student_id = ?
    GROUP BY category
    ORDER BY total DESC
  `).all(userId);

  const monthlyCompare = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as total
    FROM payments
    WHERE student_id = ?
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6
  `).all(userId);

  const totalSpent = Number(totalSpentRow.total);
  const totalTxns = Number(totalSpentRow.count);
  const highestCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'N/A';
  const highestCategorySpent = categoryBreakdown.length > 0 ? Number(categoryBreakdown[0].total) : 0;
  const highestCatPercentage = totalSpent > 0 ? Math.round((highestCategorySpent / totalSpent) * 100) : 0;

  const avgDaily = totalSpent > 0 ? Math.round(totalSpent / 30) : 0;

  // Generate realistic AI insights based on spending data
  const insights = [
    `Highest Spending Category: ${highestCategory} (${highestCatPercentage}% of total spending).`,
    `Average Daily Spending: ₹${avgDaily} / day across campus vendors.`,
    `Total Transactions Logged: ${totalTxns} digital payments.`,
    highestCatPercentage > 40
      ? `💡 AI Smart Tip: You spend a significant portion of your budget on ${highestCategory}. Setting a sub-limit could save you up to ₹${Math.round(highestCategorySpent * 0.2)} monthly!`
      : `💡 AI Smart Tip: Your spending across categories is well balanced! Keep tracking daily limits.`
  ];

  return res.json({
    success: true,
    data: {
      totalSpent,
      totalTransactions: totalTxns,
      highestCategory,
      highestCategorySpent,
      highestCatPercentage,
      averageDailySpend: avgDaily,
      categoryBreakdown,
      monthlyCompare,
      insights
    }
  });
}

// Generate Monthly Expense Report
function getMonthlyReport(req, res) {
  const userId = req.user.id;
  const monthStr = req.query.month || new Date().toISOString().substring(0, 7); // e.g. "2026-08"

  const studentUser = db.prepare('SELECT name, email FROM users WHERE id = ?').get(userId);
  const studentProfile = db.prepare('SELECT roll_number, department FROM students WHERE user_id = ?').get(userId);

  const totalSpendRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM payments
    WHERE student_id = ? AND strftime('%Y-%m', created_at) = ?
  `).get(userId, monthStr);

  const totalRechargeRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM wallet_transactions
    WHERE user_id = ? AND type = 'RECHARGE' AND status = 'SUCCESS'
      AND strftime('%Y-%m', created_at) = ?
  `).get(userId, monthStr);

  const categoryBreakdown = db.prepare(`
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM payments
    WHERE student_id = ? AND strftime('%Y-%m', created_at) = ?
    GROUP BY category
    ORDER BY total DESC
  `).all(userId, monthStr);

  const topVendors = db.prepare(`
    SELECT v.business_name, SUM(p.amount) as total, COUNT(*) as count
    FROM payments p
    JOIN vendors v ON p.vendor_id = v.user_id
    WHERE p.student_id = ? AND strftime('%Y-%m', p.created_at) = ?
    GROUP BY v.business_name
    ORDER BY total DESC
    LIMIT 5
  `).all(userId, monthStr);

  const dailyTrend = db.prepare(`
    SELECT DATE(created_at) as date, SUM(amount) as total
    FROM payments
    WHERE student_id = ? AND strftime('%Y-%m', created_at) = ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all(userId, monthStr);

  return res.json({
    success: true,
    report: {
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      rollNumber: studentProfile ? studentProfile.roll_number : 'N/A',
      department: studentProfile ? studentProfile.department : 'N/A',
      month: monthStr,
      totalSpending: Number(totalSpendRow.total),
      totalRecharge: Number(totalRechargeRow.total),
      totalTransactions: Number(totalSpendRow.count),
      highestCategory: categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'N/A',
      avgDailySpend: Math.round(Number(totalSpendRow.total) / 30),
      categoryBreakdown,
      topVendors,
      dailyTrend
    }
  });
}

module.exports = {
  getStudentDashboard,
  rechargeWallet,
  getRewardsCatalog,
  redeemReward,
  getAIExpenseAnalysis,
  getMonthlyReport
};
