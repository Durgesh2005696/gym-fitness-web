import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star, TrendingUp, Users, Dumbbell, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const transformations = [
        { img: '/transformations/trans1.jpg', weeks: '12 Weeks', result: '-15kg Fat Loss' },
        { img: '/transformations/trans2.jpg', weeks: '16 Weeks', result: 'Muscle Gain' },
        { img: '/transformations/trans3.jpg', weeks: '8 Weeks', result: 'Shredded' },
        { img: '/transformations/trans4.jpg', weeks: '24 Weeks', result: 'Full Recomp' },
        { img: '/transformations/trans5.jpg', weeks: '10 Weeks', result: 'Fat Loss' },
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30 overflow-x-hidden">

            {/* --- HERO SECTION --- */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 animate-pulse-glow"></div>
                </div>

                <div className="relative z-20 text-center px-6 max-w-5xl mx-auto mt-[-5vh] w-full break-words">
                    <div className="animate-reveal-up" style={{ animationDelay: '0.1s' }}>
                        <span className="inline-block py-1 px-3 border border-red-500/30 rounded-full bg-red-500/10 text-red-400 text-xs font-black tracking-[0.2em] uppercase mb-6 backdrop-blur-md">
                            Evolution Performance
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[1.1] md:leading-[0.9] mb-8 animate-reveal-up break-words w-full" style={{ animationDelay: '0.2s' }}>
                        Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Transformations.</span><br />
                        Real Results.
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-reveal-up" style={{ animationDelay: '0.4s' }}>
                        No shortcuts. Just discipline, elite coaching, and a roadmap to the best version of yourself.
                        Your gallery of excuses ends here.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-reveal-up" style={{ animationDelay: '0.6s' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="group relative px-10 py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] transition-all shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] overflow-hidden hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start My Transformation <ChevronRight className="w-4 h-4" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-t border-white/10 pt-12 animate-reveal-up" style={{ animationDelay: '0.8s' }}>
                        {[
                            { val: '100+', label: 'Lives Changed' },
                            { val: '98%', label: 'Success Rate' },
                            { val: '50+', label: 'Active Clients' },
                            { val: '24/7', label: 'Support Access' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl font-black text-white tracking-tight">{stat.val}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- TRANSFORMATIONS GALLERY --- */}
            <section className="py-24 px-4 bg-dark-900 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Hall of <span className="text-red-600">Fame</span></h2>
                        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Real People. Unreal Results.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {transformations.map((item, idx) => (
                            <div key={idx} className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-white/5 hover:border-red-500/30 transition-all duration-500">
                                {/* Image Container with proper framing */}
                                <div className="relative aspect-[16/10]">
                                    <img
                                        src={item.img}
                                        alt={`Transformation ${idx + 1}`}
                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                    />

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>

                                    {/* Badge */}
                                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg">
                                        {item.weeks}
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="p-6 bg-black/40 backdrop-blur-sm">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{item.result}</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Client Success Story</p>
                                    <div className="mt-4 flex items-center gap-2 text-yellow-500">
                                        <Star className="w-4 h-4 fill-yellow-500" />
                                        <Star className="w-4 h-4 fill-yellow-500" />
                                        <Star className="w-4 h-4 fill-yellow-500" />
                                        <Star className="w-4 h-4 fill-yellow-500" />
                                        <Star className="w-4 h-4 fill-yellow-500" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- TRUST STRIP --- */}
            <section className="py-20 border-y border-white/5 bg-black/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {[
                            { icon: <TrendingUp className="w-8 h-8 text-red-500" />, title: 'Custom Diet Plans', desc: 'Tailored to your metabolism and taste.' },
                            { icon: <Dumbbell className="w-8 h-8 text-red-500" />, title: 'Hypertrophy Training', desc: 'Science-based muscle building protocols.' },
                            { icon: <ShieldCheck className="w-8 h-8 text-red-500" />, title: 'Form Correction', desc: 'Video analysis to ensure safety.' },
                            { icon: <Users className="w-8 h-8 text-red-500" />, title: '24/7 Mentorship', desc: 'Constant accountability and support.' }
                        ].map((feat, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors duration-500 shadow-xl group-hover:shadow-red-900/40">
                                    <div className="text-white">{feat.icon}</div>
                                </div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{feat.title}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="relative py-32 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-red-900/20"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                <div className="relative z-10 text-center max-w-4xl px-4">
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
                        Your Story Starts <br /><span className="text-red-500">Today.</span>
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 font-medium">Join the elite team. Transform your physique. Dominate your life.</p>

                    <button
                        onClick={() => navigate('/login')}
                        className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] transition-all shadow-2xl hover:bg-gray-200 active:scale-95"
                    >
                        Start My Transformation
                    </button>

                    <div className="mt-12 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>Rated 5.0 by 100+ Clients</span>
                    </div>
                </div>
            </section>

            {/* --- FOOTER SIMPLE --- */}
            <footer className="py-8 text-center border-t border-white/5 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                &copy; 2024 Fit With DY. All Rights Reserved.
            </footer>

        </div>
    );
};

export default LandingPage;
