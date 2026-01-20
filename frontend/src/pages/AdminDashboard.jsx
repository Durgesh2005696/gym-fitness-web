import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
    const { token } = useAuthStore();
    const [stats, setStats] = useState({ trainers: [], clients: [], payments: [] });
    const [modal, setModal] = useState(null); // 'TRAINERS', 'CLIENTS', 'QR', 'PAYMENTS', 'RENEW'
    const [qrUrl, setQrUrl] = useState('');
    const [msg, setMsg] = useState('');
    const [deleteId, setDeleteId] = useState(null); // ID to delete

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [trainersRes, clientsRes, paymentsRes] = await Promise.all([
                api.get('/users/trainers', config),
                api.get('/users/clients', config),
                api.get('/payments/pending', config)
            ]);
            setStats({
                trainers: trainersRes.data,
                clients: clientsRes.data.map(c => c.user), // Extract user from profile
                payments: paymentsRes.data
            });
        } catch (err) { console.error(err); }
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            await api.put('/users/status', { userId, isActive: !currentStatus }, config);
            fetchAllData();
        } catch (err) { console.error(err); }
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

    const saveQR = async () => {
        try {
            await api.post('/settings/qr', { qrCodeUrl: qrUrl }, config);
            setMsg('QR Saved');
            setTimeout(() => setMsg(''), 2000);
        } catch (err) { setMsg('Error'); }
    };

    // Helper to render user row
    const UserRow = ({ u }) => (
        <div key={u.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-4 rounded-xl hover:border-white/10 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${u.role === 'TRAINER' ? 'bg-red-900' : 'bg-blue-900'}`}>
                    {u.name.charAt(0)}
                </div>
                <div>
                    <div className="text-white font-bold">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                        Expires: {u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).toLocaleDateString() : 'No Sub'}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => toggleStatus(u.id, u.isActive)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${u.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                >
                    {u.isActive ? 'Active' : 'Blocked'}
                </button>
                <button
                    onClick={() => setDeleteId(u.id)}
                    className="p-2 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                    title="Delete User"
                >
                    🗑
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Stats Code (Simplified for brevity, similar to before but updated) */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white">Admin Dashboard</h2>
                    <p className="text-gray-400 mt-1">Manage your empire.</p>
                </div>
                {stats.payments.length > 0 && (
                    <button onClick={() => setModal('PAYMENTS')} className="animate-pulse bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                        🔔 {stats.payments.length} Pending
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trainers Card */}
                <div onClick={() => setModal('TRAINERS')} className="cursor-pointer bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-red-500/30 transition-all group">
                    <h3 className="text-3xl font-black text-white mb-1">{stats.trainers.length}</h3>
                    <p className="text-sm text-gray-500">Trainers</p>
                </div>

                {/* Clients Card */}
                <div onClick={() => setModal('CLIENTS')} className="cursor-pointer bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-blue-500/30 transition-all group">
                    <h3 className="text-3xl font-black text-white mb-1">{stats.clients.length}</h3>
                    <p className="text-sm text-gray-500">Clients</p>
                </div>

                {/* QR Card */}
                <div onClick={() => setModal('QR')} className="cursor-pointer bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-yellow-500/30 transition-all group">
                    <h3 className="text-3xl font-black text-white mb-1">QR</h3>
                    <p className="text-sm text-gray-500">Settings</p>
                </div>
            </div>

            {/* General Modal Wrapper */}
            {modal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {modal === 'TRAINERS' && 'Manage Trainers'}
                                {modal === 'CLIENTS' && 'Manage Clients'}
                                {modal === 'PAYMENTS' && 'Payment Requests'}
                                {modal === 'QR' && 'Update QR'}
                            </h3>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
                            {modal === 'TRAINERS' && stats.trainers.map(u => <UserRow key={u.id} u={u} />)}

                            {modal === 'CLIENTS' && stats.clients.length === 0 ? <p className="text-gray-500 text-center">No clients yet.</p> : null}
                            {modal === 'CLIENTS' && stats.clients.map(u => <UserRow key={u.id} u={u} />)}

                            {modal === 'PAYMENTS' && (
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead><tr className="border-b border-white/10"><th className="p-2">User</th><th className="p-2">Amount</th><th className="p-2">Txn ID</th><th className="p-2 text-right">Action</th></tr></thead>
                                    <tbody>
                                        {stats.payments.map(p => (
                                            <tr key={p.id} className="border-b border-white/5">
                                                <td className="p-2 font-bold text-white">{p.user.name}</td>
                                                <td className="p-2">₹{p.amount}</td>
                                                <td className="p-2 font-mono">{p.transactionId}</td>
                                                <td className="p-2 text-right space-x-2">
                                                    <button onClick={() => rejectPayment(p.id)} className="text-red-500 hover:underline">Reject</button>
                                                    <button onClick={() => approvePayment(p.id)} className="text-green-500 font-bold hover:underline">Approve</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {modal === 'QR' && (
                                <div className="space-y-4">
                                    <input type="text" placeholder="Image URL" className="w-full bg-dark-800 border border-dark-600 rounded-lg p-3 text-white" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} />
                                    <button onClick={saveQR} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg">Save</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
                    <div className="bg-dark-800 border-2 border-red-600 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl shadow-red-900/50 animate-in zoom-in">
                        <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
                        <p className="text-gray-400 text-sm mb-6">This action is permanent.<br />All data (Plans, payments, logs) will be erased.</p>
                        <div className="flex gap-3">
                            <button onClick={deleteUser} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg">Yes, Delete</button>
                            <button onClick={() => setDeleteId(null)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-gray-300 font-bold py-3 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {msg && <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold animate-in slide-in-from-right">{msg}</div>}
        </div>
    );
};

export default AdminDashboard;
