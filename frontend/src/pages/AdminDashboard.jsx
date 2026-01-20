import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
    const { token } = useAuthStore();
    const [trainers, setTrainers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [modal, setModal] = useState(null); // 'TRAINERS', 'QR', 'PAYMENTS'
    const [qrUrl, setQrUrl] = useState('');
    const [msg, setMsg] = useState('');
    const [pendingCount, setPendingCount] = useState(0);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const fetchTrainers = async () => {
        try {
            const res = await api.get('/users/trainers', config);
            setTrainers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchPendingPayments = async () => {
        try {
            const res = await api.get('/payments/pending', config);
            setPayments(res.data);
            setPendingCount(res.data.length);
        } catch (err) { console.error(err); }
    };

    const approvePayment = async (id) => {
        try {
            await api.put(`/payments/${id}/approve`, {}, config);
            setMsg('Payment Approved! User Access Granted.');
            fetchPendingPayments();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            alert('Error approving payment');
        }
    };

    const rejectPayment = async (id) => {
        if (!window.confirm('Are you sure you want to reject this payment?')) return;
        try {
            await api.put(`/payments/${id}/reject`, {}, config);
            fetchPendingPayments();
        } catch (err) {
            alert('Error rejecting payment');
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            await api.put('/users/status', { userId, isActive: !currentStatus }, config);
            fetchTrainers();
        } catch (err) { console.error(err); }
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
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white">Admin Dashboard</h2>
                    <p className="text-gray-400 mt-1">Manage your empire, trainers, and payments.</p>
                </div>
                {/* Pending Alert Badge */}
                {pendingCount > 0 && (
                    <button onClick={() => { setModal('PAYMENTS'); fetchPendingPayments(); }} className="animate-pulse bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-600/50 hover:scale-105 transition-transform">
                        🔔 {pendingCount} Pending Payment{pendingCount > 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => { setModal('TRAINERS'); fetchTrainers(); }} className="cursor-pointer bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-red-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Staff</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">Trainers</h3>
                    <p className="text-sm text-gray-500">Manage Access</p>
                </div>

                <div onClick={() => { setModal('PAYMENTS'); fetchPendingPayments(); }} className="cursor-pointer bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-blue-500/30 transition-all group relative overflow-hidden">
                    {pendingCount > 0 && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-3 animate-ping"></div>}
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approvals</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">{pendingCount}</h3>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                </div>

                <div onClick={() => setModal('QR')} className="cursor-pointer bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-yellow-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">QR Code</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">Update</h3>
                    <p className="text-sm text-gray-500">Settings</p>
                </div>
            </div>

            {/* PAYMENT APPROVAL MODAL */}
            {modal === 'PAYMENTS' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
                            <h3 className="text-xl font-bold text-white">Payment Requests</h3>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
                            {msg && <div className="text-center p-3 bg-green-500/20 text-green-400 rounded-lg mb-4 font-bold animate-pulse">{msg}</div>}

                            {payments.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <p className="text-4xl mb-2">✅</p>
                                    <p>All caught up! No pending payments.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-gray-500 text-xs uppercase border-b border-white/10">
                                            <th className="p-3">User</th>
                                            <th className="p-3">Amount</th>
                                            <th className="p-3">Transaction ID</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {payments.map(p => (
                                            <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-3">
                                                    <div className="font-bold text-white">{p.user.name}</div>
                                                    <div className="text-xs text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded w-fit mt-1">{p.user.role}</div>
                                                </td>
                                                <td className="p-3 font-mono text-lg text-green-400">₹{p.amount}</td>
                                                <td className="p-3 font-mono text-gray-300 tracking-wider copy-all select-all">{p.transactionId}</td>
                                                <td className="p-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                <td className="p-3 text-right space-x-2 flex justify-end">
                                                    <button
                                                        onClick={() => rejectPayment(p.id)}
                                                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-2 rounded-lg font-bold transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => approvePayment(p.id)}
                                                        className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 hover:scale-105 transition-all"
                                                    >
                                                        Approve ✓
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TRAINERS MODAL */}
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

            {/* QR MODAL */}
            {modal === 'QR' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
