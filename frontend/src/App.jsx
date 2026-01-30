import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Renewal from './pages/Renewal';
import Questionnaire from './pages/Questionnaire';
import PlanInProgress from './pages/PlanInProgress';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import TrainerActivation from './pages/TrainerActivation';
import ClientPayment from './pages/ClientPayment';
import useAuthStore from './store/authStore';

const SecurityLayer = ({ children }) => {
    const { user } = useAuthStore();

    useEffect(() => {
        // Skip security checks in development mode
        if (import.meta.env.MODE === 'development') return;

        // Disable Right Click
        const handleContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', handleContextMenu);

        // Disable Common DevTools Shortcuts
        const handleKeyDown = (e) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="select-none relative font-sans min-h-screen bg-black text-white selection:bg-red-500/30">
            {/* Cinematic Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-900/20 rounded-full blur-[140px] animate-pulse-glow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-600/10 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
                <div className="absolute top-[20%] left-[40%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px] animate-float-gentle"></div>

                {/* Dynamic Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-150"></div>
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
            </div>

            {/* Premium Watermark */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rotate-12 text-[10vw] font-black tracking-tighter uppercase whitespace-nowrap select-none">
                        {Array(10).fill("FIT WITH DURGESH ").map((t, i) => (
                            <span key={i} className="block leading-none italic">{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

const DashboardHandler = () => {
    const { user, logout } = useAuthStore();

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <nav className="bg-black/60 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
                <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3 group cursor-default">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center text-white font-black shadow-xl shadow-red-900/40 group-hover:scale-110 transition-transform duration-500">
                                FD
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-tighter uppercase group-hover:tracking-normal transition-all duration-500">
                                    FIT WITH <span className="text-red-600">DY</span>
                                </h1>
                                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Evolution Performance</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-black text-white uppercase tracking-tight">{user.name}</span>
                                <span className="text-[10px] text-red-500 font-black uppercase tracking-widest px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">{user.role}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="group relative px-6 py-2.5 bg-white/5 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border border-white/10 hover:border-red-500 overflow-hidden"
                            >
                                <span className="relative z-10 group-hover:scale-110 block">Logout</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 animate-reveal-up">
                {user.role === 'ADMIN' && <AdminDashboard />}
                {user.role === 'TRAINER' && <TrainerDashboard />}
                {user.role === 'CLIENT' && <ClientDashboard />}
            </main>
        </div>
    );
}

/**
 * Protected Route with Payment-Gated Access Control
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user, token } = useAuthStore();

    // Gate 1: Must be authenticated
    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Gate 2: Admin bypass (always has full access)
    if (user?.role === 'ADMIN') {
        return children;
    }

    // Gate 3: Trainer status check
    if (user?.role === 'TRAINER') {
        const accountStatus = user.accountStatus;

        // PENDING or PAYMENT_SUBMITTED trainers → Activation page
        if (accountStatus === 'PENDING' || accountStatus === 'PAYMENT_SUBMITTED') {
            return <Navigate to="/trainer-activation" replace />;
        }

        // REJECTED trainers → Login with message
        if (accountStatus === 'REJECTED') {
            return <Navigate to="/login" replace />;
        }

        // Check subscription expiry for ACTIVE trainers
        if (accountStatus === 'ACTIVE') {
            const isExpired = user.subscriptionExpiresAt &&
                new Date(user.subscriptionExpiresAt) < new Date();
            if (isExpired) {
                return <Navigate to="/renew" replace />;
            }
        }

        return children;
    }

    // Gate 4: Client status check
    if (user?.role === 'CLIENT') {
        const activationStatus = user.profile?.activationStatus || 'REGISTERED';
        const hasTrainer = !!user.profile?.trainerId;

        // UNASSIGNED or PENDING_PAYMENT clients with trainer → Payment page
        if (hasTrainer && (activationStatus === 'UNASSIGNED' || activationStatus === 'PENDING_PAYMENT')) {
            return <Navigate to="/client-payment" replace />;
        }

        // REGISTERED clients (no trainer) → Limited dashboard is OK

        // ACTIVE clients → Check questionnaire
        if (activationStatus === 'ACTIVE') {
            // Check subscription expiry
            const isExpired = !user.isActive ||
                (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date());

            if (isExpired) {
                return <Navigate to="/renew" replace />;
            }

            // Check questionnaire
            if (!user.profile?.isQuestionnaireFilled) {
                if (window.location.pathname !== '/questionnaire') {
                    return <Navigate to="/questionnaire" replace />;
                }
            }
        }

        return children;
    }

    // Unknown role - deny access
    return <Navigate to="/login" replace />;
};

/**
 * Trainer Activation Route - Only for pending trainers
 */
const TrainerActivationRoute = ({ children }) => {
    const { isAuthenticated, user, token } = useAuthStore();

    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'TRAINER') {
        return <Navigate to="/dashboard" replace />;
    }

    // If trainer is already active, go to dashboard
    if (user.accountStatus === 'ACTIVE') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

/**
 * Client Payment Route - Only for clients with assigned trainer awaiting payment
 */
const ClientPaymentRoute = ({ children }) => {
    const { isAuthenticated, user, token } = useAuthStore();

    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'CLIENT') {
        return <Navigate to="/dashboard" replace />;
    }

    // If client is already active, go to dashboard
    if (user.profile?.activationStatus === 'ACTIVE') {
        return <Navigate to="/dashboard" replace />;
    }

    // If client has no trainer, go to dashboard (limited)
    if (!user.profile?.trainerId) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    const { isAuthenticated, isCheckingAuth, checkAuth, logout } = useAuthStore();

    useEffect(() => {
        checkAuth();

        const handleOffline = () => {
            logout();
            window.location.href = '/login';
        };

        window.addEventListener('offline', handleOffline);
        return () => window.removeEventListener('offline', handleOffline);
    }, []);

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <Router>
            <SecurityLayer>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
                    <Route path="/login" element={<Login />} />

                    {/* Activation/Payment Routes */}
                    <Route path="/trainer-activation" element={
                        <TrainerActivationRoute>
                            <TrainerActivation />
                        </TrainerActivationRoute>
                    } />
                    <Route path="/client-payment" element={
                        <ClientPaymentRoute>
                            <ClientPayment />
                        </ClientPaymentRoute>
                    } />
                    <Route path="/renew" element={
                        isAuthenticated ? <Renewal /> : <Navigate to="/login" replace />
                    } />

                    {/* Protected Routes */}
                    <Route path="/questionnaire" element={
                        <ProtectedRoute>
                            <Questionnaire />
                        </ProtectedRoute>
                    } />
                    <Route path="/plan-in-progress" element={
                        <ProtectedRoute>
                            <PlanInProgress />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardHandler />
                        </ProtectedRoute>
                    } />
                </Routes>
            </SecurityLayer>
        </Router>
    );
}

export default App;
