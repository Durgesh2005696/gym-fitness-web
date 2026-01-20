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
        <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-5 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-white">Hello, {user?.name.split(' ')[0]}</h2>
                    <p className="text-gray-400 text-sm">Let's crush today's goals.</p>
                </div>
                <div className="bg-dark-800/80 backdrop-blur border border-white/10 px-4 py-2 rounded-xl text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Today</p>
                    <p className="text-lg font-bold text-white leading-none">{new Date().getDate()}</p>
                </div>
            </div>

            {/* Hydration Card */}
            <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 backdrop-blur-xl border border-blue-500/30 p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-blue-900/20">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-blue-100">Hydration</h3>
                        <p className="text-blue-300/60 text-xs">Daily Goal: 3.0 Liters</p>
                    </div>
                    <div className="text-3xl font-black text-blue-400">{water.toFixed(1)}<span className="text-sm font-medium text-blue-500/60">L</span></div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-black/40 h-6 rounded-full overflow-hidden mb-6 relative border border-blue-500/20">
                    {/* Striped Animation */}
                    <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide-slow_1s_linear_infinite] opacity-30 z-20"></div>
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-1000 ease-out relative z-10" style={{ width: `${Math.min((water / 3) * 100, 100)}%` }}></div>
                </div>

                <div className="grid grid-cols-3 gap-3 relative z-10">
                    <button onClick={() => addWater(0.25)} className="py-3 bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 rounded-xl text-blue-300 font-bold transition-all active:scale-95 flex flex-col items-center justify-center gap-1">
                        <span className="text-xl">💧</span>
                        <span className="text-xs">250ml</span>
                    </button>
                    <button onClick={() => addWater(0.5)} className="py-3 bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 rounded-xl text-blue-300 font-bold transition-all active:scale-95 flex flex-col items-center justify-center gap-1">
                        <span className="text-xl">🥤</span>
                        <span className="text-xs">500ml</span>
                    </button>
                    <button onClick={() => addWater(1.0)} className="py-3 bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 rounded-xl text-blue-300 font-bold transition-all active:scale-95 flex flex-col items-center justify-center gap-1">
                        <span className="text-xl">🧴</span>
                        <span className="text-xs">1L</span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Diet Card */}
                <div className="bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-green-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2.95 1.51l.65-.24a6 6 0 0 0 3.73-4.47l.5-3.05a8 8 0 0 0-4.36-8.98l-.7-.28a2 2 0 0 0-1.7.13L2.4 13.9a2 2 0 0 0 .54 3.7l6.63 2.1c.54.16.82.74.65 1.28l-.34 1.15a2 2 0 0 0 .88 2.27Z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Diet Plan</h3>
                    </div>
                    {dietPlan ? (
                        <div className="bg-black/30 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{dietPlan.data}</pre>
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-700 rounded-xl">
                            <span className="text-4xl mb-2 grayscale opacity-50">🥗</span>
                            <p className="text-gray-500 text-sm">No diet plan assigned.</p>
                            <p className="text-xs text-gray-600 mt-1">Contact your trainer.</p>
                        </div>
                    )}
                </div>

                {/* Workout Card */}
                <div className="bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-red-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11" /><path d="M21 21l-1-1" /><path d="M3 3l1 1" /><path d="M18 22l4-4" /><path d="M2 6l4-4" /><path d="M3 10l7.9-7.9a2.12 2.12 0 0 1 3 3L6 13a2.12 2.12 0 0 1-3-3z" /><path d="M11 13l7.9-7.9a2.12 2.12 0 0 1 3 3L14 21a2.12 2.12 0 0 1-3-3z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Workout Plan</h3>
                    </div>
                    {workoutPlan ? (
                        <div className="bg-black/30 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{workoutPlan.data}</pre>
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-700 rounded-xl">
                            <span className="text-4xl mb-2 grayscale opacity-50">💪</span>
                            <p className="text-gray-500 text-sm">No workout plan assigned.</p>
                            <p className="text-xs text-gray-600 mt-1">Time to rest?</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Log */}
            <div className="bg-dark-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📝</span> Daily Check-in
                </h3>
                {message && <div className="text-green-400 mb-2 text-sm font-bold bg-green-500/10 p-2 rounded">{message}</div>}
                <form onSubmit={submitReview}>
                    <div className="relative">
                        <textarea
                            className="w-full bg-black/50 border border-dark-600 rounded-xl p-4 text-white text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder-gray-600 min-h-[100px]"
                            placeholder="How was your workout? How is your energy level?"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            required
                        />
                        <button type="submit" className="absolute bottom-3 right-3 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            Send Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientDashboard;
