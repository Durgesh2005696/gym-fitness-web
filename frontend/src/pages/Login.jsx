import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

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
                navigate('/');
            }
        } catch (err) {
            // Error handled in store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden m-4">

                {/* Left Side: Branding / Image */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-red-600 to-black p-10 flex flex-col justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">
                            FIT WITH <span className="text-yellow-400">DURGESH</span>
                        </h1>
                        <p className="text-lg text-gray-200 mb-8 font-light">
                            Transform Your Body, <br />Transform Your Life.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/10 rounded-lg">💪</div>
                                <span className="text-sm text-gray-300">Personalized Workout Plans</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/10 rounded-lg">🥗</div>
                                <span className="text-sm text-gray-300">Custom Diet Charts</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/10 rounded-lg">🏆</div>
                                <span className="text-sm text-gray-300">Certified Expert Guidance</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 bg-black/60">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {isRegistering ? 'Join the Tribe' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {isRegistering ? 'Start your fitness journey today.' : 'Please enter your details to sign in.'}
                        </p>
                    </div>

                    {message && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">✓ {message}</div>}
                    {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegistering && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-dark-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
                                    placeholder="e.g. Durgesh Kumar"
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-dark-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-dark-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {isRegistering && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">I am a</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('CLIENT')}
                                        className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${role === 'CLIENT' ? 'bg-red-600 border-red-600 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                    >
                                        Client
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('TRAINER')}
                                        className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${role === 'TRAINER' ? 'bg-red-600 border-red-600 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                    >
                                        Trainer
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 rounded-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            {isRegistering ? 'Already part of the team?' : "New to Fit With Durgesh?"}
                            <button
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setMessage('');
                                }}
                                className="ml-2 text-yellow-500 hover:text-yellow-400 font-semibold focus:outline-none transition-colors"
                            >
                                {isRegistering ? 'Login Here' : 'Join Now'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
