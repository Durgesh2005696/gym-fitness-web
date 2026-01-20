import React from 'react';
import useAuthStore from '../store/authStore';

const PlanInProgress = () => {
    const { logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[150px] animate-pulse"></div>

            <div className="text-center relative z-10 max-w-lg">
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <span className="text-5xl">💪</span>
                </div>

                <h2 className="text-4xl font-black text-white mb-2">Thank you!</h2>
                <h3 className="text-xl text-blue-400 font-bold mb-6">Details Submitted Successfully</h3>

                <div className="bg-dark-900 border border-white/10 p-6 rounded-2xl shadow-xl">
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Give me <span className="text-white font-bold">2–3 days</span> so that I can work on your profile and provide you with a <span className="text-red-500 font-bold">Customised Diet & Workout Plan</span>.
                    </p>
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-sm text-gray-500 font-bold tracking-widest uppercase">FIT WITH DURGESH</p>
                        <p className="text-xs text-red-500 font-bold uppercase mt-1">NFA TRAINER</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="mt-8 text-gray-500 hover:text-white transition-colors text-sm underline"
                >
                    Logout & Check Back Later
                </button>
            </div>
        </div>
    );
};

export default PlanInProgress;
