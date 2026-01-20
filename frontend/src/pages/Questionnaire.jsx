import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const Questionnaire = () => {
    const { token, user, checkAuth } = useAuthStore();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
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

    const Input = ({ label, name, type = 'text', placeholder }) => (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
            <input
                type={type} name={name} value={formData[name]} onChange={handleChange} required
                placeholder={placeholder}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none"
            />
        </div>
    );

    const Select = ({ label, name, options }) => (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
            <select
                name={name} value={formData[name]} onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none"
            >
                {options.map(o => <option key={o} value={o} className="bg-dark-900">{o}</option>)}
            </select>
        </div>
    );

    return (
        <div className="min-h-screen bg-black p-6 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full bg-dark-900 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-800">
                    <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                <h2 className="text-3xl font-black text-white mb-2 mt-4">Profile Setup 📝</h2>
                <p className="text-gray-400 mb-8">Help me build your perfect plan.</p>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-red-500 mb-4">Basic Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Age" name="age" type="number" placeholder="25" />
                                <Input label="Height (cm)" name="height" type="number" placeholder="175" />
                            </div>
                            <Input label="Current Weight (kg)" name="currentWeight" type="number" placeholder="75" />
                            <Select label="Diet Preference" name="dietType" options={['Non-Veg', 'Veg', 'Eggitarien', 'Vegan']} />

                            <div className="flex items-center mb-6">
                                <input
                                    type="checkbox" name="lactoseIntolerant"
                                    checked={formData.lactoseIntolerant} onChange={handleChange}
                                    className="w-5 h-5 rounded bg-dark-800 border-gray-600 text-red-600 focus:ring-red-500"
                                />
                                <label className="ml-2 text-sm text-gray-300">I am Lactose Intolerant</label>
                            </div>
                            <button type="button" onClick={() => setStep(2)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl">Next Step →</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-red-500 mb-4">Current Lifestyle</h3>
                            <Input label="Work/Eateries Schedule" name="workoutTime" placeholder="e.g. 9-5 Job, Workout at 6PM" />
                            <Input label="Current Diet" name="currentDiet" placeholder="What did you eat yesterday?" />
                            <Input label="Current Workout" name="currentWorkout" placeholder="Push/Pull/Legs or None..." />
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-dark-700 text-white font-bold py-3 rounded-xl">← Back</button>
                                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl">Next Step →</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-red-500 mb-4">Medical & Goals</h3>
                            <Input label="Any Injuries?" name="injuries" placeholder="Lower back pain, knee issues, or None" />
                            <Input label="Food Allergies" name="foodAllergies" placeholder="Peanuts, Shellfish, or None" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Weakest Body Part" name="weakParts" placeholder="e.g. Legs" />
                                <Input label="Strongest Body Part" name="strongParts" placeholder="e.g. Chest" />
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-dark-700 text-white font-bold py-3 rounded-xl">← Back</button>
                                <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl">
                                    {loading ? 'Saving...' : 'Submit Profile ✅'}
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
