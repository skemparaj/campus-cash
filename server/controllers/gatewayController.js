const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../config/database');

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_campus_cash_demo';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'campus_cash_razorpay_secret';

let razorpayInstance = null;
try {
  if (KEY_ID && KEY_SECRET && !KEY_ID.includes('demo')) {
    razorpayInstance = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET
    });
  }
} catch (err) {
  console.warn('Razorpay SDK init warning (falling back to interactive sandbox):', err.message);
}

// 1. Create Razorpay Payment Gateway Order
async function createOrder(req, res) {
  try {
    const { amount, targetStudentUserId } = req.body;
    const userId = targetStudentUserId || req.user.id;
    const numAmount = Number(amount);

    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid amount greater than zero.' });
    }

    if (numAmount > 100000) {
      return res.status(400).json({ success: false, error: 'Maximum single transaction limit is ₹1,00,000.' });
    }

    const amountPaise = Math.round(numAmount * 100);
    const receiptId = `rcpt_${Date.now()}_${userId}`;

    let orderData = null;

    if (razorpayInstance) {
      try {
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: amountPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            userId: userId.toString(),
            payerId: req.user.id.toString(),
            payerRole: req.user.role,
            platform: 'Campus Cash Digital Wallet'
          }
        });
        orderData = razorpayOrder;
      } catch (err) {
        console.warn('Razorpay Order creation fallback to sandbox:', err.message);
      }
    }

    // Fallback or Sandbox Order structure
    if (!orderData) {
      orderData = {
        id: `order_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        entity: 'order',
        amount: amountPaise,
        amount_paid: 0,
        amount_due: amountPaise,
        currency: 'INR',
        receipt: receiptId,
        status: 'created',
        attempts: 0,
        notes: {
          userId: userId.toString(),
          payerId: req.user.id.toString(),
          mode: 'SANDBOX'
        },
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    return res.json({
      success: true,
      keyId: KEY_ID,
      order: orderData,
      user: {
        name: req.user.name,
        email: req.user.email
      }
    });

  } catch (err) {
    console.error('Razorpay Create Order Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to initialize payment gateway order.'
    });
  }
}

// 2. Verify Razorpay Payment Signature & Credit Wallet
function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      targetStudentUserId,
      paymentMethod
    } = req.body;

    const numAmount = Number(amount);
    const studentUserId = targetStudentUserId || req.user.id;

    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid payment amount.' });
    }

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'Missing Razorpay order/payment identifiers.' });
    }

    // Validate Signature
    let isSignatureValid = false;

    if (KEY_SECRET && razorpay_signature && !KEY_SECRET.includes('demo')) {
      const generatedSignature = crypto
        .createHmac('sha256', KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = (generatedSignature === razorpay_signature);
    } else {
      // Interactive Sandbox mode verification
      isSignatureValid = Boolean(razorpay_payment_id && razorpay_order_id);
    }

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed. Invalid digital signature.'
      });
    }

    // Check duplicate payment ID
    const existingTx = db.prepare(`
      SELECT * FROM wallet_transactions WHERE reference_id = ? AND status = 'SUCCESS'
    `).get(razorpay_payment_id);

    if (existingTx) {
      return res.json({
        success: true,
        message: 'Payment already processed and verified.',
        data: {
          transactionId: existingTx.transaction_id,
          paymentId: razorpay_payment_id,
          amount: Number(existingTx.amount),
          newBalance: Number(existingTx.new_balance)
        }
      });
    }

    // Atomic Database Credit
    const result = db.transaction(() => {
      const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(studentUserId);
      if (!wallet) throw new Error('Student wallet not found for settlement.');

      const studentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(studentUserId);
      if (!studentUser) throw new Error('Target user account not found.');

      const currentBalPaise = Math.round(Number(wallet.balance) * 100);
      const numAmountPaise = Math.round(numAmount * 100);
      const newBalPaise = currentBalPaise + numAmountPaise;

      const currentBalRupees = currentBalPaise / 100;
      const newBalRupees = newBalPaise / 100;
      const txId = `TXN_RZP_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

      // 1. Update wallet balance
      db.prepare('UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newBalRupees, wallet.id);

      // 2. Insert ledger transaction
      const payDesc = paymentMethod
        ? `Razorpay Top-Up via ${paymentMethod} (Ref: ${razorpay_payment_id})`
        : `Razorpay Online Gateway Top-Up (Ref: ${razorpay_payment_id})`;

      db.prepare(`
        INSERT INTO wallet_transactions
        (transaction_id, wallet_id, user_id, type, amount, previous_balance, new_balance, reference_id, status, description)
        VALUES (?, ?, ?, 'RECHARGE', ?, ?, ?, ?, 'SUCCESS', ?)
      `).run(
        txId,
        wallet.id,
        studentUserId,
        numAmount,
        currentBalRupees,
        newBalRupees,
        razorpay_payment_id,
        payDesc
      );

      // 3. Insert notification
      const notifMsg = req.user.id !== studentUserId
        ? `Parent (${req.user.name}) added ₹${numAmount.toFixed(2)} to your wallet via Razorpay.`
        : `Wallet successfully recharged with ₹${numAmount.toFixed(2)} via Razorpay Payment Gateway.`;

      db.prepare(`
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Razorpay Payment Success', ?, 'Recharge')
      `).run(studentUserId, notifMsg);

      // 4. Audit Log
      db.prepare(`
        INSERT INTO audit_logs (user_id, user_email, role, action, module, status, details)
        VALUES (?, ?, ?, 'Razorpay Payment Verified', 'PAYMENT', 'SUCCESS', ?)
      `).run(
        req.user.id,
        req.user.email,
        req.user.role,
        `Recharged ₹${numAmount} for student user #${studentUserId} (Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id})`
      );

      return {
        transactionId: txId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: numAmount,
        previousBalance: currentBalRupees,
        newBalance: newBalRupees,
        studentName: studentUser.name,
        timestamp: new Date().toISOString()
      };
    })();

    return res.json({
      success: true,
      message: 'Razorpay Payment Verified & Wallet Credited Successfully!',
      data: result
    });

  } catch (err) {
    console.error('Razorpay Verification Error:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Payment verification failed.'
    });
  }
}

// 3. Webhook listener for Razorpay Payment Gateway
function handleWebhook(req, res) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (signature && webhookSecret && !webhookSecret.includes('demo')) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      if (paymentEntity) {
        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;
        const amount = paymentEntity.amount / 100;
        const userId = paymentEntity.notes?.userId;

        if (userId && paymentId) {
          // Idempotent auto-settlement
          const existing = db.prepare('SELECT * FROM wallet_transactions WHERE reference_id = ?').get(paymentId);
          if (!existing) {
            const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
            if (wallet) {
              const currentBal = Number(wallet.balance);
              const newBal = currentBal + amount;
              db.prepare('UPDATE wallets SET balance = ? WHERE id = ?').run(newBal, wallet.id);
              db.prepare(`
                INSERT INTO wallet_transactions
                (transaction_id, wallet_id, user_id, type, amount, previous_balance, new_balance, reference_id, status, description)
                VALUES (?, ?, ?, 'RECHARGE', ?, ?, ?, ?, 'SUCCESS', 'Razorpay Webhook Auto-Settlement')
              `).run(`TXN_HOOK_${Date.now()}`, wallet.id, userId, amount, currentBal, newBal, paymentId);
            }
          }
        }
      }
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook
};
