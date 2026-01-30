import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { TrendingUp, Droplets, Dumbbell, Camera, MessageSquare, Calendar, Award, Target, CheckCircle2, Circle, Utensils } from 'lucide-react';

const ClientDashboard = () => {
    const { user, token } = useAuthStore();
    const [water, setWater] = useState(0);
    const [plans, setPlans] = useState([]);
    const [review, setReview] = useState('');
    const [message, setMessage] = useState('');

    // Enhanced features state
    const [workoutStreak, setWorkoutStreak] = useState(7);
    const [hydrationStreak, setHydrationStreak] = useState(12);
    const [currentWeight, setCurrentWeight] = useState(0);
    const [startWeight, setStartWeight] = useState(0);
    const [targetWeight, setTargetWeight] = useState(0);
    const [fatPercentage, setFatPercentage] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [workoutCompleted, setWorkoutCompleted] = useState(false);
    const [dietChecklist, setDietChecklist] = useState([
        { id: 1, meal: 'Breakfast', completed: false },
        { id: 2, meal: 'Mid-Morning Snack', completed: false },
        { id: 3, meal: 'Lunch', completed: false },
        { id: 4, meal: 'Evening Snack', completed: false },
        { id: 5, meal: 'Dinner', completed: false },
    ]);
    const [feedbackSliders, setFeedbackSliders] = useState({
        energy: 7,
        soreness: 3,
        motivation: 8,
        sleep: 6
    });

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
            // Using the new unified endpoint to get today's data
            const res = await api.get(`/coaching/client/${user._id || user.id}`, config);

            // Sync Body Stats
            const profile = res.data.profile;
            if (profile) {
                setCurrentWeight(profile.currentWeight || 0);
                setStartWeight(profile.pastWeight || profile.currentWeight || 0);
                setTargetWeight(profile.targetWeight || 0);
                setFatPercentage(profile.bodyFat || 0);
                setLastUpdated(profile.lastBodyStatsUpdate);
            }

            // Find today's activity
            const today = new Date().toISOString().split('T')[0];
            const activities = res.data.activities || [];
            const todayActivity = activities.find(a => a.date && a.date.startsWith(today));

            if (todayActivity) {
                setWater(todayActivity.waterIntake || 0);
                setWorkoutCompleted(todayActivity.workoutCompleted || false);
                setDietChecklist(prev => prev.map(m => ({ ...m, completed: (todayActivity.mealsCompleted || 0) >= m.id }))); // Simple logic for meals
            }
        } catch (error) {
            console.error('Error fetching logs', error);
        }
    };

    const addWater = async (amount) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const newAmount = water + amount;
            await api.post('/coaching/activity', { waterIntake: newAmount }, config);
            setWater(newAmount);
            if (newAmount >= 3) {
                setHydrationStreak(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error logging water', error);
        }
    };

    const toggleMeal = async (id) => {
        // Optimistic update
        const updatedList = dietChecklist.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        );
        setDietChecklist(updatedList);

        // Count completed
        const completedCount = updatedList.filter(m => m.completed).length;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/coaching/activity', { mealsCompleted: completedCount }, config);
        } catch (error) {
            console.error('Error logging meals', error);
        }
    };

    const completeWorkout = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/coaching/activity', { workoutCompleted: true }, config);

            setWorkoutCompleted(true);
            setWorkoutStreak(prev => prev + 1);
            setMessage('Workout logged! 🔥 Keep crushing it!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error logging workout', error);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side validations
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (!ALLOWED_TYPES.includes(file.type)) {
            setMessage('❌ Please upload an image file (JPEG, PNG, WebP, or GIF)');
            setTimeout(() => setMessage(''), 4000);
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setMessage(`❌ File too large! Max size is 5MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
            setTimeout(() => setMessage(''), 4000);
            return;
        }

        // Show uploading state
        setMessage('📤 Uploading photo...');

        try {
            // Use FormData for proper multipart upload
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('photoType', 'FRONT');

            const response = await api.post('/coaching/photos', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('✅ Progress photo uploaded! 📸');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Upload failed:', error);

            // Handle specific error codes
            if (error.response?.status === 413) {
                setMessage('❌ File too large for server. Please compress the image.');
            } else if (error.response?.status === 400) {
                setMessage('❌ Invalid file. Please upload a valid image.');
            } else {
                setMessage('❌ Upload failed. Please try again.');
            }
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const feedbackData = {
                energyLevel: feedbackSliders.energy,
                sleepQuality: feedbackSliders.sleep,
                motivation: feedbackSliders.motivation,
                soreness: feedbackSliders.soreness,
                notes: review
            };
            await api.post('/coaching/feedback', feedbackData, config);
            setMessage('Feedback submitted! Your coach will review it. 💪');
            setReview('');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to submit feedback');
        }
    };

    const weightProgress = (startWeight && targetWeight && startWeight !== targetWeight)
        ? ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100
        : 0;
    const dietPlan = plans.find(p => p.type === 'DIET');
    const workoutPlan = plans.find(p => p.type === 'WORKOUT');
    const completedMeals = dietChecklist.filter(m => m.completed).length;

    // Compute subscription status
    const getSubscriptionStatus = () => {
        if (!user?.subscriptionExpiresAt) {
            return { status: 'EXPIRED', daysRemaining: 0, expiryDate: null };
        }
        const expiry = new Date(user.subscriptionExpiresAt);
        const now = new Date();
        const diffTime = expiry - now;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) {
            return { status: 'EXPIRED', daysRemaining: 0, expiryDate: expiry };
        } else if (daysRemaining <= 5) {
            return { status: 'EXPIRING_SOON', daysRemaining, expiryDate: expiry };
        }
        return { status: 'ACTIVE', daysRemaining, expiryDate: expiry };
    };

    const subscription = getSubscriptionStatus();
    const isMembershipActive = subscription.status !== 'EXPIRED';

    // Get client activation status
    const activationStatus = user?.profile?.activationStatus || 'REGISTERED';
    const hasTrainer = !!user?.profile?.trainerId;
    const trainerName = user?.profile?.trainer?.name;

    // If client is REGISTERED (no trainer), show limited welcome dashboard
    if (activationStatus === 'REGISTERED' && !hasTrainer) {
        return (
            <div className="space-y-8 pb-20 animate-reveal-up">
                {/* Welcome Header */}
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-900/40">
                        <span className="text-4xl font-black text-white">FD</span>
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                        Welcome, {user?.name?.split(' ')[0]}!
                    </h2>
                    <p className="text-gray-400 text-lg max-w-md mx-auto">
                        Your fitness journey begins here. A trainer will add you to their roster soon.
                    </p>
                </div>

                {/* Status Card */}
                <div className="glass-card p-8 rounded-[2rem] border-2 border-yellow-500/30 bg-yellow-500/5 max-w-2xl mx-auto">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Awaiting Trainer Assignment</h3>
                            <p className="text-gray-400 text-sm">Share your email with a trainer to get started</p>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-6 mb-6">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your Email</p>
                        <p className="text-xl font-mono text-white">{user?.email}</p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-400">
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-xs font-bold text-yellow-500">1</span>
                            <span>Share your email with your trainer</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">2</span>
                            <span>They will add you to their roster</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">3</span>
                            <span>Complete payment to activate coaching</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">4</span>
                            <span>Fill your questionnaire and get started!</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-reveal-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        Welcome, {user?.name.split(' ')[0]}
                    </h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Your Transformation Journey
                    </p>
                </div>

                {/* Streak Cards */}
                <div className="flex gap-4">
                    <div className="glass-morphism px-6 py-4 rounded-2xl text-center border-red-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Dumbbell className="w-4 h-4 text-red-500" />
                            <p className="text-[10px] text-red-500 uppercase tracking-widest font-black">Workout</p>
                        </div>
                        <p className="text-3xl font-black text-white">{workoutStreak}</p>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Day Streak</p>
                    </div>

                    <div className="glass-morphism px-6 py-4 rounded-2xl text-center border-blue-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <p className="text-[10px] text-blue-500 uppercase tracking-widest font-black">Hydration</p>
                        </div>
                        <p className="text-3xl font-black text-white">{hydrationStreak}</p>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Day Streak</p>
                    </div>
                </div>
            </div>

            {/* Membership Status Card */}
            <div className={`glass-card p-8 rounded-[2rem] border-2 ${subscription.status === 'EXPIRED'
                ? 'border-red-500/30 bg-red-500/5'
                : subscription.status === 'EXPIRING_SOON'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-green-500/30 bg-green-500/5'
                }`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${subscription.status === 'EXPIRED'
                            ? 'bg-red-600/20 text-red-500'
                            : subscription.status === 'EXPIRING_SOON'
                                ? 'bg-yellow-600/20 text-yellow-500'
                                : 'bg-green-600/20 text-green-500'
                            }`}>
                            <Award className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Your Membership Status</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">Client Coaching Subscription • ₹6,000/month</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</p>
                                <p className={`text-lg font-black uppercase ${subscription.status === 'EXPIRED' ? 'text-red-500'
                                    : subscription.status === 'EXPIRING_SOON' ? 'text-yellow-500'
                                        : 'text-green-500'
                                    }`}>
                                    {subscription.status === 'EXPIRED' ? 'Expired' : subscription.status === 'EXPIRING_SOON' ? 'Expiring' : 'Active'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expires On</p>
                                <p className="text-lg font-black text-white">
                                    {subscription.expiryDate ? subscription.expiryDate.toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Days Left</p>
                                <p className={`text-lg font-black ${subscription.daysRemaining <= 0 ? 'text-red-500'
                                    : subscription.daysRemaining <= 5 ? 'text-yellow-500'
                                        : 'text-green-500'
                                    }`}>
                                    {subscription.daysRemaining > 0 ? subscription.daysRemaining : 0}
                                </p>
                            </div>
                        </div>
                        {subscription.status === 'EXPIRED' && (
                            <button
                                onClick={() => window.location.href = '/renew'}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-red-900/30"
                            >
                                Renew Now
                            </button>
                        )}
                    </div>
                </div>
                {subscription.status === 'EXPIRED' && (
                    <div className="mt-6 p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-bold">⚠️ Your membership has expired. Renew to continue accessing your plans and logging progress.</p>
                    </div>
                )}
            </div>

            {/* ============================================ */}
            {/* MAIN COACHING CONTENT - DIET & WORKOUT PLANS */}
            {/* ============================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* DIET PLAN - PRIMARY CARD */}
                <div className="glass-card p-10 rounded-[3rem] group hover:border-green-500/30 min-h-[600px]">
                    <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                        <div className="w-16 h-16 bg-green-600/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all duration-500 shadow-xl">
                            <Utensils className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">Diet Plan</h3>
                            <p className="text-green-500 font-bold uppercase tracking-widest text-[10px] mt-1">Your Nutrition Blueprint</p>
                        </div>
                    </div>

                    {dietPlan ? (() => {
                        try {
                            const parsed = JSON.parse(dietPlan.data);

                            // Check for Manual Macros or Hybrid/FoodItems
                            const macros = parsed.macros;
                            const items = parsed.foodItems || (parsed.meals ? parsed.meals.flatMap(m => m.foods) : []);
                            const notes = parsed.dietNotes || '';

                            let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
                            let hasContent = false;

                            if (macros) {
                                totals = {
                                    calories: Number(macros.calories) || 0,
                                    protein: Number(macros.protein) || 0,
                                    carbs: Number(macros.carbs) || 0,
                                    fats: Number(macros.fats) || 0
                                };
                                hasContent = true;
                            } else if (items.length > 0) {
                                totals = items.reduce((acc, f) => ({
                                    calories: acc.calories + (f.calories || 0),
                                    protein: acc.protein + (f.protein || 0),
                                    carbs: acc.carbs + (f.carbs || 0),
                                    fats: acc.fats + (f.fat || 0)
                                }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
                                hasContent = true;
                            } else if (notes) {
                                hasContent = true;
                            }

                            if (hasContent) {
                                return (
                                    <div className="bg-black/40 rounded-3xl p-6 h-[450px] overflow-y-auto custom-scrollbar border border-white/5 space-y-6 group-hover:border-green-500/20 transition-colors">
                                        {/* Totals Header */}
                                        <div className="grid grid-cols-4 gap-2 bg-gradient-to-r from-green-900/10 to-transparent rounded-2xl p-4 border border-green-500/10">
                                            <div className="text-center">
                                                <p className="text-[9px] text-green-500 font-black uppercase tracking-wider">Calories</p>
                                                <p className="text-xl font-black text-white">{Math.round(totals.calories)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] text-green-500 font-black uppercase tracking-wider">Protein</p>
                                                <p className="text-xl font-black text-white">{Math.round(totals.protein)}g</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] text-green-500 font-black uppercase tracking-wider">Carbs</p>
                                                <p className="text-xl font-black text-white">{Math.round(totals.carbs)}g</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] text-green-500 font-black uppercase tracking-wider">Fats</p>
                                                <p className="text-xl font-black text-white">{Math.round(totals.fats)}g</p>
                                            </div>
                                        </div>

                                        {/* Food List (Only for Hybrid/Old plans) */}
                                        {items.length > 0 && !macros && (
                                            <div className="space-y-2">
                                                {items.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="text-white text-sm font-bold">{item.foodName}</h4>
                                                                <span className="text-[10px] text-green-400 bg-green-900/20 px-2 py-0.5 rounded-lg font-bold tracking-wide">{item.quantity}g</span>
                                                            </div>
                                                            <div className="flex gap-3 text-[10px] text-gray-500 font-mono mt-1">
                                                                <span className="text-gray-300 font-bold">{item.calories} kcal</span>
                                                                <span>P:{item.protein} C:{item.carbs} F:{item.fat}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Notes Section */}
                                        {notes && (
                                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500/50"></div>
                                                <h4 className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-green-500"></span> Trainer Instructions
                                                </h4>
                                                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-medium font-mono">{notes}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        } catch (e) {
                            // Fallback
                        }

                        // Fallback / Plain Text Render
                        return (
                            <div className="bg-black/40 rounded-3xl p-8 h-[450px] overflow-y-auto custom-scrollbar border border-white/5 group-hover:border-green-500/20 transition-colors">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed selection:bg-green-500/30">
                                    {dietPlan.data}
                                </pre>
                            </div>
                        );
                    })() : (
                        <div className="h-[450px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-3xl">
                            <span className="text-7xl mb-6 opacity-20">🥗</span>
                            <p className="text-lg font-black uppercase text-gray-500 tracking-tight mb-2">No Diet Plan Assigned</p>
                            <p className="text-xs text-gray-600 font-medium">Your trainer will create a personalized meal plan for you soon.</p>
                        </div>
                    )}
                </div>

                {/* WORKOUT PLAN - PRIMARY CARD */}
                <div className="glass-card p-10 rounded-[3rem] group hover:border-red-600/30 min-h-[600px]">
                    <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                        <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-xl">
                            <Dumbbell className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">Workout Plan</h3>
                            <p className="text-red-500 font-bold uppercase tracking-widest text-[10px] mt-1">Your Training Protocol</p>
                        </div>
                    </div>

                    {workoutPlan ? (
                        <div className="bg-black/40 rounded-3xl p-8 h-[450px] overflow-y-auto custom-scrollbar border border-white/5 group-hover:border-red-600/20 transition-colors">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed selection:bg-red-500/30">
                                {(() => {
                                    try {
                                        const parsed = JSON.parse(workoutPlan.data);
                                        if (Array.isArray(parsed)) {
                                            return parsed.map(day => {
                                                const exercises = day.exercises.map((ex, i) => {
                                                    return `${i + 1}. ${ex.name.toUpperCase()}\n   ${ex.sets} sets × ${ex.reps}\n   Rest: ${ex.rest}${ex.notes ? `\n   Note: ${ex.notes}` : ''}`;
                                                }).join('\n\n');
                                                const header = `${day.name.toUpperCase()}`;
                                                const line = '-'.repeat(header.length);
                                                return `${header}\n${line}\n${exercises}`;
                                            }).join('\n\n\n');
                                        }
                                        return workoutPlan.data;
                                    } catch (e) {
                                        return workoutPlan.data;
                                    }
                                })()}
                            </pre>
                        </div>
                    ) : (
                        <div className="h-[450px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-3xl">
                            <span className="text-7xl mb-6 opacity-20">💪</span>
                            <p className="text-lg font-black uppercase text-gray-500 tracking-tight mb-2">No Workout Plan Assigned</p>
                            <p className="text-xs text-gray-600 font-medium">Your trainer will design a custom training program for you soon.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ============================================ */}
            {/* SUPPORT TOOLS - BELOW MAIN CONTENT */}
            {/* ============================================ */}

            {/* Transformation Progress Tracker */}
            <div className="glass-morphism p-8 rounded-[2.5rem] border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-red-500" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Transformation Progress</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Current Weight</p>
                        <p className="text-4xl font-black text-white">{currentWeight}<span className="text-lg text-gray-500">kg</span></p>
                    </div>
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Target Weight</p>
                        <p className="text-4xl font-black text-red-500">{targetWeight}<span className="text-lg text-gray-500">kg</span></p>
                    </div>
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Body Fat %</p>
                        <p className="text-4xl font-black text-yellow-500">{fatPercentage}<span className="text-lg text-gray-500">%</span></p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Progress</span>
                        <span>{Math.round(Math.max(0, Math.min(100, weightProgress)))}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-8 rounded-full overflow-hidden relative border border-white/5">
                        <div
                            className="bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 h-full transition-all duration-1000 relative"
                            style={{ width: `${Math.max(0, Math.min(100, weightProgress))}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        Last Updated: <span className="text-white">{lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A'}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        Start: <span className="text-white">{startWeight}kg</span>
                    </p>
                </div>
            </div>

            {/* Hydration Tracker */}
            <div className="glass-morphism p-8 rounded-[2.5rem] border-blue-500/20 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full bg-blue-600/10 transition-all duration-1000"
                    style={{ height: `${Math.min((water / 3) * 100, 100)}%` }}>
                    <div className="absolute top-0 left-0 w-full h-4 bg-blue-400/20 blur-xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <Droplets className="w-6 h-6 text-blue-500" />
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Hydration Tracker</h3>
                                <p className="text-blue-400 font-black uppercase tracking-widest text-[10px]">Goal: 3.0L / Day</p>
                            </div>
                        </div>
                        <div className="text-5xl font-black text-blue-500">
                            {water.toFixed(1)}<span className="text-sm opacity-50">L</span>
                        </div>
                    </div>

                    <div className="w-full bg-white/5 h-6 rounded-full overflow-hidden mb-6 border border-white/5">
                        <div className="bg-gradient-to-r from-blue-700 to-cyan-400 h-full transition-all duration-1000"
                            style={{ width: `${Math.min((water / 3) * 100, 100)}%` }}>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: '250ml', val: 0.25, icon: '💧' },
                            { label: '500ml', val: 0.5, icon: '🥤' },
                            { label: '1.0L', val: 1.0, icon: '🧴' }
                        ].map((btn, i) => (
                            <button
                                key={i}
                                onClick={() => addWater(btn.val)}
                                className="py-4 bg-white/5 hover:bg-blue-600 border border-white/5 hover:border-blue-400 rounded-xl transition-all active:scale-95 flex flex-col items-center gap-2"
                            >
                                <span className="text-2xl">{btn.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Diet Checklist & Workout Completion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-morphism p-8 rounded-[2.5rem] border-green-500/20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Target className="w-6 h-6 text-green-500" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Today's Meals</h3>
                        </div>
                        <span className="text-sm font-black text-green-500">{completedMeals}/{dietChecklist.length}</span>
                    </div>

                    <div className="space-y-3">
                        {dietChecklist.map(item => (
                            <button
                                key={item.id}
                                onClick={() => toggleMeal(item.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${item.completed
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-black/20 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                {item.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-500" />
                                )}
                                <span className={`text-sm font-bold uppercase tracking-tight ${item.completed ? 'text-green-500 line-through' : 'text-white'
                                    }`}>
                                    {item.meal}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-morphism p-8 rounded-[2.5rem] border-red-500/20">
                    <div className="flex items-center gap-3 mb-6">
                        <Dumbbell className="w-6 h-6 text-red-500" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Today's Workout</h3>
                    </div>

                    {workoutCompleted ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <p className="text-lg font-black text-green-500 uppercase tracking-tight mb-2">Workout Complete!</p>
                            <p className="text-xs text-gray-400 font-bold">Great job crushing it today! 💪</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-4">
                                <p className="text-sm text-gray-400 font-medium mb-2">Today's Focus:</p>
                                <p className="text-lg font-black text-white uppercase">
                                    {workoutPlan ? 'Follow Your Plan' : 'No workout assigned'}
                                </p>
                            </div>
                            <button
                                onClick={completeWorkout}
                                className="w-full py-6 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-xl shadow-red-900/40"
                            >
                                Mark as Complete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Photo Check-in & Subscription */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-morphism p-8 rounded-[2.5rem] border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <Camera className="w-6 h-6 text-purple-500" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Weekly Photo Check-in</h3>
                    </div>

                    <label className="group cursor-pointer block">
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-purple-500/50 transition-all bg-black/20">
                            <Camera className="w-12 h-12 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-bold text-gray-400 mb-2">Upload Progress Photo</p>
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Front, Side, Back</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                </div>
            </div>

            {/* Coach Message */}
            <div className="glass-morphism p-8 rounded-[2.5rem] border-yellow-500/20 bg-gradient-to-br from-yellow-900/10 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Message from Coach</h3>
                </div>
                <div className="bg-black/40 p-6 rounded-2xl border border-yellow-500/20">
                    <p className="text-sm text-gray-300 font-medium leading-relaxed mb-4">
                        "Great progress this week! Your consistency is paying off. Keep pushing hard on the compound movements and don't skip your protein targets. You're on track for an amazing transformation!"
                    </p>
                    <p className="text-xs font-black text-yellow-500 uppercase tracking-widest">- Coach</p>
                </div>
            </div>

            {/* Daily Feedback Form */}
            <div className="glass-morphism p-8 rounded-[2.5rem] border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-6 h-6 text-purple-500" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Daily Feedback</h3>
                </div>

                {message && (
                    <div className="bg-green-600/10 border border-green-500/20 text-green-500 p-4 rounded-2xl mb-6 text-xs font-black uppercase tracking-widest animate-reveal-scale">
                        {message}
                    </div>
                )}

                <form onSubmit={submitFeedback} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { key: 'energy', label: 'Energy Level', icon: '⚡', color: 'yellow' },
                            { key: 'soreness', label: 'Muscle Soreness', icon: '💪', color: 'red' },
                            { key: 'motivation', label: 'Motivation', icon: '🔥', color: 'orange' },
                            { key: 'sleep', label: 'Sleep Quality', icon: '😴', color: 'blue' }
                        ].map(slider => (
                            <div key={slider.key} className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{slider.icon}</span>
                                        <span className="text-sm font-bold text-white uppercase tracking-tight">{slider.label}</span>
                                    </div>
                                    <span className="text-2xl font-black text-white">{feedbackSliders[slider.key]}/10</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={feedbackSliders[slider.key]}
                                    onChange={(e) => setFeedbackSliders(prev => ({ ...prev, [slider.key]: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="relative">
                        <textarea
                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-white text-sm font-medium focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/50 transition-all placeholder-gray-700 min-h-[120px] resize-none"
                            placeholder="How was your day? Any challenges or wins?"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="absolute bottom-4 right-4 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-90"
                        >
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientDashboard;
