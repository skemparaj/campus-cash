const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

function register(req, res) {
  const { email, password, name, role, phone, department, rollNumber } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ success: false, error: 'Email, password, name, and role are required.' });
  }

  const validRoles = ['STUDENT', 'PARENT', 'VENDOR', 'ADMIN'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role specified.' });
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'User with this email already exists.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = db.transaction(() => {
      const userStmt = db.prepare(`
        INSERT INTO users (email, password, name, role, phone, avatar, status)
        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
      `);
      const userResult = userStmt.run(email, hashedPassword, name, role, phone || '', '');
      const userId = userResult.lastInsertRowid;

      // Create wallet with initial virtual demo balance
      const initialBalance = role === 'STUDENT' ? 1000.00 : (role === 'PARENT' ? 10000.00 : 0.00);
      db.prepare('INSERT INTO wallets (user_id, balance, currency) VALUES (?, ?, \'INR\')').run(userId, initialBalance);

      // Create Role Profile
      if (role === 'STUDENT') {
        db.prepare(`
          INSERT INTO students (user_id, roll_number, department, year_of_study)
          VALUES (?, ?, ?, 1)
        `).run(userId, rollNumber || `2026CS${Math.floor(1000 + Math.random() * 9000)}`, department || 'Computer Science');

        db.prepare('INSERT INTO reward_points (student_id, points_balance, lifetime_points) VALUES (?, 100, 100)').run(userId);
      } else if (role === 'PARENT') {
        db.prepare('INSERT INTO parents (user_id, relationship) VALUES (?, \'Parent\')').run(userId);
      } else if (role === 'VENDOR') {
        const qrId = `QR_VENDOR_${userId}`;
        db.prepare(`
          INSERT INTO vendors (user_id, business_name, category, location, qr_code_id)
          VALUES (?, ?, 'General', 'Campus Plaza', ?)
        `).run(userId, name, qrId);

        db.prepare(`
          INSERT INTO qr_codes (qr_id, vendor_id, vendor_name, category, is_active)
          VALUES (?, ?, ?, 'General', 1)
        `).run(qrId, userId, name);
      } else if (role === 'ADMIN') {
        db.prepare('INSERT INTO admins (user_id, department, designation) VALUES (?, \'IT Administration\', \'Administrator\')').run(userId);
      }

      // Log action
      db.prepare(`
        INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
        VALUES (?, ?, ?, 'User Registration', 'AUTH', 'SUCCESS', ?)
      `).run(userId, email, role, `New ${role} registered`);

      return { userId, email, name, role };
    })();

    const token = jwt.sign({ id: result.userId, email: result.email, role: result.role, name: result.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: result.userId, email: result.email, name: result.name, role: result.role }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to complete registration.' });
  }
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  if (user.status === 'DISABLED') {
    return res.status(403).json({ success: false, error: 'Account disabled. Contact campus administrator.' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Log Audit
  db.prepare(`
    INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
    VALUES (?, ?, ?, 'User Login', 'AUTH', 'SUCCESS', ?)
  `).run(user.id, user.email, user.role, `${user.name} logged in`);

  const wallet = db.prepare('SELECT balance FROM wallets WHERE user_id = ?').get(user.id);
  const userBalance = wallet ? Number(wallet.balance) : 0;

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      balance: userBalance
    }
  });
}

function me(req, res) {
  const userId = req.user.id;
  const user = db.prepare('SELECT id, email, name, role, phone, avatar, status, created_at FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  let extraData = {};
  if (user.role === 'STUDENT') {
    extraData.studentProfile = db.prepare('SELECT * FROM students WHERE user_id = ?').get(userId);
    extraData.wallet = db.prepare('SELECT balance, currency FROM wallets WHERE user_id = ?').get(userId);
    extraData.balance = extraData.wallet ? Number(extraData.wallet.balance) : 0;
    extraData.rewardPoints = db.prepare('SELECT points_balance, lifetime_points FROM reward_points WHERE student_id = ?').get(userId);
  } else if (user.role === 'PARENT') {
    extraData.parentProfile = db.prepare('SELECT * FROM parents WHERE user_id = ?').get(userId);
    extraData.wallet = db.prepare('SELECT balance, currency FROM wallets WHERE user_id = ?').get(userId);
    extraData.balance = extraData.wallet ? Number(extraData.wallet.balance) : 0;
    // Find linked students
    extraData.students = db.prepare(`
      SELECT s.*, u.name, u.email, w.balance
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN wallets w ON s.user_id = w.user_id
      WHERE s.parent_id = ?
    `).all(userId);
  } else if (user.role === 'VENDOR') {
    extraData.vendorProfile = db.prepare('SELECT * FROM vendors WHERE user_id = ?').get(userId);
    extraData.wallet = db.prepare('SELECT balance, currency FROM wallets WHERE user_id = ?').get(userId);
    extraData.balance = extraData.wallet ? Number(extraData.wallet.balance) : 0;
  } else if (user.role === 'ADMIN') {
    extraData.adminProfile = db.prepare('SELECT * FROM admins WHERE user_id = ?').get(userId);
    extraData.wallet = db.prepare('SELECT balance, currency FROM wallets WHERE user_id = ?').get(userId);
    extraData.balance = extraData.wallet ? Number(extraData.wallet.balance) : 0;
  }

  return res.json({
    success: true,
    user: { ...user, ...extraData }
  });
}

function forgotPassword(req, res) {
  const { email } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'No account found with this email.' });
  }

  // Simulated OTP/Reset Link for Demo Application
  return res.json({
    success: true,
    message: 'Password reset link sent to registered email (Demo OTP: 123456).'
  });
}

function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, error: 'Email and new password are required.' });
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashedPassword, user.id);

  db.prepare(`
    INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
    VALUES (?, ?, 'USER', 'Password Reset', 'AUTH', 'SUCCESS', 'Password reset successfully')
  `).run(user.id, email);

  return res.json({
    success: true,
    message: 'Password has been updated successfully. Please login with your new password.'
  });
}

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword
};
