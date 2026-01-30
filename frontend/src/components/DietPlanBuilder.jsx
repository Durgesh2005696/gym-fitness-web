import React, { useState, useEffect } from 'react';
import { Save, Activity } from 'lucide-react';

const DietPlanBuilder = ({ initialData, onSave, loading }) => {
    // Manual State: Macros + Notes
    const [plan, setPlan] = useState({
        macros: { calories: '', protein: '', carbs: '', fats: '' },
        dietNotes: ''
    });

    // Initialize
    useEffect(() => {
        if (initialData) {
            try {
                const parsed = JSON.parse(initialData);
                // Handle new manual format
                if (parsed.macros || parsed.dietNotes) {
                    setPlan({
                        macros: {
                            calories: parsed.macros?.calories || '',
                            protein: parsed.macros?.protein || '',
                            carbs: parsed.macros?.carbs || '',
                            fats: parsed.macros?.fats || ''
                        },
                        dietNotes: parsed.dietNotes || ''
                    });
                }
                // Migration support (optional, if we want to extract totals from old hybrid plan)
                else if (parsed.foodItems) {
                    // Extract totals
                    const totals = parsed.foodItems.reduce((acc, f) => ({
                        calories: acc.calories + (f.calories || 0),
                        protein: acc.protein + (f.protein || 0),
                        carbs: acc.carbs + (f.carbs || 0),
                        fats: acc.fats + (f.fat || 0)
                    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

                    setPlan({
                        macros: totals,
                        dietNotes: parsed.dietNotes || ''
                    });
                }
            } catch (e) {
                // Formatting fallback
                if (typeof initialData === 'string' && initialData.trim().length > 0 && !initialData.trim().startsWith('{')) {
                    setPlan({
                        macros: { calories: '', protein: '', carbs: '', fats: '' },
                        dietNotes: initialData
                    });
                }
            }
        }
    }, [initialData]);

    const handleMacroChange = (field, value) => {
        setPlan(prev => ({
            ...prev,
            macros: {
                ...prev.macros,
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        onSave(JSON.stringify(plan));
    };

    return (
        <div className="space-y-8">
            {/* 1. TOTAL MACROS INPUTS */}
            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-600" /> Daily Macro Targets
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block text-center">Calories</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={plan.macros.calories}
                            onChange={(e) => handleMacroChange('calories', e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-3 text-center text-2xl font-black text-white focus:border-red-600 focus:outline-none transition-all placeholder-gray-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block text-center">Protein (g)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={plan.macros.protein}
                            onChange={(e) => handleMacroChange('protein', e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-3 text-center text-2xl font-black text-red-500 focus:border-red-600 focus:outline-none transition-all placeholder-gray-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block text-center">Carbs (g)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={plan.macros.carbs}
                            onChange={(e) => handleMacroChange('carbs', e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-3 text-center text-2xl font-black text-white focus:border-red-600 focus:outline-none transition-all placeholder-gray-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block text-center">Fats (g)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={plan.macros.fats}
                            onChange={(e) => handleMacroChange('fats', e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-3 text-center text-2xl font-black text-white focus:border-red-600 focus:outline-none transition-all placeholder-gray-700"
                        />
                    </div>
                </div>
            </div>

            {/* 2. TRAINER INSTRUCTIONS */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Trainer Instructions</label>
                <div className="relative">
                    <textarea
                        className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-8 text-white h-[400px] focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder-gray-700 resize-none font-medium text-sm leading-relaxed custom-scrollbar font-mono"
                        placeholder={`Breakfast: Oats + Eggs\nLunch: Rice + Chicken\nDinner: Paneer + Roti\nWater: 3L\n\nAdd your detailed plan here...`}
                        value={plan.dietNotes}
                        onChange={e => setPlan({ ...plan, dietNotes: e.target.value })}
                    />
                    <div className="absolute top-6 right-6 pointer-events-none">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full h-16 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all shadow-xl shadow-red-900/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
            >
                {loading ? 'Deploying...' : 'Deploy Diet Plan'} 🚀
            </button>
        </div>
    );
};

export default DietPlanBuilder;
