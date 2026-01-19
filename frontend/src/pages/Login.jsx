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
                // Reset optional fields
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
        <div className="min-h-screen flex items-center justify-center bg-dark-900 border-t-4 border-primary">
            <div className="bg-dark-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-dark-700">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">
                    {isRegistering ? 'Fitness Register' : 'Fitness Login'}
                </h2>

                {message && <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                            placeholder="**********"
                            required
                        />
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="CLIENT">Client</option>
                                <option value="TRAINER">Trainer</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-yellow-600 text-dark-900 font-bold py-2 px-4 rounded transition-colors"
                    >
                        {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setMessage('');
                        }}
                        className="ml-1 text-primary cursor-pointer hover:underline bg-transparent border-none p-0"
                    >
                        {isRegistering ? 'Login' : 'Register'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
