import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
    const { token } = useAuthStore();
    const [stats, setStats] = useState({ trainers: [], clients: [], payments: [] });
    const [saasStats, setSaasStats] = useState({
        totalActiveClients: 0,
        totalExpiredClients: 0,
        totalActiveTrainers: 0,
        totalExpiredTrainers: 0,
        pendingPaymentsCount: 0,
        todayRevenue: 0
    });
    const [modal, setModal] = useState(null); // 'TRAINERS', 'CLIENTS', 'QR', 'PAYMENTS', 'RENEW', 'ADD_TRAINER'
    const [settings, setSettings] = useState({ clientPrice: 6000, trainerPrice: 659, subscriptionDuration: 30, qrCode: '' });
    const [msg, setMsg] = useState('');
    const [deleteId, setDeleteId] = useState(null); // ID to delete

    // New Trainer Form State
    const [showAddTrainer, setShowAddTrainer] = useState(false);
    const [newTrainer, setNewTrainer] = useState({ name: '', email: '', password: '', specialization: '' });

    // Trainer Assignment State
    const [assigningClient, setAssigningClient] = useState(null);
    const [selectedTrainer, setSelectedTrainer] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [trainersRes, clientsRes, paymentsRes, saasRes, settingsRes] = await Promise.all([
                api.get('/users/trainers', config),
                api.get('/users/clients', config),
                api.get('/payments/pending', config),
                api.get('/admin/stats', config),
                api.get('/settings', config)
            ]);
            setStats({
                trainers: trainersRes.data,
                clients: clientsRes.data,
                payments: paymentsRes.data
            });
            setSaasStats(saasRes.data);
            setSettings(settingsRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setMsg('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            await api.put('/users/status', { userId, isActive: !currentStatus }, config);
            fetchAllData();
        } catch (err) { console.error(err); }
    };

    const handleRenewal = async (userId) => {
        try {
            await api.put('/users/renew', { userId }, config);
            setMsg('Subscription Extended!');
            fetchAllData();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            alert('Error renewing subscription');
        }
    };

    const deleteUser = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/users/${deleteId}`, config);
            setMsg('User Deleted Successfully');
            setDeleteId(null);
            fetchAllData();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            alert('Error deleting user: ' + err.response?.data?.message);
        }
    };

    const approvePayment = async (id) => {
        try {
            await api.put(`/payments/${id}/approve`, {}, config);
            setMsg('Payment Approved!');
            fetchAllData();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) { alert('Error'); }
    };

    const rejectPayment = async (id) => {
        if (!window.confirm('Reject Payment?')) return;
        try {
            await api.put(`/payments/${id}/reject`, {}, config);
            fetchAllData();
        } catch (err) { alert('Error'); }
    };

    const saveSettings = async () => {
        try {
            await api.put('/settings', settings, config);
            setMsg('Settings Updated');
            fetchAllData();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) { setMsg('Error Updating Settings'); }
    };

    // Create new trainer
    const createTrainer = async (e) => {
        e.preventDefault();
        if (!newTrainer.name || !newTrainer.email || !newTrainer.password) {
            setMsg('Error: All fields required');
            return;
        }
        try {
            await api.post('/users/trainer', newTrainer, config);
            setMsg('Trainer Created Successfully!');
            setNewTrainer({ name: '', email: '', password: '', specialization: '' });
            setShowAddTrainer(false);
            fetchAllData();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            setMsg('Error: ' + (err.response?.data?.message || 'Failed to create trainer'));
            setTimeout(() => setMsg(''), 3000);
        }
    };

    // Assign trainer to client
    const assignTrainerToClient = async () => {
        if (!assigningClient || !selectedTrainer) return;
        try {
            await api.put('/users/assign', {
                clientId: assigningClient.id,
                trainerId: selectedTrainer === 'none' ? null : selectedTrainer
            }, config);
            setMsg('Trainer Assigned Successfully!');
            setAssigningClient(null);
            setSelectedTrainer('');
            fetchAllData();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            setMsg('Error: ' + (err.response?.data?.message || 'Failed to assign trainer'));
            setTimeout(() => setMsg(''), 3000);
        }
    };

    // Helper to render user row
    const UserRow = ({ u }) => {
        if (!u) return null;

        // Calculate subscription status for trainers
        const getTrainerSubscriptionInfo = () => {
            if (u.role !== 'TRAINER') return null;
            if (!u.subscriptionExpiresAt) {
                return { status: 'EXPIRED', daysRemaining: 0, color: 'red' };
            }
            const expiry = new Date(u.subscriptionExpiresAt);
            const now = new Date();
            const diffTime = expiry - now;
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (daysRemaining <= 0) {
                return { status: 'EXPIRED', daysRemaining: 0, color: 'red', expiryDate: expiry };
            } else if (daysRemaining <= 5) {
                return { status: 'EXPIRING', daysRemaining, color: 'yellow', expiryDate: expiry };
            }
            return { status: 'ACTIVE', daysRemaining, color: 'green', expiryDate: expiry };
        };

        const trainerSub = getTrainerSubscriptionInfo();

        return (
            <div key={u.id} className="group flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 border border-white/5 p-5 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 animate-reveal-up shadow-lg gap-4">
                <div className="flex items-center gap-5">
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-2xl overflow-hidden ${u.role === 'TRAINER' ? 'bg-gradient-to-br from-red-600 to-red-900' : 'bg-gradient-to-br from-blue-600 to-blue-900'}`}>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {u.name ? u.name.charAt(0) : '?'}
                    </div>
                    <div>
                        <div className="text-white font-black uppercase tracking-tight text-sm">{u.name || 'Unknown User'}</div>
                        <div className="text-xs text-gray-500 font-medium">{u.email || 'No Email'}</div>
                        {u.role === 'TRAINER' && trainerSub ? (
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${trainerSub.color === 'red' ? 'bg-red-600/20 text-red-500' :
                                    trainerSub.color === 'yellow' ? 'bg-yellow-600/20 text-yellow-500' :
                                        'bg-green-600/20 text-green-500'
                                    }`}>
                                    {trainerSub.status}
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold">
                                    {trainerSub.expiryDate ? trainerSub.expiryDate.toLocaleDateString() : 'No Date'}
                                </span>
                                <span className={`text-[10px] font-black ${trainerSub.color === 'red' ? 'text-red-500' :
                                    trainerSub.color === 'yellow' ? 'text-yellow-500' :
                                        'text-green-500'
                                    }`}>
                                    {trainerSub.daysRemaining > 0 ? `${trainerSub.daysRemaining} days` : 'Expired'}
                                </span>
                                <span className="text-[10px] text-gray-600 font-bold">
                                    • {u.managedClients ? u.managedClients.length : 0} clients
                                </span>
                            </div>
                        ) : (
                            <div className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1 opacity-60">
                                Renewal: {u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).toLocaleDateString() : 'Inactive'}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleStatus(u.id, u.isActive)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${u.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                    >
                        {u.isActive ? 'Active' : 'Blocked'}
                    </button>
                    <button
                        onClick={() => handleRenewal(u.id)}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-all duration-300"
                        title="Add 30 Days"
                    >
                        +30 Days
                    </button>
                    <button
                        onClick={() => setDeleteId(u.id)}
                        className="p-2.5 rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 border border-red-500/10"
                        title="Delete User"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-12 animate-reveal-up">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Admin Dashboard</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Overview of trainers and clients</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchAllData} className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-2xl transition-all border border-white/10" title="Refresh Data">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6" /><path d="M2.5 22v-6h6" /><path d="M2 11.5a10 10 0 0 1 18.8-4.3" /><path d="M22 12.5a10 10 0 0 1-18.8 4.3" /></svg>
                    </button>
                    {stats.payments.length > 0 && (
                        <button onClick={() => setModal('PAYMENTS')} className="group relative bg-red-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-900/50 hover:bg-red-500 transition-all active:scale-95 overflow-hidden">
                            <span className="relative z-10">Pending Payments ({stats.payments.length})</span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>
                    )}
                </div>
            </div>

            {/* 1️⃣ SUBSCRIPTION CONTROL PANEL (SaaS Stats) */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Active Clients', val: saasStats.totalActiveClients, color: 'emerald', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
                    { label: 'Expired Clients', val: saasStats.totalExpiredClients, color: 'rose', icon: 'M18.36 6.64L5.64 19.36 M12 2a10 10 0 1 1-10 10A10 10 0 0 1 12 2z' },
                    { label: 'Active Trainers', val: saasStats.totalActiveTrainers, color: 'sky', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
                    { label: 'Expired Trainers', val: saasStats.totalExpiredTrainers, color: 'orange', icon: 'M12 2a10 10 0 1 1-10 10A10 10 0 0 1 12 2z' },
                    { label: 'Pending Payouts', val: saasStats.pendingPaymentsCount, color: 'yellow', icon: 'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
                    { label: "Today's Revenue", val: `₹${saasStats.todayRevenue}`, color: 'indigo', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }
                ].map((s, i) => (
                    <div key={i} className="glass-card p-5 rounded-2xl relative overflow-hidden group border border-white/5 hover:border-white/10 transition-all shadow-lg">
                        <div className={`absolute -right-2 -top-2 w-16 h-16 bg-${s.color}-500/10 rounded-full blur-2xl group-hover:bg-${s.color}-500/20 transition-all`}></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 group-hover:text-white transition-colors">{s.label}</p>
                            <h3 className={`text-2xl font-black text-${s.color}-500 tracking-tight`}>{s.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Manage Trainers', val: stats.trainers.length, type: 'TRAINERS', color: 'red' },
                    { label: 'Manage Clients', val: stats.clients.length, type: 'CLIENTS', color: 'blue' },
                    { label: 'Payment Settings', val: 'QR CODE', type: 'QR', color: 'yellow' }
                ].map((s, i) => (
                    <div
                        key={i}
                        onClick={() => setModal(s.type)}
                        className="cursor-pointer glass-card p-8 rounded-[2rem] group hover:scale-[1.02] active:scale-95 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity text-${s.color}-500`}>
                            {s.type === 'TRAINERS' && <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                            {s.type === 'CLIENTS' && <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                            {s.type === 'QR' && <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h.01" /><path d="M17 7h.01" /><path d="M7 17h.01" /><path d="M17 17h.01" /><path d="M12 12h.01" /></svg>}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-white transition-colors">{s.label}</p>
                        <h3 className="text-5xl font-black text-white tracking-tighter">{s.val}</h3>
                        <div className={`mt-6 w-12 h-1 bg-${s.color}-600 rounded-full group-hover:w-full transition-all duration-700`}></div>
                    </div>
                ))}
            </div>

            {/* General Modal Wrapper */}
            {modal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900/90 border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)] relative animate-reveal-scale">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center text-white">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">
                                    {modal === 'TRAINERS' && 'Trainers List'}
                                    {modal === 'CLIENTS' && 'Clients List'}
                                    {modal === 'PAYMENTS' && 'Pending Payments'}
                                    {modal === 'QR' && 'Settings'}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Admin Control</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {modal === 'TRAINERS' && !showAddTrainer && (
                                    <button
                                        onClick={() => setShowAddTrainer(true)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        + Add Trainer
                                    </button>
                                )}
                                <button onClick={() => { setModal(null); setShowAddTrainer(false); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-600 text-white transition-all transform hover:rotate-90">✕</button>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-4 custom-scrollbar">
                            {/* Add Trainer Form */}
                            {modal === 'TRAINERS' && showAddTrainer && (
                                <form onSubmit={createTrainer} className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl space-y-4 mb-6">
                                    <h4 className="text-lg font-black text-green-500 uppercase tracking-tight mb-4">Create New Trainer</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Full Name *"
                                            value={newTrainer.name}
                                            onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-green-500/50"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email *"
                                            value={newTrainer.email}
                                            onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-green-500/50"
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password *"
                                            value={newTrainer.password}
                                            onChange={(e) => setNewTrainer({ ...newTrainer, password: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-green-500/50"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Specialization (optional)"
                                            value={newTrainer.specialization}
                                            onChange={(e) => setNewTrainer({ ...newTrainer, specialization: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-green-500/50"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="submit" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                            Create Trainer
                                        </button>
                                        <button type="button" onClick={() => setShowAddTrainer(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {modal === 'TRAINERS' && stats.trainers.map(u => <UserRow key={u.id} u={u} />)}

                            {modal === 'CLIENTS' && stats.clients.length === 0 ? <p className="text-gray-500 text-center font-bold uppercase tracking-widest py-20 opacity-20">No clients registered</p> : null}
                            {modal === 'CLIENTS' && stats.clients.map(u => {
                                // Calculate subscription status for clients
                                const getClientSubscriptionInfo = () => {
                                    if (!u.subscriptionExpiresAt) {
                                        return { status: 'EXPIRED', daysRemaining: 0, color: 'red' };
                                    }
                                    const expiry = new Date(u.subscriptionExpiresAt);
                                    const now = new Date();
                                    const diffTime = expiry - now;
                                    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    if (daysRemaining <= 0) {
                                        return { status: 'EXPIRED', daysRemaining: 0, color: 'red', expiryDate: expiry };
                                    } else if (daysRemaining <= 5) {
                                        return { status: 'EXPIRING', daysRemaining, color: 'yellow', expiryDate: expiry };
                                    }
                                    return { status: 'ACTIVE', daysRemaining, color: 'green', expiryDate: expiry };
                                };

                                const clientSub = getClientSubscriptionInfo();

                                return (
                                    <div key={u.id} className="group flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 border border-white/5 p-5 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-lg gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="relative w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-900">
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                {u.name ? u.name.charAt(0) : '?'}
                                            </div>
                                            <div>
                                                <div className="text-white font-black uppercase tracking-tight text-sm">{u.name || 'Unknown User'}</div>
                                                <div className="text-xs text-gray-500 font-medium">{u.email || 'No Email'}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${clientSub.color === 'red' ? 'bg-red-600/20 text-red-500' :
                                                        clientSub.color === 'yellow' ? 'bg-yellow-600/20 text-yellow-500' :
                                                            'bg-green-600/20 text-green-500'
                                                        }`}>
                                                        {clientSub.status}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-bold">
                                                        {clientSub.expiryDate ? clientSub.expiryDate.toLocaleDateString() : 'No Date'}
                                                    </span>
                                                    <span className={`text-[10px] font-black ${clientSub.color === 'red' ? 'text-red-500' :
                                                        clientSub.color === 'yellow' ? 'text-yellow-500' :
                                                            'text-green-500'
                                                        }`}>
                                                        {clientSub.daysRemaining > 0 ? `${clientSub.daysRemaining} days` : 'Expired'}
                                                    </span>
                                                    <span className="text-[10px] text-blue-500 font-bold">
                                                        • {u.clientProfile?.trainer?.name || u.clientProfile?.trainerId ? 'Assigned' : 'Unassigned'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => { setAssigningClient(u); setSelectedTrainer(u.clientProfile?.trainerId || ''); }}
                                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all"
                                            >
                                                Assign Trainer
                                            </button>
                                            <button
                                                onClick={() => handleRenewal(u.id)}
                                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-all duration-300"
                                                title="Add 30 Days"
                                            >
                                                +30 Days
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(u.id, u.isActive)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${u.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                                            >
                                                {u.isActive ? 'Active' : 'Blocked'}
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(u.id)}
                                                className="p-2.5 rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 border border-red-500/10"
                                                title="Delete User"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {modal === 'PAYMENTS' && (
                                <div className="space-y-4">
                                    {stats.payments.length === 0 ? (
                                        <p className="text-gray-500 text-center font-bold uppercase tracking-widest py-20 opacity-20">No pending payments</p>
                                    ) : (
                                        stats.payments.map(p => (
                                            <div key={p.id} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-green-500/30 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 font-bold shadow-inner">₹</div>
                                                    <div>
                                                        <p className="text-white font-black uppercase tracking-tight text-sm">{p.user.name}</p>
                                                        <p className="text-xs text-gray-500 font-bold mt-0.5 tracking-tighter line-clamp-1">TXN: {p.transactionId}</p>
                                                        <p className="text-xl font-black text-green-500 mt-1">₹{p.amount}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 w-full md:w-auto">
                                                    <button onClick={() => rejectPayment(p.id)} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Reject</button>
                                                    <button onClick={() => approvePayment(p.id)} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-500 text-black hover:bg-green-400 transition-all shadow-lg shadow-green-900/40">Approve</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {modal === 'QR' && (
                                <div className="max-w-2xl mx-auto py-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Client Price (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-yellow-500/50 transition-all"
                                                value={settings.clientPrice}
                                                onChange={(e) => setSettings({ ...settings, clientPrice: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Trainer Price (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-yellow-500/50 transition-all"
                                                value={settings.trainerPrice}
                                                onChange={(e) => setSettings({ ...settings, trainerPrice: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Subscription Duration (Days)</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-yellow-500/50 transition-all appearance-none cursor-pointer"
                                                value={settings.subscriptionDuration}
                                                onChange={(e) => setSettings({ ...settings, subscriptionDuration: e.target.value })}
                                            >
                                                <option value="30" className="bg-gray-900">30 Days</option>
                                                <option value="60" className="bg-gray-900">60 Days</option>
                                                <option value="90" className="bg-gray-900">90 Days</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Payment QR Code URL</label>
                                            <input
                                                type="text"
                                                placeholder="https://asset.link/qr.png"
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-yellow-500/50 transition-all"
                                                value={settings.qrCode}
                                                onChange={(e) => setSettings({ ...settings, qrCode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button onClick={saveSettings} className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-[0.2em] text-xs py-5 rounded-[1.5rem] shadow-xl shadow-yellow-900/20 active:scale-95 transition-all">Save All Settings</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                    <div className="bg-dark-900 border border-white/10 rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl shadow-red-900/30 animate-reveal-scale">
                        <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-red-500/20">💀</div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Delete User?</h3>
                        <p className="text-gray-500 text-sm font-bold mb-8 leading-relaxed">This action cannot be undone.<br /><span className="text-red-500/50">All user data will be removed.</span></p>
                        <div className="flex flex-col gap-3">
                            <button onClick={deleteUser} className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-lg shadow-red-900/40 transition-all active:scale-95">Yes, Delete User</button>
                            <button onClick={() => setDeleteId(null)} className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trainer Assignment Modal */}
            {assigningClient && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                    <div className="bg-dark-900 border border-white/10 rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl shadow-purple-900/30 animate-reveal-scale">
                        <div className="w-20 h-20 bg-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-purple-500/20">👤</div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Assign Trainer</h3>
                        <p className="text-gray-500 text-sm font-bold mb-6">
                            Client: <span className="text-purple-400">{assigningClient.name}</span>
                        </p>
                        <select
                            value={selectedTrainer}
                            onChange={(e) => setSelectedTrainer(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-purple-500/50 mb-6 appearance-none cursor-pointer"
                        >
                            <option value="none" className="bg-gray-900">Unassign (No Trainer)</option>
                            {stats.trainers.map(t => (
                                <option key={t.id} value={t.id} className="bg-gray-900">
                                    {t.name} ({t.managedClients?.length || 0} clients)
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-col gap-3">
                            <button onClick={assignTrainerToClient} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-lg shadow-purple-900/40 transition-all active:scale-95">Assign Trainer</button>
                            <button onClick={() => { setAssigningClient(null); setSelectedTrainer(''); }} className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {msg && <div className={`fixed bottom-8 right-8 px-8 py-4 rounded-[1.5rem] shadow-2xl font-black uppercase tracking-widest text-xs animate-reveal-up z-[100] ${msg.includes('Error') ? 'bg-red-600 text-white shadow-red-900/40' : 'bg-green-500 text-black shadow-green-900/40'}`}>{msg}</div>}
        </div>
    );
};

export default AdminDashboard;
