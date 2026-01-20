import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
    const { token } = useAuthStore();
    const [trainers, setTrainers] = useState([]);
    const [modal, setModal] = useState(null); // 'TRAINERS', 'QR'
    const [qrUrl, setQrUrl] = useState('');
    const [msg, setMsg] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchTrainers = async () => {
        try {
            const res = await api.get('/users/trainers', config);
            setTrainers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            await api.put('/users/status', { userId, isActive: !currentStatus }, config);
            fetchTrainers();
        } catch (err) {
            console.error(err);
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

    const handleOpenTrainers = () => {
        setModal('TRAINERS');
        fetchTrainers();
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
                    <button onClick={handleOpenTrainers} className="text-sm text-red-400 hover:text-red-300 font-semibold flex items-center gap-1">
                        View Details →
                    </button>
                </div>

                <div className="bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl hover:border-yellow-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payments</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">QR Code</h3>
                    <button onClick={() => setModal('QR')} className="text-sm text-yellow-500 hover:text-yellow-400 font-semibold flex items-center gap-1">
                        Update Settings →
                    </button>
                </div>

                <div className="bg-dark-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Earnings</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">₹ --</h3>
                    <p className="text-sm text-gray-500">Monthly Revenue</p>
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
                            {trainers.length === 0 ? <p className="text-gray-500 text-center py-8">No trainers found.</p> : trainers.map(t => (
                                <div key={t.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-4 rounded-xl hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold text-white">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{t.name}</div>
                                            <div className="text-sm text-gray-500">{t.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                        <button
                                            onClick={() => toggleStatus(t.id, t.isActive)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${t.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}
                                        >
                                            {t.isActive ? 'Block Access' : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {modal === 'QR' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">Update Payment QR</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {msg && <div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-sm text-center font-bold">{msg}</div>}

                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center min-h-[200px]">
                                {qrUrl ? (
                                    <img src={qrUrl} alt="QR Preview" className="max-h-48 rounded-lg" />
                                ) : (
                                    <div className="text-gray-500 text-sm">No QR Image Set</div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Image URL</label>
                                <input
                                    type="text"
                                    placeholder="https://imgur.com/..."
                                    className="w-full bg-dark-800 border border-dark-600 rounded-lg p-3 text-white mt-1 focus:border-yellow-500 focus:outline-none"
                                    value={qrUrl}
                                    onChange={(e) => setQrUrl(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-500 mt-2">Upload your QR to Imgur or Google Drive and paste the direct link here.</p>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button onClick={saveQR} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors">Save Changes</button>
                                <button onClick={() => setModal(null)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-bold py-3 rounded-lg transition-colors">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
