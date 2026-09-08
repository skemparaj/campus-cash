import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

import QRPaymentModal from './components/QRPaymentModal';
import ReceiptModal from './components/ReceiptModal';
import QuickRechargeModal from './components/QuickRechargeModal';
import LogoutModal from './components/LogoutModal';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentWallet from './pages/StudentWallet';
import ParentDashboard from './pages/ParentDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AIExpenseTracker from './pages/AIExpenseTracker';
import RewardsPage from './pages/RewardsPage';
import MonthlyReportPage from './pages/MonthlyReportPage';

import Canvas3DBackground from './components/Canvas3DBackground';
import MobileBottomNav from './components/MobileBottomNav';

function AppContent() {
  const { user, showToast, refreshUser } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  // Modal States
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Requirement 14: Browser Back/Forward navigation listener
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    // Role-based route authorization guards
    if (user) {
      const role = user.role;
      if (path.startsWith('/admin') && role !== 'ADMIN') {
        showToast(`Unauthorized. Role '${role}' cannot access /admin dashboard.`, 'error');
        return;
      }
      if (path.startsWith('/parent') && role !== 'PARENT') {
        showToast(`Unauthorized. Role '${role}' cannot access /parent dashboard.`, 'error');
        return;
      }
      if (path.startsWith('/vendor') && role !== 'VENDOR') {
        showToast(`Unauthorized. Role '${role}' cannot access /vendor dashboard.`, 'error');
        return;
      }
      if (path.startsWith('/student') && role !== 'STUDENT') {
        showToast(`Unauthorized. Role '${role}' cannot access /student dashboard.`, 'error');
        return;
      }
    } else if (path !== '/' && path !== '/login') {
      path = '/login';
    }

    setCurrentPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const openReceipt = (tx) => {
    setSelectedReceipt(tx);
    setIsReceiptModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    refreshUser();
  };

  // Render main page body based on currentPath & logged-in role
  const renderPage = () => {
    if (!user) {
      if (currentPath === '/login') return <LoginPage onNavigate={navigateTo} />;
      return <LandingPage onNavigate={navigateTo} />;
    }

    // Authenticated views
    switch (currentPath) {
      // Student Routes
      case '/student':
      case '/student/dashboard':
        return (
          <StudentDashboard
            onNavigate={navigateTo}
            openQRModal={() => setIsQRModalOpen(true)}
            openRechargeModal={() => setIsRechargeModalOpen(true)}
            openReceiptModal={openReceipt}
          />
        );
      case '/student/wallet':
        return (
          <StudentWallet
            onNavigate={navigateTo}
            openRechargeModal={() => setIsRechargeModalOpen(true)}
            openQRModal={() => setIsQRModalOpen(true)}
            openReceiptModal={openReceipt}
          />
        );
      case '/student/ai-expense':
        return <AIExpenseTracker onNavigate={navigateTo} />;
      case '/student/rewards':
        return <RewardsPage onNavigate={navigateTo} />;
      case '/student/monthly-report':
        return <MonthlyReportPage onNavigate={navigateTo} />;

      // Parent Routes
      case '/parent':
      case '/parent/limits':
      case '/parent/transactions':
        return <ParentDashboard onNavigate={navigateTo} openRechargeModal={() => setIsRechargeModalOpen(true)} />;

      // Vendor Routes
      case '/vendor':
      case '/vendor/qr-gen':
      case '/vendor/sales':
        return <VendorDashboard onNavigate={navigateTo} />;

      // Admin Routes
      case '/admin':
      case '/admin/users':
      case '/admin/audit':
        return <AdminDashboard onNavigate={navigateTo} />;

      default:
        if (user.role === 'STUDENT') return <StudentDashboard onNavigate={navigateTo} openQRModal={() => setIsQRModalOpen(true)} openRechargeModal={() => setIsRechargeModalOpen(true)} openReceiptModal={openReceipt} />;
        if (user.role === 'PARENT') return <ParentDashboard onNavigate={navigateTo} openRechargeModal={() => setIsRechargeModalOpen(true)} />;
        if (user.role === 'VENDOR') return <VendorDashboard onNavigate={navigateTo} />;
        if (user.role === 'ADMIN') return <AdminDashboard onNavigate={navigateTo} />;
        return <LandingPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', position: 'relative' }}>
      {/* Smart Campus Network Background System */}
      <Canvas3DBackground />

      <Navbar onNavigate={navigateTo} openLogoutModal={() => setIsLogoutModalOpen(true)} />

      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 1 }}>
        {user && currentPath !== '/' && currentPath !== '/login' && (
          <Sidebar currentPath={currentPath} onNavigate={navigateTo} openLogoutModal={() => setIsLogoutModalOpen(true)} />
        )}
        <main style={{ flex: 1, minWidth: 0 }}>
          {renderPage()}
        </main>
      </div>

      {/* Mobile Bottom Navbar */}
      <MobileBottomNav
        currentPath={currentPath}
        onNavigate={navigateTo}
        openQRModal={() => setIsQRModalOpen(true)}
        openLogoutModal={() => setIsLogoutModalOpen(true)}
      />

      {/* Global Modals & Toast */}
      <QRPaymentModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
      <QuickRechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        onSuccess={() => refreshUser()}
      />
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => navigateTo('/login')}
      />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
