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
        <div className="select-none relative">
            {/* Watermark */}
            {/* Watermark & Background Animations */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Text Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] z-10">
                    <div className="rotate-45 text-4xl font-bold text-white whitespace-nowrap">
                        {Array(20).fill("Fit_With_Durgesh ").map((t, i) => (
                            <span key={i} className="block">{t}</span>
                        ))}
                    </div>
                </div>

                {/* Animated Icons */}
                <div className="absolute top-10 left-10 opacity-5 animate-float delay-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v20" />
                        <path d="M2 12h20" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </div>

                <div className="absolute bottom-20 left-1/3 opacity-5 animate-float" style={{ animationDelay: '2s' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                        <path d="M6 7h12" />
                        <rect x="2" y="5" width="4" height="4" rx="1" />
                        <rect x="18" y="5" width="4" height="4" rx="1" />
                        <path d="M6 17h12" />
                        <rect x="2" y="15" width="4" height="4" rx="1" />
                        <rect x="18" y="15" width="4" height="4" rx="1" />
                        <path d="M12 7v10" />
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
        <div className="min-h-screen bg-dark-900 text-white">
            <nav className="bg-dark-800 border-b border-dark-700 p-4 flex justify-between items-center sticky top-0 z-40">
                <h1 className="text-xl font-bold text-primary">FitManager</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">{user.name} ({user.role})</span>
                    <button onClick={logout} className="text-red-500 hover:text-red-400 font-medium text-sm">Logout</button>
                </div>
            </nav>
            <main className="p-6 max-w-7xl mx-auto">
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
