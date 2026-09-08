const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedMySQL() {
  console.log('🌱 Seeding MySQL Database (campuscash_db) with demo accounts...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'campuscash_db'
  });

  const passwordHashStudent = bcrypt.hashSync('Student@123', 10);
  const passwordHashParent = bcrypt.hashSync('Parent@123', 10);
  const passwordHashVendor = bcrypt.hashSync('Vendor@123', 10);
  const passwordHashAdmin = bcrypt.hashSync('Admin@123', 10);

  try {
    // Clear existing data in reverse order of foreign key constraints
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE audit_logs');
    await connection.query('TRUNCATE TABLE reward_redemptions');
    await connection.query('TRUNCATE TABLE rewards');
    await connection.query('TRUNCATE TABLE reward_points');
    await connection.query('TRUNCATE TABLE notifications');
    await connection.query('TRUNCATE TABLE qr_codes');
    await connection.query('TRUNCATE TABLE payments');
    await connection.query('TRUNCATE TABLE wallet_transactions');
    await connection.query('TRUNCATE TABLE spending_limits');
    await connection.query('TRUNCATE TABLE wallets');
    await connection.query('TRUNCATE TABLE admins');
    await connection.query('TRUNCATE TABLE vendors');
    await connection.query('TRUNCATE TABLE parents');
    await connection.query('TRUNCATE TABLE students');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Create Demo Users
    const [resStudent] = await connection.query(
      `INSERT INTO users (email, password, name, role, phone, avatar, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      ['student@campuscash.demo', passwordHashStudent, 'Kemparaj', 'STUDENT', '+91 98765 43210', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150']
    );

    const [resParent] = await connection.query(
      `INSERT INTO users (email, password, name, role, phone, avatar, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      ['parent@campuscash.demo', passwordHashParent, 'Dhanusri', 'PARENT', '+91 98765 11111', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150']
    );

    const [resVendorCanteen] = await connection.query(
      `INSERT INTO users (email, password, name, role, phone, avatar, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      ['vendor@campuscash.demo', passwordHashVendor, 'Campus Canteen', 'VENDOR', '+91 98765 22222', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150']
    );

    const [resVendorStationery] = await connection.query(
      `INSERT INTO users (email, password, name, role, phone, avatar, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      ['stationery@campuscash.demo', passwordHashVendor, 'Campus Central Store', 'VENDOR', '+91 98765 33333', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=150']
    );

    const [resAdmin] = await connection.query(
      `INSERT INTO users (email, password, name, role, phone, avatar, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      ['admin@campuscash.demo', passwordHashAdmin, 'Admin Officer', 'ADMIN', '+91 98765 99999', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150']
    );

    const studentId = resStudent.insertId;
    const parentId = resParent.insertId;
    const vendorCanteenId = resVendorCanteen.insertId;
    const vendorStationeryId = resVendorStationery.insertId;
    const adminId = resAdmin.insertId;

    // 2. Create Role Profiles
    await connection.query(
      `INSERT INTO students (user_id, roll_number, department, year_of_study, parent_id) VALUES (?, '2024CS1088', 'Computer Science & Engineering', 3, ?)`,
      [studentId, parentId]
    );

    await connection.query(
      `INSERT INTO parents (user_id, relationship, emergency_contact) VALUES (?, 'Mother', '+91 98765 11111')`,
      [parentId]
    );

    await connection.query(
      `INSERT INTO vendors (user_id, business_name, category, location, qr_code_id) VALUES (?, 'Campus Canteen', 'Food', 'Main Block Ground Floor', 'QR_CANTEEN_01')`,
      [vendorCanteenId]
    );

    await connection.query(
      `INSERT INTO vendors (user_id, business_name, category, location, qr_code_id) VALUES (?, 'Campus Central Store', 'Stationery', 'Library Building Floor 1', 'QR_STATIONERY_02')`,
      [vendorStationeryId]
    );

    await connection.query(
      `INSERT INTO admins (user_id, department, designation) VALUES (?, 'Finance & Campus IT', 'Chief Operations Administrator')`,
      [adminId]
    );

    // 3. Create Demo Wallets
    const insertWalletSql = `INSERT INTO wallets (user_id, balance, currency) VALUES (?, ?, 'INR')`;
    const [wStudent] = await connection.query(insertWalletSql, [studentId, 1850.00]);
    const [wParent] = await connection.query(insertWalletSql, [parentId, 25000.00]);
    const [wVendorCanteen] = await connection.query(insertWalletSql, [vendorCanteenId, 14250.00]);
    const [wVendorStationery] = await connection.query(insertWalletSql, [vendorStationeryId, 8600.00]);
    await connection.query(insertWalletSql, [adminId, 0.00]);

    // 4. Create QR Codes
    const insertQRSql = `INSERT INTO qr_codes (qr_id, vendor_id, vendor_name, category, fixed_amount, is_active) VALUES (?, ?, ?, ?, ?, 1)`;
    await connection.query(insertQRSql, ['QR_CANTEEN_01', vendorCanteenId, 'Campus Canteen', 'Food', null]);
    await connection.query(insertQRSql, ['QR_STATIONERY_02', vendorStationeryId, 'Campus Central Store', 'Stationery', null]);
    await connection.query(insertQRSql, ['QR_PRINTING_03', vendorStationeryId, 'Express Campus Print Hub', 'Printing', 30.00]);

    // 5. Create Spending Limits
    await connection.query(
      `INSERT INTO spending_limits (student_id, parent_id, daily_limit, weekly_limit, monthly_limit, action_on_exceed) VALUES (?, ?, 500.00, 2500.00, 5000.00, 'WARNING')`,
      [studentId, parentId]
    );

    // 6. Reward Points & Rewards
    await connection.query(
      `INSERT INTO reward_points (student_id, points_balance, lifetime_points) VALUES (?, 185, 230)`,
      [studentId]
    );

    const insertRewardSql = `INSERT INTO rewards (title, description, points_required, reward_code, category) VALUES (?, ?, ?, ?, ?)`;
    await connection.query(insertRewardSql, ['Free 15-Page High-Res Printing Pass', 'Redeem for 15 free black & white printed pages at Campus Print Hub.', 50, 'RWD_PRINT_50', 'Printing']);
    await connection.query(insertRewardSql, ['₹50 Canteen Snack Voucher', 'Get ₹50 off on any snack combo at Campus Canteen.', 100, 'RWD_FOOD_100', 'Food']);
    await connection.query(insertRewardSql, ['Official Campus Hoodie 20%', 'Get 20% discount on official campus merchandise.', 250, 'RWD_MERCH_250', 'Merchandise']);
    await connection.query(insertRewardSql, ['Library Overdue Fine Waiver', 'Waive up to ₹100 library overdue fines.', 150, 'RWD_LIB_150', 'Education']);

    // 7. Initial Ledger Entries
    const insertTxSql = `
      INSERT INTO wallet_transactions (transaction_id, wallet_id, user_id, type, amount, previous_balance, new_balance, reference_id, status, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?)
    `;
    const insertPaymentSql = `
      INSERT INTO payments (payment_id, transaction_id, student_id, vendor_id, amount, category, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'SUCCESS', ?)
    `;

    await connection.query(insertTxSql, ['TXN_10001', wStudent.insertId, studentId, 'RECHARGE', 2000.00, 80.00, 2080.00, 'REF_RECHARGE_PARENT', 'Wallet Top-Up by Parent Dhanusri', '2026-08-12 09:00:00']);
    await connection.query(insertTxSql, ['TXN_10002', wStudent.insertId, studentId, 'PAYMENT', 80.00, 2080.00, 2000.00, 'QR_CANTEEN_01', 'Payment at Campus Canteen', '2026-08-13 13:15:00']);
    await connection.query(insertPaymentSql, ['PAY_8001', 'TXN_10002', studentId, vendorCanteenId, 80.00, 'Food', '2026-08-13 13:15:00']);

    await connection.query(insertTxSql, ['TXN_10003', wStudent.insertId, studentId, 'PAYMENT', 120.00, 2000.00, 1880.00, 'QR_STATIONERY_02', 'Payment for Exam Notebooks', '2026-08-13 10:30:00']);
    await connection.query(insertPaymentSql, ['PAY_8002', 'TXN_10003', studentId, vendorStationeryId, 120.00, 'Stationery', '2026-08-13 10:30:00']);

    await connection.query(insertTxSql, ['TXN_10004', wStudent.insertId, studentId, 'PAYMENT', 30.00, 1880.00, 1850.00, 'QR_PRINTING_03', 'Payment for Lab Manual Printing', '2026-08-12 16:45:00']);
    await connection.query(insertPaymentSql, ['PAY_8003', 'TXN_10004', studentId, vendorStationeryId, 30.00, 'Printing', '2026-08-12 16:45:00']);

    // 8. Demo Notifications
    const insertNotifSql = `INSERT INTO notifications (user_id, title, message, category, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
    await connection.query(insertNotifSql, [parentId, 'Payment Alert', '₹80 spent at Campus Canteen by Kemparaj.', 'Payment', 0, '2026-08-13 13:15:00']);
    await connection.query(insertNotifSql, [parentId, 'Recharge Successful', 'Wallet recharge of ₹2,000 to Kemparaj was successful.', 'Recharge', 1, '2026-08-12 09:00:00']);
    await connection.query(insertNotifSql, [studentId, 'Reward Earned!', 'You earned 12 reward points for your purchase at Campus Store!', 'Reward', 0, '2026-08-13 10:30:00']);

    // 9. Initial Audit Logs
    const insertAuditSql = `INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details) VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?)`;
    await connection.query(insertAuditSql, [adminId, 'admin@campuscash.demo', 'ADMIN', 'System Initialized', 'SYSTEM', 'Campus Cash seeded in MySQL']);

    console.log('✅ MySQL Database (campuscash_db) successfully seeded with demo accounts!');
  } catch (err) {
    console.error('❌ MySQL Seed Error:', err.message);
  } finally {
    await connection.end();
  }
}

seedMySQL();
