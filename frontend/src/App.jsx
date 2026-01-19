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
            {user && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center opacity-[0.03] overflow-hidden">
                    <div className="rotate-45 text-4xl font-bold text-white whitespace-nowrap">
                        {Array(20).fill(`${user.name} - ${new Date().toLocaleDateString()} `).map((t, i) => (
                            <span key={i} className="block">{t}</span>
                        ))}
                    </div>
                </div>
            )}
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
