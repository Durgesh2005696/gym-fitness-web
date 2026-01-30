
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, User, Calendar, CreditCard, ChevronRight, BarChart2, Activity, MessageSquare, Camera, Check, X, LogOut, Upload, QrCode, BookOpen, Trash2, Dumbbell, Pill } from 'lucide-react';
import WorkoutLibrary from '../components/WorkoutLibrary';
import SupplementLibrary from '../components/SupplementLibrary';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import FoodLibrary from '../components/FoodLibrary';
import DietPlanBuilder from '../components/DietPlanBuilder';
import WorkoutPlanBuilder from '../components/WorkoutPlanBuilder';

const TrainerDashboard = () => {
    const { user, token, refreshUser } = useAuthStore();
    const [clients, setClients] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [stats, setStats] = useState({ clients: 0, activePlans: 0, pendingPayments: 0 });
    const [action, setAction] = useState(null); // 'ADD_CLIENT', 'CREATE_DIET', 'CREATE_WORKOUT', 'VIEW_CLIENT'
    const [selectedClient, setSelectedClient] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [isUploadingQR, setIsUploadingQR] = useState(false);
    const [message, setMessage] = useState('');
    const [clientDetails, setClientDetails] = useState(null);
    const [removeClientModal, setRemoveClientModal] = useState({ show: false, client: null });
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [showExercisePicker, setShowExercisePicker] = useState(false);

    const handleExercisePick = (ex) => {
        const textToInsert = `\n${ex.name} (${ex.muscleGroup})\n${ex.setsDefault} sets x ${ex.repsDefault} reps\nRest: 60s\n`;
        setFormData(prev => ({ ...prev, details: (prev.details ? prev.details + '\n' : '') + textToInsert }));
        setShowExercisePicker(false);
    };

    const fetchClients = async () => {
        try {
            const response = await api.get('/users/clients', {
                headers: { Authorization: `Bearer ${token} ` }
            });
            // Filter clients assigned to this trainer
            const myClients = response.data.filter(c => c.clientProfile?.trainerId === (user._id || user.id));

            // Adapter: Component expects { user: ... } structure, but API returns User objects directly.
            // We map the users to wrap themselves to satisfy legacy property access like client.user.name
            const mappedClients = myClients.map(u => ({ ...u, user: u, userId: u.id }));

            // Calculate active plans count
            const activePlansCount = mappedClients.reduce((count, client) => {
                const plans = client.clientProfile?.plans || [];
                return count + plans.length;
            }, 0);

            setClients(mappedClients);
            setStats({
                clients: mappedClients.length,
                activePlans: activePlansCount
            });
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchPendingPayments = async () => {
        try {
            const response = await api.get('/payments/pending/clients', {
                headers: { Authorization: `Bearer ${token} ` }
            });
            setPendingPayments(response.data);
            setStats(prev => ({ ...prev, pendingPayments: response.data.length }));
        } catch (error) {
            console.error('Error fetching pending payments:', error);
        }
    };

    const handleApprovePayment = async (paymentId) => {
        try {
            await api.put(`/ payments / ${paymentId}/approve-client`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Client payment approved! They now have full access.');
            fetchPendingPayments();
            fetchClients();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRejectPayment = async (paymentId) => {
        if (!confirm('Are you sure you want to reject this payment?')) return;
        try {
            await api.put(`/payments/${paymentId}/reject-client`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Payment rejected. Client can resubmit.');
            fetchPendingPayments();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleQrUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
        if (!ALLOWED_TYPES.includes(file.type)) {
            setMessage('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
            return;
        }

        setIsUploadingQR(true);
        setMessage('Uploading QR Code...');

        try {
            const formData = new FormData();
            formData.append('qrCode', file);

            const res = await api.put('/auth/update-qr', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('QR Code updated successfully! 📸');
            await refreshUser();
        } catch (error) {
            console.error('QR Upload Error:', error);
            setMessage('Failed to upload QR code: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsUploadingQR(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchPendingPayments();
        const interval = setInterval(() => {
            fetchClients();
            fetchPendingPayments();
        }, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Poll for details when a client is selected
    useEffect(() => {
        let interval;
        if (action === 'VIEW_CLIENT' && selectedClient) {
            const clientId = selectedClient.userId || selectedClient.user.id;
            interval = setInterval(() => {
                fetchClientDetails(clientId);
            }, 10000); // Poll details every 10s for "real-time" feel
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [action, selectedClient]);

    const fetchClientDetails = async (clientId) => {
        try {
            const response = await api.get(`/coaching/client/${clientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClientDetails(response.data);
        } catch (error) {
            console.error('Error fetching client details:', error);
            setMessage('Error fetching client details');
        }
    };

    const handleRemoveClient = async () => {
        if (!removeClientModal.client) return;
        try {
            await api.put(`/coaching/remove-client/${removeClientModal.client.userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Client removed successfully');
            setRemoveClientModal({ show: false, client: null });
            fetchClients();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove client');
        }
    };

    useEffect(() => {
        if (activeTab === 'PROGRESS' && clientDetails?.profile) {
            // Fallback to latest history if profile is empty (ensures UI consistency)
            const latestHistory = clientDetails.progress && clientDetails.progress.length > 0 ? clientDetails.progress[0] : null;

            setFormData(prev => ({
                ...prev,
                pastWeight: clientDetails.profile.pastWeight ?? '',
                currentWeight: clientDetails.profile.currentWeight ?? latestHistory?.weight ?? '',
                targetWeight: clientDetails.profile.targetWeight ?? '',
                bodyFat: clientDetails.profile.bodyFat ?? latestHistory?.bodyFat ?? ''
            }));
        }
    }, [activeTab, clientDetails]);

    const handleAction = async (type, client = null) => {
        setAction(type);
        setSelectedClient(client);
        setMessage('');
        setClientDetails(null);
        setActiveTab('OVERVIEW');

        // Reset form data immediately to prevent stale data
        const userId = client ? (client.user.id || client.userId) : null;
        const initialData = client ? { clientEmail: client.user.email, clientId: userId } : {};
        setFormData(initialData);

        if (client) {
            const clientId = client.userId || client.user.id; // User ID for endpoint

            if (type === 'VIEW_CLIENT') {
                fetchClientDetails(clientId);
            }

            if (type === 'CREATE_DIET' || type === 'CREATE_WORKOUT') {
                try {
                    const response = await api.get(`/plans/client/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const planType = type === 'CREATE_DIET' ? 'DIET' : 'WORKOUT';
                    const existingPlan = response.data.find(p => p.type === planType);

                    if (existingPlan) {
                        setFormData({
                            ...initialData,
                            details: existingPlan.data.startsWith('"') ? JSON.parse(existingPlan.data) : existingPlan.data,
                            validUntil: existingPlan.validUntil ? existingPlan.validUntil.split('T')[0] : ''
                        });
                    }
                } catch (error) {
                    console.error('Error fetching existing plan:', error);
                }
            }
        }
    };

    const closeAction = () => {
        setAction(null);
        setFormData({});
        setMessage('');
    };

    const submitBodyStats = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const clientId = selectedClient.userId || selectedClient.user.id;

            await api.put(`/coaching/client/${clientId}/body-stats`, {
                pastWeight: formData.pastWeight,
                currentWeight: formData.currentWeight,
                targetWeight: formData.targetWeight,
                bodyFat: formData.bodyFat
            }, config);

            setMessage('Body stats synced successfully');
            fetchClientDetails(clientId); // Refresh to see updates
        } catch (error) {
            console.error(error);
            setMessage('Failed to update body stats');
        }
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
                // Use the new trainer-specific endpoint
                await api.post('/coaching/add-client', {
                    clientEmail: formData.clientEmail
                }, config);
                setMessage('New client added to your roster!');
                fetchClients();
            }
            setTimeout(() => {
                if (action !== 'VIEW_CLIENT') { // Don't close if just viewing/updating progress in view
                    setAction(null);
                    setMessage('');
                    setFormData({});
                }
            }, 2000);
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Calculate Age helper
    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        // Placeholder if DOB is not in schema, assuming age is direct int
        return dob;
    };

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
    const isSubscriptionActive = subscription.status !== 'EXPIRED';

    return (
        <div className="space-y-12 animate-reveal-up pb-20">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter tracking-tight">Trainer Dashboard</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Manage your clients and plans</p>
                </div>
                <div className="hidden md:block">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-[0.2em] shadow-lg ${subscription.status === 'EXPIRED'
                        ? 'bg-red-600/10 text-red-500 border-red-500/20 shadow-red-900/10'
                        : subscription.status === 'EXPIRING_SOON'
                            ? 'bg-yellow-600/10 text-yellow-500 border-yellow-500/20 shadow-yellow-900/10'
                            : 'bg-green-600/10 text-green-500 border-green-500/20 shadow-green-900/10'
                        }`}>
                        Status: {subscription.status === 'EXPIRED' ? 'Subscription Expired' : subscription.status === 'EXPIRING_SOON' ? 'Expiring Soon' : 'Active Trainer'}
                    </span>
                </div>
            </div>

            {/* Subscription Status Card */}
            <div className={`glass-card p-6 md:p-8 rounded-[2rem] border-2 ${subscription.status === 'EXPIRED'
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Your Subscription Status</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">Trainer Monthly Plan • ₹659/month</p>
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
                            <button className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-red-900/30">
                                Renew Now
                            </button>
                        )}
                    </div>
                </div>
                {subscription.status === 'EXPIRED' && (
                    <div className="mt-6 p-4 bg-red-600/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-bold">⚠️ Your subscription has expired. Renew to continue adding clients and creating plans.</p>
                    </div>
                )}
            </div>

            {/* Payment Settings - QR Code */}
            <div className="glass-card p-6 md:p-8 rounded-[2rem] border-2 border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                            <QrCode className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Payment Setup</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                {user.paymentQrCode ? '✅ QR Code Active' : '⚠️ No QR Code set - Clients cannot pay you'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user.paymentQrCode && (
                            <img
                                src={user.paymentQrCode}
                                alt="Your Payment QR"
                                className="w-16 h-16 rounded-xl border border-white/10 object-contain bg-white"
                            />
                        )}
                        <label className="cursor-pointer">
                            <div className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-900/30 flex items-center gap-2">
                                {isUploadingQR ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                {user.paymentQrCode ? 'Update QR' : 'Upload QR'}
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleQrUpload}
                                disabled={isUploadingQR}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-3">Your Clients</p>
                    <h3 className="text-6xl font-black text-white tracking-tighter">{stats.clients}</h3>
                    <div className="mt-8 w-16 h-1 bg-red-600 rounded-full group-hover:w-full transition-all duration-700"></div>
                </div>

                <div className="glass-card p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 13v6" /><path d="M12 13l4-4" /></svg>
                    </div>
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mb-3">Active Plans</p>
                    <h3 className="text-6xl font-black text-white tracking-tighter">{stats.activePlans}</h3>
                    <div className="mt-8 w-16 h-1 bg-yellow-600 rounded-full group-hover:w-full transition-all duration-700"></div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => isSubscriptionActive && handleAction('ADD_CLIENT')}
                    disabled={!isSubscriptionActive}
                    className={`group p-6 md:p-8 glass-card rounded-[2rem] shadow-2xl transition-all text-left relative overflow-hidden ${isSubscriptionActive
                        ? 'hover:border-red-500/50 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-4 bg-red-600/10 rounded-2xl w-fit mb-6 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">Add Clients</h3>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                        {isSubscriptionActive ? 'Add a new client to your management list.' : 'Renew subscription to add clients.'}
                    </p>
                </button>



                <button
                    onClick={() => setAction('FOOD_LIBRARY')}
                    className="group p-6 md:p-8 glass-card rounded-[2rem] shadow-2xl transition-all text-left relative overflow-hidden hover:border-green-500/50 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-4 bg-green-600/10 rounded-2xl w-fit mb-6 text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-green-500 transition-colors">Food Library</h3>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                        Manage nutrition database & custom foods.
                    </p>
                </button>

                <button
                    onClick={() => setAction('WORKOUT_LIBRARY')}
                    className="group p-6 md:p-8 glass-card rounded-[2rem] shadow-2xl transition-all text-left relative overflow-hidden hover:border-blue-500/50 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-4 bg-blue-600/10 rounded-2xl w-fit mb-6 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                        <Dumbbell className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">Workout Library</h3>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                        Exercise database & custom workouts.
                    </p>
                </button>

                <button
                    onClick={() => setAction('SUPPLEMENT_LIBRARY')}
                    className="group p-6 md:p-8 glass-card rounded-[2rem] shadow-2xl transition-all text-left relative overflow-hidden hover:border-purple-500/50 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-4 bg-purple-600/10 rounded-2xl w-fit mb-6 text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                        <Pill className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-purple-500 transition-colors">Supplement Library</h3>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                        Supplement database & usage guide.
                    </p>
                </button>
            </div>

            {/* Pending Client Payments */}
            {pendingPayments.length > 0 && (
                <div className="glass-morphism rounded-[3rem] overflow-hidden shadow-2xl border-2 border-yellow-500/30 bg-yellow-500/5">
                    <div className="p-6 md:p-8 border-b border-yellow-500/20 bg-yellow-500/10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                                    <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Pending Client Payments</h3>
                                <p className="text-sm text-yellow-500/70">Approve payments to activate clients</p>
                            </div>
                        </div>
                        <span className="text-sm text-yellow-500 font-black uppercase tracking-widest bg-yellow-500/20 px-4 py-2 rounded-full animate-pulse">
                            {pendingPayments.length} Awaiting
                        </span>
                    </div>

                    <div className="divide-y divide-yellow-500/10">
                        {pendingPayments.map(payment => (
                            <div key={payment.id} className="p-6 hover:bg-yellow-500/5 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 border border-yellow-500/20 flex items-center justify-center text-xl font-black text-yellow-500">
                                            {payment.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white uppercase tracking-tight">{payment.user?.name || 'Unknown'}</h4>
                                            <p className="text-sm text-gray-500">{payment.user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase">Amount</p>
                                            <p className="text-xl font-black text-white">₹{payment.amount}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase">TXN ID</p>
                                            <p className="text-sm font-mono text-gray-400">{payment.transactionId}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprovePayment(payment.id)}
                                            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold uppercase tracking-wide text-xs transition-all shadow-lg hover:shadow-green-500/30"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectPayment(payment.id)}
                                            className="px-6 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl font-bold uppercase tracking-wide text-xs transition-all border border-red-500/30"
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Client Roster */}
            <div className="glass-morphism rounded-[3rem] overflow-hidden shadow-2xl border-white/5">
                <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Clients List</h3>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">{clients.length} Total Clients</span>
                </div>

                <div className="divide-y divide-white/5">
                    {clients.length === 0 ? (
                        <div className="p-20 text-center text-gray-500 font-black uppercase tracking-widest opacity-20">No clients assigned</div>
                    ) : clients.map(client => (
                        <div key={client.id} className="p-6 md:p-8 hover:bg-white/[0.03] transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-white/5 flex items-center justify-center text-2xl font-black text-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                                        {client.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-red-600 transition-colors">{client.user.name}</h4>
                                        <p className="text-sm text-gray-500 font-medium">{client.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 min-w-[140px]">
                                    {(() => {
                                        const plans = client.clientProfile?.plans || [];
                                        const diet = plans.find(p => p.type === 'DIET');
                                        const workout = plans.find(p => p.type === 'WORKOUT');
                                        return (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${diet ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${diet ? 'text-green-500' : 'text-gray-600'}`}>
                                                        Diet: {diet ? 'Active' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${workout ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${workout ? 'text-red-500' : 'text-gray-600'}`}>
                                                        Workout: {workout ? 'Active' : 'Pending'}
                                                    </span>
                                                </div>
                                                {(diet || workout) && (
                                                    <p className="text-[9px] text-gray-500 font-medium mt-1">
                                                        Updated: {new Date(Math.max(
                                                            new Date(diet?.updatedAt || 0),
                                                            new Date(workout?.updatedAt || 0)
                                                        )).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button onClick={() => handleAction('VIEW_CLIENT', client)} className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 shadow-lg">Monitor</button>
                                    <button onClick={() => handleAction('CREATE_DIET', client)} className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-green-900/20">Nutrition</button>
                                    <button onClick={() => handleAction('CREATE_WORKOUT', client)} className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/20">Workout</button>
                                    <button onClick={() => setRemoveClientModal({ show: true, client })} className="p-3 bg-white/5 hover:bg-red-600/20 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-white/10 group-rev" title="Remove Client">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal/Form Area */}
            {
                action && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                        <div className="bg-dark-900 border border-white/10 rounded-[2.5rem] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                                        {action === 'ADD_CLIENT' && 'Add New Client'}
                                        {action === 'CREATE_DIET' && 'Create Diet Plan'}
                                        {action === 'CREATE_WORKOUT' && 'Create Workout Plan'}
                                        {action === 'VIEW_CLIENT' && `Coaching: ${selectedClient?.user.name}`}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Trainer Command Center</p>
                                </div>
                                <button onClick={closeAction} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-600 text-white transition-all">✕</button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {action === 'VIEW_CLIENT' && !clientDetails ? (
                                    <div className="p-20 flex flex-col items-center justify-center w-full text-white">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
                                        <p className="font-black uppercase tracking-widest text-xs opacity-50">Accessing Client Data...</p>
                                    </div>
                                ) : action === 'VIEW_CLIENT' && clientDetails ? (
                                    <>
                                        {/* Sidebar Tabs */}
                                        <div className="w-full md:w-64 bg-black/10 border-r border-white/5 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible shrink-0 text-white">
                                            {['OVERVIEW', 'LOGS', 'FEEDBACK', 'PROGRESS', 'PHOTOS'].map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`p-4 rounded-xl text-left font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap ${activeTab === tab ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-black/5">
                                            {activeTab === 'OVERVIEW' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                                        <h4 className="text-white font-black uppercase tracking-tight mb-4">Client Profile</h4>
                                                        <div className="space-y-4">
                                                            {/* Profile details similar to before */}
                                                            {[
                                                                { l: 'Age', v: clientDetails.profile.age },
                                                                { l: 'Weight', v: clientDetails.profile.currentWeight + ' kg' },
                                                                { l: 'Height', v: clientDetails.profile.height + ' cm' },
                                                                { l: 'Goal', v: 'Transformation' } // Static for now or add to schema
                                                            ].map((i, x) => (
                                                                <div key={x} className="flex justify-between border-b border-white/5 pb-2">
                                                                    <span className="text-gray-500 text-xs font-bold uppercase">{i.l}</span>
                                                                    <span className="text-white text-sm font-bold">{i.v}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                                        <h4 className="text-white font-black uppercase tracking-tight mb-4">Assessment</h4>
                                                        <p className="text-gray-400 text-sm">{clientDetails.profile.injuries ? `⚠️ Injuries: ${clientDetails.profile.injuries}` : '✅ No Injuries reported'}</p>
                                                        <div className="mt-4">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Diet Type</p>
                                                            <p className="text-white font-bold">{clientDetails.profile.dietType}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'LOGS' && (
                                                <div className="space-y-4">
                                                    <h4 className="text-white font-black uppercase tracking-tight mb-4">Daily Activity Logs</h4>
                                                    {clientDetails.activities.length === 0 ? <p className="text-gray-500">No activity logs found.</p> :
                                                        clientDetails.activities.map(act => (
                                                            <div key={act.id} className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                                                                <div>
                                                                    <p className="text-white font-bold text-sm">{new Date(act.date).toLocaleDateString()}</p>
                                                                </div>
                                                                <div className="flex gap-4">
                                                                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${act.workoutCompleted ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>
                                                                        Workout: {act.workoutCompleted ? 'YES' : 'NO'}
                                                                    </span>
                                                                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-600/20 text-blue-500">
                                                                        Water: {act.waterIntake}L
                                                                    </span>
                                                                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-yellow-600/20 text-yellow-500">
                                                                        Meals: {act.mealsCompleted}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )}

                                            {activeTab === 'FEEDBACK' && (
                                                <div className="space-y-4">
                                                    <h4 className="text-white font-black uppercase tracking-tight mb-4">Client Feedback</h4>
                                                    {clientDetails.feedbacks.map(fb => (
                                                        <div key={fb.id} className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                                            <div className="flex justify-between mb-4">
                                                                <span className="text-gray-500 text-xs font-bold">{new Date(fb.submittedAt).toLocaleDateString()}</span>
                                                                <div className="flex gap-2">
                                                                    <span className="text-xs bg-black/20 px-2 py-1 rounded">⚡ {fb.energyLevel}</span>
                                                                    <span className="text-xs bg-black/20 px-2 py-1 rounded">😴 {fb.sleepQuality}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-white text-sm italic">"{fb.notes}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'PROGRESS' && (
                                                <div>
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="text-white font-black uppercase tracking-tight">Progress History</h4>
                                                    </div>

                                                    {/* Add Progress Record Form (Simple) */}
                                                    {/* Update Body Stats Form */}
                                                    <form onSubmit={submitBodyStats} className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                                                        <h5 className="text-gray-400 font-bold uppercase text-xs mb-4 flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                                            Update Transformation Stats
                                                        </h5>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Past Weight</label>
                                                                <input type="number" step="0.1" value={formData.pastWeight ?? ''} placeholder="kg" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-600 focus:outline-none transition-colors" onChange={e => setFormData({ ...formData, pastWeight: e.target.value })} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Current Weight</label>
                                                                <input type="number" step="0.1" value={formData.currentWeight ?? ''} placeholder="kg" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-600 focus:outline-none transition-colors" onChange={e => setFormData({ ...formData, currentWeight: e.target.value })} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Target Weight</label>
                                                                <input type="number" step="0.1" value={formData.targetWeight ?? ''} placeholder="kg" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-600 focus:outline-none transition-colors" onChange={e => setFormData({ ...formData, targetWeight: e.target.value })} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Body Fat %</label>
                                                                <input type="number" step="0.1" value={formData.bodyFat ?? ''} placeholder="%" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-600 focus:outline-none transition-colors" onChange={e => setFormData({ ...formData, bodyFat: e.target.value })} />
                                                            </div>
                                                        </div>
                                                        <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-900/20 active:scale-95">
                                                            Synch & Save Changes
                                                        </button>
                                                    </form>

                                                    <div className="space-y-2">
                                                        {clientDetails.progress.map(prog => (
                                                            <div key={prog.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                                                <span className="text-gray-500 text-xs font-bold">{new Date(prog.recordedAt).toLocaleDateString()}</span>
                                                                <span className="text-white font-bold">{prog.weight} kg</span>
                                                                <span className="text-yellow-500 font-bold">{prog.bodyFat ? `${prog.bodyFat}%` : '-'}</span>
                                                                <span className="text-gray-600 text-xs">{(prog.trainerNotes || '').substring(0, 20)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'PHOTOS' && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {clientDetails.photos.map(photo => (
                                                        <div key={photo.id} className="aspect-[3/4] bg-black/40 rounded-xl overflow-hidden relative border border-white/10 group">
                                                            <img src={photo.photoUrl} alt="Progress" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                                            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                                                <p className="text-white text-xs font-bold uppercase">{photo.photoType}</p>
                                                                <p className="text-gray-400 text-[10px]">{new Date(photo.uploadedAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {clientDetails.photos.length === 0 && <p className="text-gray-500 col-span-full text-center py-10">No photos uploaded yet.</p>}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    // Original Form Handling for ADD/CREATE
                                    <div className="p-8 w-full overflow-y-auto custom-scrollbar h-full">

                                        {action === 'FOOD_LIBRARY' && (
                                            <FoodLibrary />
                                        )}

                                        {action === 'WORKOUT_LIBRARY' && (
                                            <div className="h-full">
                                                <WorkoutLibrary />
                                            </div>
                                        )}

                                        {action === 'SUPPLEMENT_LIBRARY' && (
                                            <div className="h-full">
                                                <SupplementLibrary />
                                            </div>
                                        )}

                                        {action === 'CREATE_DIET' && (
                                            <div className="max-w-4xl mx-auto">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Construct Diet Plan</h3>
                                                <DietPlanBuilder
                                                    initialData={selectedClient?.clientProfile?.plans?.find(p => p.type === 'DIET')?.data || ''}
                                                    onSave={async (jsonString) => {
                                                        // Convert onSave to event-like object for existing submitAction or call API directly
                                                        // We'll call submitAction by mocking event, or refactor submitAction. 
                                                        // Refactoring submitAction is best but complex here. 
                                                        // Let's set formData.details then call submits.
                                                        // Actually, we can just call API directly here for smoother UX?
                                                        // Let's reuse submitAction logic by setting state and calling it?
                                                        // No, better to copy logic:

                                                        setLoading(true);
                                                        try {
                                                            const config = { headers: { Authorization: `Bearer ${token}` } };
                                                            const clientId = selectedClient.id || selectedClient.userId; // Check structure
                                                            /* 
                                                               Wait, selectedClient in handleAction('CREATE_DIET', client) sets selectedClient to the client object. 
                                                               client object has `id` (profile id) usually? 
                                                               Let's check logic:
                                                               handleAction sets selectedClient. 
                                                               submitAction uses `selectedClient.userId`. 
                                                            */
                                                            const targetId = selectedClient.userId;

                                                            await api.post('/plans', {
                                                                clientId: targetId,
                                                                type: 'DIET',
                                                                data: jsonString,
                                                                validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                            }, config);

                                                            setMessage('Diet Plan Deployed Successfully');
                                                            fetchClientDetails(targetId); // Refresh
                                                            setTimeout(() => setAction(null), 1500);
                                                        } catch (err) {
                                                            console.error(err);
                                                            setMessage('Error: ' + (err.response?.data?.message || 'Failed'));
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    loading={loading}
                                                />
                                            </div>
                                        )}

                                        {false && action === 'CREATE_WORKOUT' && (
                                            <div className="max-w-5xl mx-auto h-full flex flex-col">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Construct Workout Plan</h3>
                                                <WorkoutPlanBuilder
                                                    initialData={selectedClient?.clientProfile?.plans?.find(p => p.type === 'WORKOUT')?.data || ''}
                                                    onSave={async (jsonString) => {
                                                        setLoading(true);
                                                        try {
                                                            const config = { headers: { Authorization: `Bearer ${token}` } };
                                                            const targetId = selectedClient.userId;

                                                            await api.post('/plans', {
                                                                clientId: targetId,
                                                                type: 'WORKOUT',
                                                                data: jsonString,
                                                                validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                            }, config);

                                                            setMessage('Workout Plan Deployed Successfully');
                                                            fetchClientDetails(targetId);
                                                            setTimeout(() => setAction(null), 1500);
                                                        } catch (err) {
                                                            console.error(err);
                                                            setMessage('Error: ' + (err.response?.data?.message || 'Failed'));
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    loading={loading}
                                                />
                                            </div>
                                        )}

                                        {/* If action is NOT view_client AND NOT Diet/Library/Workout */}
                                        {action !== 'VIEW_CLIENT' && action !== 'FOOD_LIBRARY' && action !== 'CREATE_DIET' && action !== 'WORKOUT_LIBRARY' && action !== 'SUPPLEMENT_LIBRARY' && (
                                            <form onSubmit={submitAction} className="space-y-6 max-w-xl mx-auto">
                                                {/* Success/Error Message Display */}
                                                {message && (
                                                    <div className={`p-4 rounded-xl text-sm font-bold ${message.startsWith('Error')
                                                        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                                        : 'bg-green-600/20 text-green-400 border border-green-500/30'
                                                        }`}>
                                                        {message}
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client Email</label>
                                                    <input
                                                        type="email"
                                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder-gray-700 font-bold"
                                                        placeholder="client@evolution.hub"
                                                        value={formData.clientEmail || ''}
                                                        onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                                                        readOnly={action !== 'ADD_CLIENT'}
                                                        required
                                                    />
                                                </div>

                                                {(action === 'CREATE_WORKOUT') && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center px-1">
                                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan Details</label>
                                                                {(action === 'CREATE_WORKOUT') && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowExercisePicker(true)}
                                                                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white flex items-center gap-1 transition-colors"
                                                                    >
                                                                        <Dumbbell className="w-3 h-3" /> Open Library
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <textarea
                                                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-white h-56 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder-gray-700 resize-none font-mono text-sm leading-relaxed custom-scrollbar"
                                                                placeholder="Input complete training workout plan here..."
                                                                value={formData.details || ''}
                                                                onChange={e => setFormData({ ...formData, details: e.target.value })}
                                                                required
                                                            />
                                                            {showExercisePicker && (
                                                                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                                                                    <div className="bg-dark-900 border border-white/10 p-6 rounded-[2rem] w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl relative">
                                                                        <button type="button" onClick={() => setShowExercisePicker(false)} className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">✕</button>
                                                                        <h3 className="text-xl font-black uppercase text-white mb-4">Select Exercise to Add</h3>
                                                                        <div className="flex-1 overflow-hidden rounded-xl border border-white/5">
                                                                            <WorkoutLibrary onSelect={handleExercisePick} isSelectionMode={true} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Valid Until</label>
                                                            <input
                                                                type="date"
                                                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-white focus:border-red-600 focus:outline-none"
                                                                value={formData.validUntil || ''}
                                                                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                <div className="pt-6">
                                                    <button type="submit" disabled={loading} className="w-full h-16 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all shadow-xl shadow-red-900/30 active:scale-95 flex items-center justify-center group overflow-hidden relative">
                                                        <span className="relative z-10">{loading ? 'Submitting...' : action === 'ADD_CLIENT' ? 'Add Client' : `Save ${action.split('_').pop().toLowerCase()} Plan`}</span>
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Remove Client Verification Modal */}
            {removeClientModal.show && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-6 backdrop-blur-md">
                    <div className="bg-dark-900 border border-white/10 p-8 rounded-[2rem] max-w-md w-full text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                        <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase mb-2">Remove Client?</h3>
                        <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">
                            Are you sure you want to remove <span className="text-white font-bold">{removeClientModal.client?.user?.name}</span> from your list? They will remain in the system but you will lose access.
                        </p>

                        <div className="flex gap-4">
                            <button onClick={() => setRemoveClientModal({ show: false, client: null })} className="flex-1 py-4 rounded-xl bg-white/5 text-white font-black uppercase text-xs hover:bg-white/10 transition-colors">Cancel</button>
                            <button onClick={handleRemoveClient} className="flex-1 py-4 rounded-xl bg-red-600 text-white font-black uppercase text-xs hover:bg-red-500 transition-colors shadow-lg shadow-red-900/40">
                                Confirm Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default TrainerDashboard;
