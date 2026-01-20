import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
    const { token } = useAuthStore();
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]); // Need clients for renewals too
    const [modal, setModal] = useState(null); // 'TRAINERS', 'QR', 'RENEW'
    const [qrUrl, setQrUrl] = useState('');
    const [msg, setMsg] = useState('');
    const [renewUserId, setRenewUserId] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchTrainers = async () => {
        try {
            const res = await api.get('/users/trainers', config);
            setTrainers(res.data);
        } catch (err) { console.error(err); }
    };

    // We reuse the same endpoint for clients if we want to renew them? 
    // Or we need a getAllUsers endpoint. Let's assume we can fetch all or search.
    // For simplicity, let's add a "Renew User by ID" or list all users.
    // Let's modify the modal to list ALL users for renewal if we want.
    // Or just fetching trainers is enough? The user said Admin manages everything.
    // I need a fetchAllUsers function.

    const [allUsers, setAllUsers] = useState([]);
    const fetchAllUsers = async () => {
        try {
            // We need to ensure GET /users endpoint exists and works for admin
            const res = await api.get('/users', config);
            setAllUsers(res.data);
        } catch (err) { console.error(err); }
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            await api.put('/users/status', { userId, isActive: !currentStatus }, config);
            fetchTrainers(); // Refresh
            fetchAllUsers();
        } catch (err) { console.error(err); }
    };

    const renewUser = async (userId) => {
        try {
            await api.put('/users/renew', { userId, days: 30 }, config);
            setMsg('User Renewed for 30 Days!');
            setTimeout(() => setMsg(''), 2000);
            fetchAllUsers();
        } catch (err) {
            setMsg('Error renewing user');
        }
    };

    const saveQR = async () => {
        try {
            await api.post('/settings/qr', { qrCodeUrl: qrUrl }, config);
            setMsg('QR Code Saved Successfully!');
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            setMsg('Error saving QR');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black text-white">Admin Dashboard</h2>
                <p className="text-gray-400 mt-1">Manage your empire, trainers, and payments.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-red-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Trainers</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">Manage</h3>
                    <button onClick={() => { setModal('TRAINERS'); fetchTrainers(); }} className="text-sm text-red-400 hover:text-red-300 font-semibold flex items-center gap-1">
                        View Details →
                    </button>
                </div>

                <div className="bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-blue-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subscriptions</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">Renew</h3>
                    <button onClick={() => { setModal('RENEW'); fetchAllUsers(); }} className="text-sm text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1">
                        Manage Access →
                    </button>
                </div>

                <div className="bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-yellow-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment QR</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">Update</h3>
                    <button onClick={() => setModal('QR')} className="text-sm text-yellow-500 hover:text-yellow-400 font-semibold flex items-center gap-1">
                        Settings →
                    </button>
                </div>
            </div>

            {/* Modals */}
            {modal === 'TRAINERS' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Manage Trainers</h3>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-3">
                            {trainers.map(t => (
                                <div key={t.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-4 rounded-xl">
                                    <div className="text-white">
                                        <div className="font-bold">{t.name}</div>
                                        <div className="text-sm text-gray-500">{t.email}</div>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(t.id, t.isActive)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold ${t.isActive ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}
                                    >
                                        {t.isActive ? 'Block' : 'Approve'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {modal === 'RENEW' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Renew Subscriptions</h3>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
                            {msg && <div className="text-center p-2 bg-green-500/20 text-green-400 rounded mb-2">{msg}</div>}

                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-500 text-xs uppercase border-b border-white/10">
                                        <th className="p-3">User</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Expires On</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map(u => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3">
                                                <div className="font-bold text-white">{u.name}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </td>
                                            <td className="p-3"><span className="text-xs font-bold bg-white/10 px-2 py-1 rounded">{u.role}</span></td>
                                            <td className="p-3 text-sm text-gray-400">
                                                {u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="p-3">
                                                {(!u.subscriptionExpiresAt || new Date(u.subscriptionExpiresAt) < new Date()) ?
                                                    <span className="text-red-500 text-xs font-bold">Expired</span> :
                                                    <span className="text-green-500 text-xs font-bold">Active</span>
                                                }
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => renewUser(u.id)}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold"
                                                >
                                                    Renew +30 Days
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {modal === 'QR' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    {/* QR Modal Content (Same as before) */}
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">Update Payment QR</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {msg && <div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-sm text-center font-bold">{msg}</div>}
                            <input
                                type="text"
                                placeholder="Image URL"
                                className="w-full bg-dark-800 border border-dark-600 rounded-lg p-3 text-white"
                                value={qrUrl}
                                onChange={(e) => setQrUrl(e.target.value)}
                            />
                            <button onClick={saveQR} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg">Save</button>
                            <button onClick={() => setModal(null)} className="w-full bg-dark-700 hover:bg-dark-600 text-white font-bold py-3 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
