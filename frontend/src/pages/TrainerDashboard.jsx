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
        // Fetch stats (mock or real)
        // For now, let's mock or use real if endpoints available
        // Real: api.get('/users/clients') ...
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
                setMessage('Plan created successfully!');
            } else if (action === 'ADD_CLIENT') {
                await api.put('/users/assign', {
                    clientEmail: formData.clientEmail,
                    trainerId: user._id || user.id
                }, config);
                setMessage('Client assigned successfully!');
            }
            setAction(null);
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Trainer Dashboard</h2>

            {message && <div className="bg-blue-500/20 text-blue-300 p-3 rounded">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-dark-800 p-6 rounded shadow border border-dark-700">
                    <h3 className="text-lg font-bold text-white">My Clients</h3>
                    <p className="text-3xl font-bold text-secondary mt-2">{stats.clients}</p>
                </div>
                <div className="bg-dark-800 p-6 rounded shadow border border-dark-700">
                    <h3 className="text-lg font-bold text-white">Active Plans</h3>
                    <p className="text-3xl font-bold text-secondary mt-2">{stats.activePlans}</p>
                </div>
            </div>

            <div className="bg-dark-800 p-6 rounded shadow border border-dark-700 mt-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="flex gap-4 flex-wrap">
                    <button onClick={() => handleAction('ADD_CLIENT')} className="bg-primary text-dark-900 px-4 py-2 rounded font-bold hover:bg-yellow-500">Add Client</button>
                    <button onClick={() => handleAction('CREATE_DIET')} className="bg-secondary text-white px-4 py-2 rounded font-bold hover:bg-blue-600">Create Diet Plan</button>
                    <button onClick={() => handleAction('CREATE_WORKOUT')} className="bg-secondary text-white px-4 py-2 rounded font-bold hover:bg-blue-600">Create Workout Plan</button>
                </div>
            </div>

            {action && (
                <div className="bg-dark-800 p-6 rounded shadow border border-dark-700 mt-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                        {action === 'ADD_CLIENT' && 'Add Client'}
                        {action === 'CREATE_DIET' && 'Create Diet Plan'}
                        {action === 'CREATE_WORKOUT' && 'Create Workout Plan'}
                    </h3>
                    <form onSubmit={submitAction} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-gray-400 mb-1">Client Email</label>
                            <input
                                type="email"
                                className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white"
                                onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                                required
                            />
                        </div>

                        {(action === 'CREATE_DIET' || action === 'CREATE_WORKOUT') && (
                            <>
                                <div>
                                    <label className="block text-gray-400 mb-1">Plan Details (JSON/Text)</label>
                                    <textarea
                                        className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white h-32"
                                        onChange={e => setFormData({ ...formData, details: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1">Valid Until</label>
                                    <input
                                        type="date"
                                        className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white"
                                        onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex gap-2">
                            <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-500">
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" onClick={() => setAction(null)} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-500">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TrainerDashboard;
