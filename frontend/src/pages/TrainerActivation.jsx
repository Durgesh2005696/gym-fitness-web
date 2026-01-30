import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Clock, CheckCircle, XCircle, QrCode, Upload } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const TrainerActivation = () => {
    const { user, logout, refreshUser } = useAuthStore();
    const navigate = useNavigate();

    const [settings, setSettings] = useState(null);
    const [txnId, setTxnId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSettings();

        // Poll for status changes if payment is submitted
        let interval;
        if (user?.accountStatus === 'PAYMENT_SUBMITTED') {
            interval = setInterval(async () => {
                try {
                    const updatedUser = await refreshUser();
                    if (updatedUser.accountStatus === 'ACTIVE') {
                        navigate('/dashboard');
                    }
                } catch (e) {
                    console.error('Status check failed:', e);
                }
            }, 10000); // Check every 10 seconds
        }

        return () => interval && clearInterval(interval);
    }, [user?.accountStatus]);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
        } catch (e) {
            console.error('Failed to fetch settings:', e);
        }
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!txnId.trim()) {
            setError('Please enter your transaction ID');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setMessage('');

        try {
            await api.post('/payments/trainer-subscription', {
                transactionId: txnId.trim()
            });
            setMessage('Payment submitted! Waiting for admin approval...');
            await refreshUser();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPending = user?.accountStatus === 'PENDING';
    const isPaymentSubmitted = user?.accountStatus === 'PAYMENT_SUBMITTED';
    const isRejected = user?.accountStatus === 'REJECTED';

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-900/40">
                        <span className="text-3xl font-black text-white">FD</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                        Trainer Activation
                    </h1>
                    <p className="text-gray-400">
                        Complete payment to unlock your trainer dashboard
                    </p>
                </div>

                {/* Status Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        {isPending && <Clock className="w-8 h-8 text-yellow-500" />}
                        {isPaymentSubmitted && <Clock className="w-8 h-8 text-blue-500 animate-pulse" />}
                        {isRejected && <XCircle className="w-8 h-8 text-red-500" />}

                        <div>
                            <h3 className="font-bold text-white">
                                {isPending && 'Payment Required'}
                                {isPaymentSubmitted && 'Awaiting Approval'}
                                {isRejected && 'Application Rejected'}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {isPending && 'Submit payment to activate your trainer account'}
                                {isPaymentSubmitted && 'Admin is reviewing your payment'}
                                {isRejected && 'Contact support for more information'}
                            </p>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-black/30 rounded-xl">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Account</p>
                            <p className="font-bold text-white">{user?.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Email</p>
                            <p className="font-bold text-white text-sm">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Section - Only show if PENDING */}
                {isPending && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-red-500" />
                            Trainer Subscription
                        </h3>

                        {/* Price */}
                        <div className="text-center py-6 border-b border-white/10 mb-6">
                            <p className="text-gray-400 text-sm mb-1">One-time Activation Fee</p>
                            <p className="text-5xl font-black text-white">
                                ₹{settings?.trainerPrice || 659}
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                {settings?.subscriptionDuration || 30} days subscription
                            </p>
                        </div>

                        {/* QR Code */}
                        {settings?.qrCode && (
                            <div className="flex flex-col items-center mb-6">
                                <p className="text-xs text-gray-500 uppercase mb-3 flex items-center gap-2">
                                    <QrCode className="w-4 h-4" />
                                    Scan to Pay
                                </p>
                                <div className="bg-white p-3 rounded-xl">
                                    <img
                                        src={settings.qrCode.startsWith('/uploads')
                                            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.qrCode}`
                                            : settings.qrCode}
                                        alt="Payment QR Code"
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Transaction Form */}
                        <form onSubmit={handleSubmitPayment}>
                            <label className="block text-sm text-gray-400 mb-2">
                                Transaction ID / UTR Number
                            </label>
                            <input
                                type="text"
                                value={txnId}
                                onChange={(e) => setTxnId(e.target.value)}
                                placeholder="Enter your transaction ID"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4"
                            />

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Submit Payment
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Payment Submitted - Waiting */}
                {isPaymentSubmitted && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6 text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-blue-500 animate-pulse" />
                        </div>
                        <h3 className="font-bold text-white mb-2">Payment Under Review</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Your payment has been submitted and is being reviewed by the admin.
                            This page will automatically refresh when approved.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                            Checking status...
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {message && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 text-green-400 text-center">
                        <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                        {message}
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-medium rounded-xl transition-all border border-white/10"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default TrainerActivation;
