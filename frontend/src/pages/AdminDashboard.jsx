import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
    const { token } = useAuthStore();
    const [trainers, setTrainers] = useState([]);
    const [modal, setModal] = useState(null); // 'TRAINERS', 'QR'
    const [qrUrl, setQrUrl] = useState('');
    const [loading, setLoading] = useState(false);
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
            setMsg('QR Code Saved!');
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
        <div className="space-y-6 relative">
            <div className="watermark">fit_with_durgesh</div>
            <h2 className="text-2xl font-bold text-primary">Admin Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-800 p-6 rounded shadow border border-dark-700">
                    <h3 className="text-xl font-bold text-white mb-2">Manage Trainers</h3>
                    <p className="text-gray-400">View, Approve, or Block trainers.</p>
                    <button onClick={handleOpenTrainers} className="mt-4 bg-primary text-dark-900 px-4 py-2 rounded font-bold hover:bg-yellow-500">Manage</button>
                </div>
                <div className="bg-dark-800 p-6 rounded shadow border border-dark-700">
                    <h3 className="text-xl font-bold text-white mb-2">QR Code Payment</h3>
                    <p className="text-gray-400">Update payment QR code for subscriptions.</p>
                    <button onClick={() => setModal('QR')} className="mt-4 bg-secondary text-white px-4 py-2 rounded font-bold hover:bg-blue-600">Update</button>
                </div>
                <div className="bg-dark-800 p-6 rounded shadow border border-dark-700">
                    <h3 className="text-xl font-bold text-white mb-2">System Stats</h3>
                    <p className="text-gray-400">View total users and active subscriptions.</p>
                </div>
            </div>

            {/* Modals */}
            {modal === 'TRAINERS' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-dark-900 p-6 rounded-lg w-full max-w-2xl border border-dark-700 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-4">Trainers List</h3>
                        <div className="space-y-2">
                            {trainers.map(t => (
                                <div key={t.id} className="flex justify-between items-center bg-dark-800 p-3 rounded">
                                    <div>
                                        <div className="text-white font-bold">{t.name}</div>
                                        <div className="text-sm text-gray-400">{t.email}</div>
                                        <div className={`text-xs ${t.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.isActive ? 'Active' : 'Blocked'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(t.id, t.isActive)}
                                        className={`px-3 py-1 rounded text-sm font-bold ${t.isActive ? 'bg-red-500/20 text-red-500 hover:bg-red-500/40' : 'bg-green-500/20 text-green-500 hover:bg-green-500/40'}`}
                                    >
                                        {t.isActive ? 'Block' : 'Approve'}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setModal(null)} className="mt-4 text-gray-400 hover:text-white">Close</button>
                    </div>
                </div>
            )}

            {modal === 'QR' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-dark-900 p-6 rounded-lg w-full max-w-md border border-dark-700">
                        <h3 className="text-xl font-bold text-white mb-4">Update QR Code</h3>
                        {msg && <div className="text-green-400 mb-2 text-sm">{msg}</div>}
                        <input
                            type="text"
                            placeholder="Data URL or Image Link"
                            className="w-full bg-dark-800 border border-dark-700 rounded p-2 text-white mb-4"
                            value={qrUrl}
                            onChange={(e) => setQrUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mb-4">Enter a direct image link (Google Drive, Imgur, etc.)</p>
                        <div className="flex gap-2">
                            <button onClick={saveQR} className="bg-primary text-dark-900 px-4 py-2 rounded font-bold">Save</button>
                            <button onClick={() => setModal(null)} className="text-gray-400 px-4 py-2">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
