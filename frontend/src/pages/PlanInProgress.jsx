import React from 'react';
import useAuthStore from '../store/authStore';

const PlanInProgress = () => {
    const { logout } = useAuthStore();

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
            <div className="text-center relative z-10 max-w-2xl w-full glass-morphism p-12 md:p-20 rounded-[4rem] border-white/5 shadow-[0_0_100px_-20px_rgba(59,130,246,0.1)] animate-reveal-scale">
                <div className="w-32 h-32 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-blue-500/20 shadow-inner group">
                    <span className="text-6xl group-hover:scale-125 transition-transform duration-700">💪</span>
                </div>

                <div className="animate-reveal-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-5xl font-black text-white mb-3 uppercase tracking-tighter">Questionnaire Submitted</h2>
                    <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] mb-12">Plan assignment in progress</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-10 rounded-[2.5rem] mb-12 animate-reveal-up shadow-inner" style={{ animationDelay: '0.4s' }}>
                    <p className="text-gray-300 text-xl leading-relaxed font-medium">
                        Please wait <span className="text-white font-black underline decoration-red-600 underline-offset-8 uppercase tracking-tight">24 to 48 Hours</span>. <br /><br />
                        I am currently creating your <span className="text-red-500 font-black italic">Workout and Diet Plan</span>.
                    </p>
                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center">
                        <div className="px-4 py-1.5 bg-red-600/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest mb-2">Primary Trainer</div>
                        <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Fit With DY</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="animate-reveal-up text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-all hover:tracking-[0.4em] underline decoration-gray-800 hover:decoration-red-600 underline-offset-8"
                    style={{ animationDelay: '0.6s' }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default PlanInProgress;
