import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CLIENT');
    const [message, setMessage] = useState('');

    const { login, register, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            if (isRegistering) {
                await register(name, email, password, role);
                setMessage('Registration successful! Please login.');
                setIsRegistering(false);
                setName('');
                setRole('CLIENT');
            } else {
                await login(email, password);
                navigate('/dashboard');
            }
        } catch (err) {
            // Error handled in store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Cinematic Home Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-50 flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white font-black uppercase tracking-widest text-xs group hover:bg-red-600/20 hover:border-red-500/50 hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.5)] transition-all duration-500 hover:scale-105 active:scale-95"
            >
                <Home className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                <span className="group-hover:text-white transition-colors">Home</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600/0 via-red-500/10 to-red-600/0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
            </button>

            <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row glass-morphism rounded-[2.5rem] overflow-hidden border border-white/10 animate-reveal-scale">

                {/* Left Side: Cinematic Branding */}
                <div className="w-full md:w-1/2 bg-dark-900 flex flex-col justify-center text-white relative overflow-hidden group">
                    {/* Animated Background Image / Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-black z-0"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:scale-110 transition-transform duration-1000"></div>

                    <div className="relative z-10 p-12">
                        <div className="animate-reveal-up" style={{ animationDelay: '0.2s' }}>
                            <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase leading-[0.9]">
                                Fit With <br />
                                <span className="text-red-500">DY</span>
                            </h1>
                            <div className="w-16 h-1.5 bg-red-600 rounded-full mb-8"></div>
                        </div>

                        <p className="text-lg text-gray-300 mb-10 font-medium leading-relaxed animate-reveal-up" style={{ animationDelay: '0.4s' }}>
                            Transform Your Body. <br />
                            <span className="text-white">Master Your Mind.</span>
                        </p>

                        <div className="space-y-5 animate-reveal-up" style={{ animationDelay: '0.6s' }}>
                            {[
                                { emoji: '💪', text: 'Personalized Workout Plans' },
                                { emoji: '🥗', text: 'Custom Nutrition Charts' },
                                { emoji: '🏆', text: 'Expert Trainer Guidance' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center space-x-4 group/item">
                                    <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl group-hover/item:bg-red-600 transition-colors duration-300">
                                        {item.emoji}
                                    </div>
                                    <span className="text-sm font-bold text-gray-400 group-hover/item:text-white transition-colors">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-14 bg-black/40 backdrop-blur-3xl flex flex-col justify-center">
                    <div className="mb-10 animate-reveal-up" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
                            {isRegistering ? 'Start Evolution' : 'Access Zone'}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium">
                            {isRegistering ? 'Join the movement for peak performance.' : 'Enter your credentials to enter the arena.'}
                        </p>
                    </div>

                    {message && <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl mb-8 text-sm font-bold animate-reveal-scale">✓ {message}</div>}
                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-sm font-bold animate-reveal-scale">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isRegistering && (
                            <div className="space-y-2 animate-reveal-up" style={{ animationDelay: '0.4s' }}>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 font-medium"
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2 animate-reveal-up" style={{ animationDelay: '0.5s' }}>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 font-medium"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2 animate-reveal-up" style={{ animationDelay: '0.6s' }}>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secret Key (Password)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {isRegistering && (
                            <div className="space-y-2 animate-reveal-up" style={{ animationDelay: '0.7s' }}>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Role Selection</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('CLIENT')}
                                        className={`py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${role === 'CLIENT' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'border-white/5 text-gray-500 hover:border-white/20'}`}
                                    >
                                        Client
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('TRAINER')}
                                        className={`py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${role === 'TRAINER' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'border-white/5 text-gray-500 hover:border-white/20'}`}
                                    >
                                        Trainer
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 relative group overflow-hidden bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-red-900/20 active:scale-95 disabled:opacity-50 animate-reveal-up"
                            style={{ animationDelay: '0.8s' }}
                        >
                            <span className="relative z-10">{isLoading ? 'Processing...' : (isRegistering ? 'Initialize Account' : 'Enter Arena')}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </form>

                    <div className="mt-10 text-center animate-reveal-up" style={{ animationDelay: '0.9s' }}>
                        <p className="text-xs text-gray-500 font-bold tracking-tight">
                            {isRegistering ? 'ALREADY PART OF THE ELITE?' : "READY TO START EVOLUTION?"}
                            <button
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setMessage('');
                                }}
                                className="ml-2 text-white hover:text-red-500 font-black underline underline-offset-4 decoration-red-600 transition-colors"
                            >
                                {isRegistering ? 'LOGIN INSTEAD' : 'JOIN THE TRIBE'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
