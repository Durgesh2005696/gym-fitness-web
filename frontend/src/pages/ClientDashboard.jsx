import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const ClientDashboard = () => {
    const { user, token } = useAuthStore();
    const [water, setWater] = useState(0);
    const [plans, setPlans] = useState([]);
    const [review, setReview] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            fetchPlans();
            fetchTodayLogs();
        }
    }, [user]);

    const fetchPlans = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.get(`/plans/client/${user._id || user.id}`, config);
            setPlans(res.data);
        } catch (error) {
            console.error('Error fetching plans', error);
        }
    };

    const fetchTodayLogs = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.get(`/logs?type=WATER`, config);
            const today = new Date().toISOString().split('T')[0];
            const todayLogs = res.data.filter(l => l.date && l.date.toString().startsWith(today));
            const totalWater = todayLogs.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
            setWater(totalWater);
        } catch (error) {
            console.error('Error fetching logs', error);
        }
    };

    const addWater = async (amount) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/logs', { type: 'WATER', value: amount.toString() }, config);
            setWater(prev => prev + amount);
        } catch (error) {
            console.error('Error logging water', error);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/logs', { type: 'REVIEW', value: review }, config);
            setMessage('Review submitted!');
            setReview('');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to submit review');
        }
    };

    const dietPlan = plans.find(p => p.type === 'DIET');
    const workoutPlan = plans.find(p => p.type === 'WORKOUT');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">Welcome Back, {user?.name}!</h2>
                <div className="text-gray-400 font-medium border border-dark-700 bg-dark-800 px-4 py-2 rounded">
                    Date: <span className="text-white">{new Date().toLocaleDateString('en-GB')}</span>
                </div>
            </div>

            {/* Water Tracker */}
            <div className="bg-dark-800 border border-blue-500/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-400 mb-2">Water Intake</h3>
                <div className="w-full bg-dark-700 h-4 rounded-full overflow-hidden mb-4">
                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min((water / 3) * 100, 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-blue-300 mb-4">
                    <span>{water.toFixed(1)} / 3.0 Liters</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => addWater(0.25)} className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 text-white text-sm">+ 250ml</button>
                    <button onClick={() => addWater(0.5)} className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 text-white text-sm">+ 500ml</button>
                    <button onClick={() => addWater(1.0)} className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 text-white text-sm">+ 1L</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Diet Plan */}
                <div className="bg-dark-800 p-6 rounded shadow border border-dark-700">
                    <h3 className="text-xl font-bold text-white mb-2">Current Diet Plan</h3>
                    {dietPlan ? (
                        <div className="text-gray-300 whitespace-pre-wrap">{dietPlan.data}</div>
                    ) : (
                        <p className="text-gray-500 italic">No diet plan assigned yet.</p>
                    )}
                </div>

                {/* Workout Plan */}
                <div className="bg-dark-800 p-6 rounded shadow border border-dark-700">
                    <h3 className="text-xl font-bold text-white mb-2">Current Workout Plan</h3>
                    {workoutPlan ? (
                        <div className="text-gray-300 whitespace-pre-wrap">{workoutPlan.data}</div>
                    ) : (
                        <p className="text-gray-500 italic">No workout plan assigned yet.</p>
                    )}
                </div>
            </div>

            {/* Daily Review */}
            <div className="bg-dark-800 p-6 rounded shadow border border-dark-700">
                <h3 className="text-xl font-bold text-white mb-2">Daily Check-in</h3>
                {message && <div className="text-green-400 mb-2">{message}</div>}
                <form onSubmit={submitReview}>
                    <textarea
                        className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white mb-2"
                        placeholder="How are you feeling today? Any struggles?"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-primary text-dark-900 px-4 py-2 rounded font-bold hover:bg-yellow-500">Submit Review</button>
                </form>
            </div>
        </div>
    );
};

export default ClientDashboard;
