import React from 'react';
import useAuthStore from '../store/authStore';

const Renewal = () => {
    const { logout, user } = useAuthStore();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-red-900/10 rounded-full blur-[150px] animate-pulse"></div>

            <div className="bg-dark-900 border border-red-500/30 p-8 rounded-3xl max-w-md w-full text-center relative z-10 shadow-2xl shadow-red-900/20">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>

                <h2 className="text-3xl font-black text-white mb-2">Access Expired</h2>
                <p className="text-gray-400 mb-8">Your 30-day access period has ended.<br />Please renew your subscription to continue.</p>

                <div className="bg-white p-4 rounded-xl inline-block mb-6 relative group">
                    <img
                        src="/payment-qr.jpg"
                        alt="Payment QR Code"
                        className="w-48 h-48 object-contain"
                    />
                    <div className="absolute inset-0 border-4 border-dashed border-gray-900/20 rounded-xl pointer-events-none"></div>
                </div>

                <div className="bg-dark-800 p-4 rounded-xl mb-6 text-left border border-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payment Instructions</p>
                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                        <li>Scan the QR code with any UPI app.</li>
                        <li>Pay <span className="text-white font-bold">₹{user?.role === 'TRAINER' ? '500' : '6000'}</span>.</li>
                        <li>Take a screenshot of the payment.</li>
                        <li>Send the screenshot to Admin (Durgesh).</li>
                    </ol>
                </div>

                <button
                    onClick={logout}
                    className="w-full bg-dark-800 hover:bg-dark-700 text-white font-bold py-3 rounded-lg border border-white/10 transition-all"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default Renewal;
