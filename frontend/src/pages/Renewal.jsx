import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const Renewal = () => {
    const { logout, user, token } = useAuthStore();
    const navigate = useNavigate();
    const [txnId, setTxnId] = useState('');
    const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, PENDING
    const [settings, setSettings] = useState(null);
    const [msg, setMsg] = useState('');

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/settings', config);
                setSettings(data);
            } catch (err) {
                console.error('Error fetching settings:', err);
            }
        };
        fetchSettings();
    }, [token]);

    const handleReturnToLogin = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const submitPayment = async (e) => {
        e.preventDefault();
        setStatus('SUBMITTING');
        try {
            const amount = user?.role === 'TRAINER' ? (settings?.trainerPrice || 659) : (settings?.clientPrice || 6000);
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await api.post('/payments', {
                amount,
                transactionId: txnId
            }, config);

            setStatus('PENDING');
            setMsg('Payment submitted! Please login again after admin approval.');

            // Force logout after 2 seconds to ensure fresh token on next login
            setTimeout(() => {
                logout();
                navigate("/login", { replace: true });
            }, 2000);
        } catch (error) {
            setStatus('IDLE');
            setMsg('Error: ' + (error.response?.data?.message || 'Submission failed'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-black relative">
            <div className="relative z-10 w-full max-w-lg glass-morphism p-10 md:p-14 rounded-[4rem] border-white/5 shadow-[0_0_100px_-20px_rgba(220,38,38,0.1)] text-center animate-reveal-scale">
                <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-inner group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 group-hover:rotate-12 transition-transform duration-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>

                <div className="animate-reveal-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Subscription Expired</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-10">Renew your access</p>
                </div>

                {status === 'PENDING' ? (
                    <div className="bg-white/5 border border-white/5 p-10 rounded-[2.5rem] animate-reveal-scale shadow-inner">
                        <div className="text-5xl mb-6">⏳</div>
                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Payment Verification</h3>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed">
                            Payment ID <span className="text-red-500 font-mono font-black">{txnId}</span> is logged.
                            <br /><br />
                            Admin is currently checking your payment. Access will be restored once approved.
                        </p>
                        <button onClick={handleReturnToLogin} className="mt-10 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest underline decoration-red-600 underline-offset-8 transition-colors">Back to Login</button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-6 rounded-[2.5rem] inline-block mb-10 relative group transform hover:scale-[1.05] transition-all duration-700 shadow-2xl animate-reveal-up" style={{ animationDelay: '0.4s' }}>
                            <img
                                src={settings?.qrCode && settings.qrCode.startsWith('/uploads')
                                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.qrCode}`
                                    : (settings?.qrCode || "/payment-qr.jpg")}
                                alt="Payment QR Code"
                                className="w-48 h-48 object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 border-4 border-dashed border-black/5 rounded-[2.5rem] pointer-events-none group-hover:border-red-600/20 transition-colors"></div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-[2.5rem] mb-10 text-left border border-white/5 shadow-inner animate-reveal-up" style={{ animationDelay: '0.6s' }}>
                            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Renewal Amount</span>
                                <span className="text-3xl font-black text-white tracking-tighter">
                                    ₹{user?.role === 'TRAINER'
                                        ? (settings?.trainerPrice ? settings.trainerPrice.toLocaleString() : '659')
                                        : (settings?.clientPrice ? settings.clientPrice.toLocaleString() : '6,000')}
                                </span>
                            </div>

                            <form onSubmit={submitPayment} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Step 1: Pay via UPI</label>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tight leading-relaxed">Scan the QR code above and pay the amount.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-red-500 transition-colors">Step 2: Enter Transaction ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="12-digit transaction ID"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50 shadow-inner placeholder-gray-800 font-mono font-bold tracking-[0.3em] uppercase mt-1 transition-all"
                                        value={txnId}
                                        onChange={(e) => setTxnId(e.target.value)}
                                    />
                                </div>

                                {msg && <p className="text-[10px] text-red-500 font-black uppercase text-center tracking-widest bg-red-600/10 py-3 rounded-xl border border-red-500/20 animate-reveal-scale">{msg}</p>}

                                <button
                                    type="submit"
                                    disabled={status === 'SUBMITTING'}
                                    className="w-full h-16 relative group overflow-hidden bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all shadow-xl shadow-red-900/40 active:scale-95 disabled:opacity-50"
                                >
                                    <span className="relative z-10">{status === 'SUBMITTING' ? 'Submitting...' : 'Submit Payment'}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </form>
                        </div>

                        <button
                            onClick={handleReturnToLogin}
                            className="animate-reveal-up text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors mb-4 block"
                            style={{ animationDelay: '0.8s' }}
                        >
                            ← Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Renewal;
