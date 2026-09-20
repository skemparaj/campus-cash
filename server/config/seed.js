const bcrypt = require('bcryptjs');
const db = require('./database');

async function seedDatabase() {
  await db.ready;
  console.log('🌱 Seeding Campus Cash Database with demo accounts and data...');

  const passwordHashStudent = bcrypt.hashSync('Student@123', 10);
  const passwordHashParent = bcrypt.hashSync('Parent@123', 10);
  const passwordHashVendor = bcrypt.hashSync('Vendor@123', 10);
  const passwordHashAdmin = bcrypt.hashSync('Admin@123', 10);

  db.transaction(() => {
    // Clear existing data safely
    db.prepare('DELETE FROM audit_logs').run();
    db.prepare('DELETE FROM reward_redemptions').run();
    db.prepare('DELETE FROM rewards').run();
    db.prepare('DELETE FROM reward_points').run();
    db.prepare('DELETE FROM notifications').run();
    db.prepare('DELETE FROM qr_codes').run();
    db.prepare('DELETE FROM payments').run();
    db.prepare('DELETE FROM wallet_transactions').run();
    db.prepare('DELETE FROM spending_limits').run();
    db.prepare('DELETE FROM wallets').run();
    db.prepare('DELETE FROM admins').run();
    db.prepare('DELETE FROM vendors').run();
    db.prepare('DELETE FROM parents').run();
    db.prepare('DELETE FROM students').run();
    db.prepare('DELETE FROM users').run();

    // 1. Create Demo Users
    const insertUser = db.prepare(`
      INSERT INTO users (email, password, name, role, phone, avatar, status)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
    `);

    const studentUser = insertUser.run(
      'student@campuscash.demo',
      passwordHashStudent,
      'Kemparaj',
      'STUDENT',
      '+91 98765 43210',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    );

    const parentUser = insertUser.run(
      'parent@campuscash.demo',
      passwordHashParent,
      'Dhanusri',
      'PARENT',
      '+91 98765 11111',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    );

    const vendorCanteenUser = insertUser.run(
      'vendor@campuscash.demo',
      passwordHashVendor,
      'Campus Canteen',
      'VENDOR',
      '+91 98765 22222',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150'
    );

    const vendorStationeryUser = insertUser.run(
      'stationery@campuscash.demo',
      passwordHashVendor,
      'Campus Central Store',
      'VENDOR',
      '+91 98765 33333',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=150'
    );

    const adminUser = insertUser.run(
      'admin@campuscash.demo',
      passwordHashAdmin,
      'Admin Officer',
      'ADMIN',
      '+91 98765 99999',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    );

    const studentId = studentUser.lastInsertRowid;
    const parentId = parentUser.lastInsertRowid;
    const vendorCanteenId = vendorCanteenUser.lastInsertRowid;
    const vendorStationeryId = vendorStationeryUser.lastInsertRowid;
    const adminId = adminUser.lastInsertRowid;

    // 2. Create Role Profiles
    db.prepare(`
      INSERT INTO students (user_id, roll_number, department, year_of_study, parent_id)
      VALUES (?, '2024CS1088', 'Computer Science & Engineering', 3, ?)
    `).run(studentId, parentId);

    db.prepare(`
      INSERT INTO parents (user_id, relationship, emergency_contact)
      VALUES (?, 'Mother', '+91 98765 11111')
    `).run(parentId);

    db.prepare(`
      INSERT INTO vendors (user_id, business_name, category, location, qr_code_id)
      VALUES (?, 'Campus Canteen', 'Food', 'Main Block Ground Floor', 'QR_CANTEEN_01')
    `).run(vendorCanteenId);

    db.prepare(`
      INSERT INTO vendors (user_id, business_name, category, location, qr_code_id)
      VALUES (?, 'Campus Central Store', 'Stationery', 'Library Building Floor 1', 'QR_STATIONERY_02')
    `).run(vendorStationeryId);

    db.prepare(`
      INSERT INTO admins (user_id, department, designation)
      VALUES (?, 'Finance & Campus IT', 'Chief Operations Administrator')
    `).run(adminId);

    // 3. Create Demo Wallets
    const insertWallet = db.prepare(`
      INSERT INTO wallets (user_id, balance, currency) VALUES (?, ?, 'INR')
    `);

    const studentWallet = insertWallet.run(studentId, 1850.00);
    const parentWallet = insertWallet.run(parentId, 25000.00);
    const vendorCanteenWallet = insertWallet.run(vendorCanteenId, 14250.00);
    const vendorStationeryWallet = insertWallet.run(vendorStationeryId, 8600.00);
    const adminWallet = insertWallet.run(adminId, 0.00);

    // 4. Create QR Codes
    const insertQR = db.prepare(`
      INSERT INTO qr_codes (qr_id, vendor_id, vendor_name, category, fixed_amount, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    insertQR.run('QR_CANTEEN_01', vendorCanteenId, 'Campus Canteen', 'Food', null);
    insertQR.run('QR_STATIONERY_02', vendorStationeryId, 'Campus Central Store', 'Stationery', null);
    insertQR.run('QR_PRINTING_03', vendorStationeryId, 'Express Campus Print Hub', 'Printing', 30.00);

    // 5. Create Spending Limits for Student
    db.prepare(`
      INSERT INTO spending_limits (student_id, parent_id, daily_limit, weekly_limit, monthly_limit, action_on_exceed)
      VALUES (?, ?, 500.00, 2500.00, 5000.00, 'WARNING')
    `).run(studentId, parentId);

    // 6. Create Reward Points and Catalog
    db.prepare(`
      INSERT INTO reward_points (student_id, points_balance, lifetime_points)
      VALUES (?, 185, 230)
    `).run(studentId);

    const insertReward = db.prepare(`
      INSERT INTO rewards (title, description, points_required, reward_code, category)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertReward.run('Free 15-Page High-Res Printing Pass', 'Redeem for 15 free black & white printed pages at Campus Print Hub.', 50, 'RWD_PRINT_50', 'Printing');
    insertReward.run('₹50 Canteen Snack Voucher', 'Get ₹50 off on any snack combo at Campus Canteen.', 100, 'RWD_FOOD_100', 'Food');
    insertReward.run('Official Campus Hoodie 20%', 'Get 20% discount on official campus merchandise.', 250, 'RWD_MERCH_250', 'Merchandise');
    insertReward.run('Library Overdue Fine Waiver', 'Waive up to ₹100 library overdue fines.', 150, 'RWD_LIB_150', 'Education');

    // 7. Create Historical Transactions & Ledger Entries
    const insertTx = db.prepare(`
      INSERT INTO wallet_transactions (transaction_id, wallet_id, user_id, type, amount, previous_balance, new_balance, reference_id, status, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?)
    `);

    const insertPayment = db.prepare(`
      INSERT INTO payments (payment_id, transaction_id, student_id, vendor_id, amount, category, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'SUCCESS', ?)
    `);

    // Tx 1: Parent Recharge
    insertTx.run(
      'TXN_10001',
      studentWallet.lastInsertRowid,
      studentId,
      'RECHARGE',
      2000.00,
      80.00,
      2080.00,
      'REF_RECHARGE_PARENT',
      'Wallet Top-Up by Parent Dhanusri (Virtual Balance)',
      '2026-08-12 09:00:00'
    );

    // Tx 2: Canteen Payment ₹80
    insertTx.run(
      'TXN_10002',
      studentWallet.lastInsertRowid,
      studentId,
      'PAYMENT',
      80.00,
      2080.00,
      2000.00,
      'QR_CANTEEN_01',
      'Payment at Campus Canteen',
      '2026-08-13 13:15:00'
    );
    insertPayment.run('PAY_8001', 'TXN_10002', studentId, vendorCanteenId, 80.00, 'Food', '2026-08-13 13:15:00');

    // Tx 3: Stationery Payment ₹120
    insertTx.run(
      'TXN_10003',
      studentWallet.lastInsertRowid,
      studentId,
      'PAYMENT',
      120.00,
      2000.00,
      1880.00,
      'QR_STATIONERY_02',
      'Payment for Exam Notebooks at Campus Store',
      '2026-08-13 10:30:00'
    );
    insertPayment.run('PAY_8002', 'TXN_10003', studentId, vendorStationeryId, 120.00, 'Stationery', '2026-08-13 10:30:00');

    // Tx 4: Printing Payment ₹30
    insertTx.run(
      'TXN_10004',
      studentWallet.lastInsertRowid,
      studentId,
      'PAYMENT',
      30.00,
      1880.00,
      1850.00,
      'QR_PRINTING_03',
      'Payment for Lab Manual Printing',
      '2026-08-12 16:45:00'
    );
    insertPayment.run('PAY_8003', 'TXN_10004', studentId, vendorStationeryId, 30.00, 'Printing', '2026-08-12 16:45:00');

    // 8. Create Demo Notifications
    const insertNotif = db.prepare(`
      INSERT INTO notifications (user_id, title, message, category, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertNotif.run(parentId, 'Payment Alert', '₹80 spent at Campus Canteen by Kemparaj.', 'Payment', 0, '2026-08-13 13:15:00');
    insertNotif.run(parentId, 'Payment Alert', '₹120 spent at Campus Central Store by Kemparaj.', 'Payment', 1, '2026-08-13 10:30:00');
    insertNotif.run(parentId, 'Recharge Successful', 'Wallet recharge of ₹2,000 to Kemparaj was successful.', 'Recharge', 1, '2026-08-12 09:00:00');
    insertNotif.run(parentId, 'Spending Summary', 'Monthly spending reached ₹230 (4.6% of limit).', 'Warning', 0, '2026-08-13 14:00:00');

    insertNotif.run(studentId, 'Reward Earned!', 'You earned 12 reward points for your purchase at Campus Central Store!', 'Reward', 0, '2026-08-13 10:30:00');
    insertNotif.run(studentId, 'Welcome to Campus Cash', 'Your digital campus wallet is active. Demo balance loaded.', 'System', 1, '2026-08-12 08:00:00');

    // 9. Initial Audit Logs
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
      VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?)
    `);

    insertAudit.run(adminId, 'admin@campuscash.demo', 'ADMIN', 'System Initialized & Seeded', 'SYSTEM', 'Campus Cash database seeded with demo data');
    insertAudit.run(studentId, 'student@campuscash.demo', 'STUDENT', 'User Login', 'AUTH', 'Kemparaj logged into Student Dashboard');
    insertAudit.run(parentId, 'parent@campuscash.demo', 'PARENT', 'Wallet Recharge', 'WALLET', 'Dhanusri recharged student wallet by ₹2,000');

  })();

  console.log('✅ Campus Cash Database seeding complete!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
