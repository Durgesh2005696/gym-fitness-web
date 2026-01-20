import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const TrainerDashboard = () => {
    const { user, token } = useAuthStore();
    const [stats, setStats] = useState({ clients: 0, activePlans: 0 });
    const [action, setAction] = useState(null); // 'ADD_CLIENT', 'CREATE_DIET', 'CREATE_WORKOUT'
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch stats logic here
        // setStats({ clients: 5, activePlans: 3 }); // Mock for UI
    }, []);

    const handleAction = (type) => {
        setAction(type);
        setFormData({});
        setMessage('');
    };

    const submitAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (action === 'CREATE_DIET' || action === 'CREATE_WORKOUT') {
                await api.post('/plans', {
                    clientId: formData.clientId,
                    type: action === 'CREATE_DIET' ? 'DIET' : 'WORKOUT',
                    data: formData.details,
                    validUntil: formData.validUntil
                }, config);
                setMessage('Plan assigned successfully!');
            } else if (action === 'ADD_CLIENT') {
                await api.put('/users/assign', {
                    clientEmail: formData.clientEmail,
                    trainerId: user._id || user.id
                }, config);
                setMessage('New client added to your roster!');
            }
            setTimeout(() => {
                setAction(null);
                setMessage('');
            }, 2000);
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white">Trainer Zone</h2>
                    <p className="text-gray-400 mt-1">Shape bodies, change lives.</p>
                </div>
                <div className="hidden md:block">
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">Status: Active</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-800/50 backdrop-blur-xl p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Total Clients</h3>
                    <p className="text-5xl font-black text-white">{stats.clients}</p>
                </div>

                <div className="bg-dark-800/50 backdrop-blur-xl p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 13v6" /><path d="M12 13l4-4" /></svg>
                    </div>
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Active Plans</h3>
                    <p className="text-5xl font-black text-white">{stats.activePlans}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => handleAction('ADD_CLIENT')} className="group p-6 bg-gradient-to-br from-dark-800 to-dark-900 border border-white/5 hover:border-blue-500/50 rounded-2xl transition-all shadow-lg hover:shadow-blue-900/20 text-left">
                    <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Add New Client</h3>
                    <p className="text-sm text-gray-500 mt-1">Assign a new member to your roster.</p>
                </button>

                <button onClick={() => handleAction('CREATE_DIET')} className="group p-6 bg-gradient-to-br from-dark-800 to-dark-900 border border-white/5 hover:border-green-500/50 rounded-2xl transition-all shadow-lg hover:shadow-green-900/20 text-left">
                    <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2.95 1.51l.65-.24a6 6 0 0 0 3.73-4.47l.5-3.05a8 8 0 0 0-4.36-8.98l-.7-.28a2 2 0 0 0-1.7.13L2.4 13.9a2 2 0 0 0 .54 3.7l6.63 2.1c.54.16.82.74.65 1.28l-.34 1.15a2 2 0 0 0 .88 2.27Z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">Create Diet Plan</h3>
                    <p className="text-sm text-gray-500 mt-1">Design a nutrition chart.</p>
                </button>

                <button onClick={() => handleAction('CREATE_WORKOUT')} className="group p-6 bg-gradient-to-br from-dark-800 to-dark-900 border border-white/5 hover:border-red-500/50 rounded-2xl transition-all shadow-lg hover:shadow-red-900/20 text-left">
                    <div className="p-3 bg-red-500/10 rounded-xl w-fit mb-4 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11" /><path d="M21 21l-1-1" /><path d="M3 3l1 1" /><path d="M18 22l4-4" /><path d="M2 6l4-4" /><path d="M3 10l7.9-7.9a2.12 2.12 0 0 1 3 3L6 13a2.12 2.12 0 0 1-3-3z" /><path d="M11 13l7.9-7.9a2.12 2.12 0 0 1 3 3L14 21a2.12 2.12 0 0 1-3-3z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">Design Workout</h3>
                    <p className="text-sm text-gray-500 mt-1">Build a strength routine.</p>
                </button>
            </div>

            {/* Modal/Form Area */}
            {action && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-gradient-to-r from-dark-800 to-black p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {action === 'ADD_CLIENT' && 'Add New Client'}
                                {action === 'CREATE_DIET' && 'Create Diet Plan'}
                                {action === 'CREATE_WORKOUT' && 'Create Workout Plan'}
                            </h3>
                            <button onClick={() => setAction(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="p-6">
                            {message && (
                                <div className={`p-4 rounded-lg mb-4 text-sm font-bold flex items-center gap-2 ${message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={submitAction} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {action === 'ADD_CLIENT' ? 'Client Email Address' : 'Select Client (Email)'}
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-black/50 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all placeholder-gray-700"
                                        placeholder="client@example.com"
                                        onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                                        required
                                    />
                                </div>

                                {(action === 'CREATE_DIET' || action === 'CREATE_WORKOUT') && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Details</label>
                                            <textarea
                                                className="w-full bg-black/50 border border-dark-600 rounded-lg px-4 py-3 text-white h-40 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all placeholder-gray-700 resize-none font-mono text-sm"
                                                placeholder={action === 'CREATE_DIET' ? "Breakfast: Oatmeal...\nLunch: Chicken Breast..." : "Day 1: Chest & Triceps\n- Bench Press: 3x12..."}
                                                onChange={e => setFormData({ ...formData, details: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Valid Until</label>
                                            <input
                                                type="date"
                                                className="w-full bg-black/50 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                                                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-lg shadow-lg transform transition-all active:scale-95">
                                        {loading ? 'Processing...' : 'Confirm Action'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerDashboard;
