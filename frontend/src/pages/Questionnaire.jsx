import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

// Defined OUTSIDE the component to prevent re-creation on every render
const Input = ({ label, name, type = 'text', placeholder, required = true, value, onChange }) => (
    <div className="mb-5 group">
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-red-500 transition-colors">{label}</label>
        <input
            type={type} name={name} value={value} onChange={onChange} required={required}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all placeholder-gray-700 font-bold shadow-inner"
        />
    </div>
);

const Select = ({ label, name, options, value, onChange }) => (
    <div className="mb-5 group">
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-red-500 transition-colors">{label}</label>
        <select
            name={name} value={value} onChange={onChange}
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all font-bold shadow-inner appearance-none cursor-pointer"
        >
            {options.map(o => <option key={o} value={o} className="bg-dark-900 text-white">{o}</option>)}
        </select>
    </div>
);

const Questionnaire = () => {
    const { token, user, checkAuth } = useAuthStore();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        age: '', height: '', currentWeight: '',
        dietType: 'Non-Veg', lactoseIntolerant: false, foodAllergies: 'None',
        currentWorkout: '', currentDiet: '', injuries: 'None',
        workoutTime: 'Morning', weakParts: '', strongParts: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/profile/questionnaire', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await checkAuth(); // Refresh user state
            navigate('/plan-in-progress');
        } catch (err) {
            alert('Error submitting form: ' + err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black">
            <div className="max-w-2xl w-full glass-morphism border border-white/10 p-10 md:p-14 rounded-[3.5rem] shadow-[0_0_100px_-20px_rgba(255,,255,0.1)] relative overflow-hidden animate-reveal-scale">
                {/* Advanced Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2.5 bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-600 to-red-900 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_20px_rgba(220,38,38,0.5)]" style={{ width: `${(step / 3) * 100}%` }}>
                        <div className="w-full h-full animate-shimmer"></div>
                    </div>
                </div>

                <div className="animate-reveal-up">
                    <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Client Questionnaire</h2>
                    <p className="text-gray-500 mb-12 font-bold uppercase tracking-[0.2em] text-[10px]">Step {step} of 3</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="animate-reveal-up">
                            <h3 className="text-xl font-black text-red-500 mb-6 uppercase tracking-tight">Basic Profile</h3>
                            <Input label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="Your Full Name" />
                            <div className="grid grid-cols-2 gap-5">
                                <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="25" />
                                <Input label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} placeholder="175" />
                            </div>
                            <Input label="Bodyweight (kg)" name="currentWeight" type="number" value={formData.currentWeight} onChange={handleChange} placeholder="75" />

                            <button type="button" onClick={() => setStep(2)} className="w-full h-16 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl mt-8 transition-all transform active:scale-95 shadow-xl shadow-red-900/40 relative group overflow-hidden">
                                <span className="relative z-10">Next Step: Lifestyle →</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-reveal-up">
                            <h3 className="text-xl font-black text-red-500 mb-6 uppercase tracking-tight">Lifestyle & Nutrition</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <Select label="Veg / Non-Veg" name="dietType" value={formData.dietType} onChange={handleChange} options={['Non-Veg', 'Veg', 'Eggitarien', 'Vegan']} />
                                <Select label="Preferred Workout Time" name="workoutTime" value={formData.workoutTime} onChange={handleChange} options={['Morning', 'Afternoon', 'Evening', 'Late Night']} />
                            </div>

                            <Input label="Food Allergies" name="foodAllergies" value={formData.foodAllergies} onChange={handleChange} placeholder="Peanuts, Dairy, or None" />

                            <div className="flex items-center mb-8 bg-white/5 p-6 rounded-[1.5rem] border border-white/5 group hover:border-red-500/20 transition-colors">
                                <div className="flex items-center flex-1">
                                    <input
                                        type="checkbox" name="lactoseIntolerant"
                                        checked={formData.lactoseIntolerant} onChange={handleChange}
                                        className="w-6 h-6 rounded-lg bg-dark-800 border-white/10 text-red-600 focus:ring-red-600 transition-all cursor-pointer"
                                    />
                                    <div className="ml-5">
                                        <label className="text-sm font-black text-white block uppercase tracking-tight">Lactose Intolerant?</label>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 block">Tick if you are allergic to milk products.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 h-16 bg-white/5 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 transition-all border border-white/10">← Back</button>
                                <button type="button" onClick={() => setStep(3)} className="flex-2 h-16 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all shadow-xl shadow-red-900/40 relative group overflow-hidden">
                                    <span className="relative z-10 text-xs">Next Step: Fitness →</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-reveal-up">
                            <h3 className="text-xl font-black text-red-500 mb-6 uppercase tracking-tight">Fitness Context</h3>
                            <Input label="Current Workout Plan" name="currentWorkout" value={formData.currentWorkout} onChange={handleChange} placeholder="e.g. None, Home Workout, Gym..." />
                            <Input label="Current Diet Plan" name="currentDiet" value={formData.currentDiet} onChange={handleChange} placeholder="e.g. Normal Home Food, Keto..." />
                            <Input label="Any Injuries?" name="injuries" value={formData.injuries} onChange={handleChange} placeholder="Describe any past or current injuries" />

                            <div className="grid grid-cols-2 gap-5">
                                <Input label="Weak Body Parts" name="weakParts" value={formData.weakParts} onChange={handleChange} placeholder="e.g. Legs, Back" />
                                <Input label="Strong Body Parts" name="strongParts" value={formData.strongParts} onChange={handleChange} placeholder="e.g. Chest, Arms" />
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button type="button" onClick={() => setStep(2)} className="flex-1 h-16 bg-white/5 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 transition-all border border-white/10">← Back</button>
                                <button type="submit" disabled={loading} className="flex-2 h-16 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all shadow-xl shadow-green-900/40 relative group overflow-hidden">
                                    <span className="relative z-10 text-xs">{loading ? 'Submitting...' : 'Complete & Submit ✅'}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Questionnaire;
