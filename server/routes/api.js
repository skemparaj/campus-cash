const express = require('express');
const router = express.Router();

const { verifyToken, requireRole } = require('../middleware/auth');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');
const studentController = require('../controllers/studentController');
const parentController = require('../controllers/parentController');
const vendorController = require('../controllers/vendorController');
const adminController = require('../controllers/adminController');
const notificationController = require('../controllers/notificationController');
const gatewayController = require('../controllers/gatewayController');

// 1. AUTHENTICATION ROUTES
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', verifyToken, authController.me);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// 2. PAYMENT ROUTES
router.post('/payments/initiate', verifyToken, paymentController.initiatePayment);
router.post('/payments/confirm', verifyToken, paymentController.confirmPayment);
router.post('/payments/refund', verifyToken, paymentController.processRefund);
router.get('/payments/history', verifyToken, paymentController.getPaymentHistory);
router.get('/payments/:id', verifyToken, paymentController.getPaymentReceipt);


// 3. STUDENT ROUTES
router.get('/student/dashboard', verifyToken, requireRole('STUDENT'), studentController.getStudentDashboard);
router.post('/student/recharge', verifyToken, requireRole('STUDENT'), studentController.rechargeWallet);
router.get('/student/rewards', verifyToken, requireRole('STUDENT'), studentController.getRewardsCatalog);
router.post('/student/rewards/redeem', verifyToken, requireRole('STUDENT'), studentController.redeemReward);
router.get('/student/ai-expense', verifyToken, requireRole('STUDENT'), studentController.getAIExpenseAnalysis);
router.get('/student/monthly-report', verifyToken, requireRole('STUDENT'), studentController.getMonthlyReport);

// 4. PARENT ROUTES
router.get('/parent/dashboard', verifyToken, requireRole('PARENT'), parentController.getParentDashboard);
router.post('/parent/recharge', verifyToken, requireRole('PARENT'), parentController.rechargeStudentWallet);
router.post('/parent/spending-limit', verifyToken, requireRole('PARENT'), parentController.updateSpendingLimit);

// 5. VENDOR ROUTES
router.get('/vendor/dashboard', verifyToken, requireRole('VENDOR'), vendorController.getVendorDashboard);
router.post('/vendor/qr', verifyToken, requireRole('VENDOR'), vendorController.generateQRCode);

// 6. ADMIN ROUTES
router.get('/admin/dashboard', verifyToken, requireRole('ADMIN'), adminController.getAdminDashboard);
router.get('/admin/users', verifyToken, requireRole('ADMIN'), adminController.getUsers);
router.put('/admin/users/status', verifyToken, requireRole('ADMIN'), adminController.updateUserStatus);
router.get('/admin/audit-logs', verifyToken, requireRole('ADMIN'), adminController.getAuditLogs);

// 7. NOTIFICATION ROUTES
router.get('/notifications', verifyToken, notificationController.getNotifications);
router.put('/notifications/:id/read', verifyToken, notificationController.markAsRead);
router.delete('/notifications/:id', verifyToken, notificationController.deleteNotification);

// 8. RAZORPAY PAYMENT GATEWAY ROUTES
router.post('/payment-gateway/create-order', verifyToken, gatewayController.createOrder);
router.post('/payment-gateway/verify-payment', verifyToken, gatewayController.verifyPayment);
router.post('/payment-gateway/webhook', gatewayController.handleWebhook);

module.exports = router;

