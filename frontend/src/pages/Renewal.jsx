import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const Renewal = () => {
    const { logout, user, token } = useAuthStore();
    const [txnId, setTxnId] = useState('');
    const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, PENDING
    const [msg, setMsg] = useState('');

    const submitPayment = async (e) => {
        e.preventDefault();
        setStatus('SUBMITTING');
        try {
            const amount = user?.role === 'TRAINER' ? 500 : 6000;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await api.post('/payments', {
                amount,
                transactionId: txnId
            }, config);

            setStatus('PENDING');
            setMsg('Payment submitted! Waiting for Admin approval.');
        } catch (error) {
            setStatus('IDLE');
            setMsg('Error: ' + (error.response?.data?.message || 'Submission failed'));
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-red-900/10 rounded-full blur-[150px] animate-pulse"></div>

            <div className="bg-dark-900 border border-red-500/30 p-8 rounded-3xl max-w-md w-full text-center relative z-10 shadow-2xl shadow-red-900/20">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>

                <h2 className="text-3xl font-black text-white mb-2">Access Expired</h2>
                <p className="text-gray-400 mb-6">Your 30-day access period has ended.<br />Please renew your subscription to continue.</p>

                {status === 'PENDING' ? (
                    <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl animate-in zoom-in">
                        <div className="text-4xl mb-4">⏳</div>
                        <h3 className="text-xl font-bold text-white mb-2">Verification Pending</h3>
                        <p className="text-gray-400 text-sm">
                            Thank you! Your payment ID <span className="text-white font-mono font-bold">{txnId}</span> has been submitted.
                            <br /><br />
                            Admin will verify and unlock your account shortly.
                        </p>
                        <button onClick={logout} className="mt-6 text-sm text-red-400 hover:text-white underline">Logout</button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-4 rounded-xl inline-block mb-6 relative group transform hover:scale-105 transition-transform duration-300">
                            <img
                                src="/payment-qr.jpg"
                                alt="Payment QR Code"
                                className="w-48 h-48 object-contain"
                            />
                            <div className="absolute inset-0 border-4 border-dashed border-gray-900/20 rounded-xl pointer-events-none"></div>
                        </div>

                        <div className="bg-dark-800 p-4 rounded-xl mb-6 text-left border border-white/5">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-3 flex justify-between">
                                <span>Total to Pay:</span>
                                <span className="text-white text-lg">₹{user?.role === 'TRAINER' ? '500' : '6,000'}</span>
                            </p>

                            <form onSubmit={submitPayment} className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Step 1: Scan & Pay</label>
                                    <p className="text-xs text-gray-400 mb-2">Use any UPI app to pay the amount above.</p>
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Step 2: Enter Transaction ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 302829281921"
                                        className="w-full bg-black/50 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:outline-none placeholder-gray-700 font-mono tracking-widest mt-1"
                                        value={txnId}
                                        onChange={(e) => setTxnId(e.target.value)}
                                    />
                                </div>

                                {msg && <p className="text-xs text-red-400 font-bold text-center">{msg}</p>}

                                <button
                                    type="submit"
                                    disabled={status === 'SUBMITTING'}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {status === 'SUBMITTING' ? 'Verifying...' : 'Verify Payment ⚡'}
                                </button>
                            </form>
                        </div>

                        <button
                            onClick={logout}
                            className="text-xs text-gray-600 hover:text-white transition-colors"
                        >
                            Return to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Renewal;
