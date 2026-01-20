import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import useAuthStore from './store/authStore';

const SecurityLayer = ({ children }) => {
    const { user } = useAuthStore();

    useEffect(() => {
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
        <div className="select-none relative font-sans">
            {/* Ambient Background - Global */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Watermark */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] z-10">
                    <div className="rotate-45 text-5xl font-black text-white whitespace-nowrap">
                        {Array(20).fill("FIT WITH DURGESH ").map((t, i) => (
                            <span key={i} className="block">{t}</span>
                        ))}
                    </div>
                </div>

                {/* Animated Floating Icons */}
                <div className="absolute top-10 left-10 opacity-5 animate-float delay-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <path d="m6.5 6.5 11 11" />
                        <path d="m21 21-1-1" />
                        <path d="m3 3 1 1" />
                        <path d="m18 22 4-4" />
                        <path d="m2 6 4-4" />
                        <path d="m3 10 7.9-7.9a2.12 2.12 0 0 1 3 3L6 13a2.12 2.12 0 0 1-3-3Z" />
                        <path d="m11 13 7.9-7.9a2.12 2.12 0 0 1 3 3L14 21a2.12 2.12 0 0 1-3-3Z" />
                    </svg>
                </div>

                <div className="absolute top-1/2 right-20 opacity-5 animate-spin-slow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v20" />
                        <path d="M2 12h20" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </div>
            </div>
            {children}
        </div>
    );
};

const DashboardHandler = () => {
    const { user, logout } = useAuthStore();

    if (!user) return null;

    return (
        <div className="min-h-screen relative z-10 flex flex-col">
            <nav className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/50">
                                FD
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-tight">FIT WITH <span className="text-red-500">DURGESH</span></h1>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Premium Fitness</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-bold text-white">{user.name}</span>
                                <span className="text-xs text-yellow-500 font-semibold px-2 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">{user.role}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-dark-700 hover:border-gray-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                {user.role === 'ADMIN' && <AdminDashboard />}
                {user.role === 'TRAINER' && <TrainerDashboard />}
                {user.role === 'CLIENT' && <ClientDashboard />}
            </main>
        </div>
    );
}

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return children;
};

// Check auth on app load
const AuthCheck = ({ children }) => {
    const { checkAuth } = useAuthStore();
    useEffect(() => {
        checkAuth();
    }, []);
    return children;
}

function App() {
    return (
        <Router>
            <AuthCheck>
                <SecurityLayer>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <DashboardHandler />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </SecurityLayer>
            </AuthCheck>
        </Router>
    );
}

export default App;
