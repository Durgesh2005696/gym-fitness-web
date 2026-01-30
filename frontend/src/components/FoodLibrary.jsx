import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Info, X, Check } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const FoodLibrary = ({ onSelectMode, onSelectFood, onClose }) => {
    const { token } = useAuthStore();
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeType, setActiveType] = useState('All'); // Veg/Non-Veg
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null); // For detail view

    // New Food Form State
    const [newFood, setNewFood] = useState({
        foodName: '',
        category: 'Snack',
        vegType: 'Veg',
        caloriesPer100g: '',
        proteinPer100g: '',
        carbsPer100g: '',
        fatPer100g: '',
        fiberPer100g: '',
        // Micros
        calcium: '', iron: '', magnesium: '', potassium: '', sodium: '', zinc: '',
        vitaminA: '', vitaminB6: '', vitaminB12: '', vitaminC: '', vitaminD: '', vitaminE: ''
    });

    const CATEGORIES = ['All', 'Protein', 'Carb', 'Fat', 'Fruit', 'Vegetable', 'Dairy', 'Nuts', 'Seeds', 'Grains', 'Snack'];
    const TYPES = ['All', 'Veg', 'Non-Veg'];

    useEffect(() => {
        fetchFoods();
    }, [activeCategory, activeType, searchTerm]); // Debounce search in production

    const fetchFoods = async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeCategory !== 'All') params.category = activeCategory;
            if (activeType !== 'All') params.vegType = activeType;
            if (searchTerm) params.search = searchTerm;

            const { data } = await api.get('/foods', { params, headers: { Authorization: `Bearer ${token}` } });
            setFoods(data);
        } catch (error) {
            console.error('Error fetching foods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFood = async () => {
        try {
            const payload = { ...newFood };
            // Convert strings to floats
            Object.keys(payload).forEach(key => {
                if (key !== 'foodName' && key !== 'category' && key !== 'vegType') {
                    payload[key] = parseFloat(payload[key] || 0);
                }
            });

            await api.post('/foods', payload, { headers: { Authorization: `Bearer ${token}` } });
            setShowAddModal(false);
            setNewFood({
                foodName: '', category: 'Snack', vegType: 'Veg',
                caloriesPer100g: '', proteinPer100g: '', carbsPer100g: '', fatPer100g: '', fiberPer100g: '',
                calcium: '', iron: '', magnesium: '', potassium: '', sodium: '', zinc: '',
                vitaminA: '', vitaminB6: '', vitaminB12: '', vitaminC: '', vitaminD: '', vitaminE: ''
            });
            fetchFoods();
        } catch (error) {
            alert('Failed to add food');
        }
    };

    return (
        <div className="bg-dark-800 rounded-[3rem] p-8 h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">Food Library</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Professional Nutrition Database (Per 100g reference)</p>
                </div>
                {onSelectMode && (
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
                <div className="md:col-span-2 relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search foods (e.g., Chicken, Oats)..."
                        className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="px-4 py-4 bg-black/40 border border-white/5 rounded-2xl text-gray-300 focus:border-green-500 focus:outline-none appearance-none cursor-pointer hover:bg-white/5"
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex gap-2">
                    <select
                        value={activeType}
                        onChange={(e) => setActiveType(e.target.value)}
                        className="flex-1 px-4 py-4 bg-black/40 border border-white/5 rounded-2xl text-gray-300 focus:border-green-500 focus:outline-none appearance-none cursor-pointer"
                    >
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-4 bg-green-600 hover:bg-green-500 rounded-2xl text-white transition-colors shadow-lg shadow-green-900/20"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Food Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {foods.map(food => (
                            <div
                                key={food.id}
                                onClick={() => onSelectMode ? onSelectFood(food) : setSelectedFood(food)}
                                className={`group p-6 bg-white/5 border border-white/5 hover:border-green-500/30 rounded-[2rem] transition-all cursor-pointer relative overflow-hidden ${onSelectMode ? 'hover:scale-[1.02]' : ''}`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <Info className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg mb-2 inline-block ${food.vegType === 'Veg' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {food.vegType}
                                        </span>
                                        <h4 className="text-white font-bold text-lg leading-tight mt-1">{food.foodName}</h4>
                                        <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-wide">{food.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-white">{Math.round(food.caloriesPer100g)}</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Kcal / 100g</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-1 mt-4 pt-4 border-t border-white/5">
                                    <div className="text-center">
                                        <p className="text-[8px] text-gray-500 font-black uppercase">Pro</p>
                                        <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{food.proteinPer100g}g</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] text-gray-500 font-black uppercase">Carb</p>
                                        <p className="text-sm font-bold text-white">{food.carbsPer100g}g</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] text-gray-500 font-black uppercase">Fat</p>
                                        <p className="text-sm font-bold text-white">{food.fatPer100g}g</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] text-gray-500 font-black uppercase">Fib</p>
                                        <p className="text-sm font-bold text-gray-400">{food.fiberPer100g || 0}g</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DETAIL MODAL (Micronutrients) */}
            {selectedFood && !onSelectMode && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFood(null)}>
                    <div className="bg-dark-800 border border-white/10 rounded-[2.5rem] max-w-2xl w-full p-8 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setSelectedFood(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="mb-8">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl mb-3 inline-block ${selectedFood.vegType === 'Veg' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {selectedFood.category} • {selectedFood.vegType}
                            </span>
                            <h2 className="text-4xl font-black text-white mb-2">{selectedFood.foodName}</h2>
                            <p className="text-gray-500 font-medium">Per 100g Serving</p>
                        </div>

                        {/* Macros */}
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                                <p className="text-[10px] uppercase font-black text-gray-500">Calories</p>
                                <p className="text-2xl font-black text-white">{selectedFood.caloriesPer100g}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                                <p className="text-[10px] uppercase font-black text-gray-500">Protein</p>
                                <p className="text-2xl font-black text-green-500">{selectedFood.proteinPer100g}g</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                                <p className="text-[10px] uppercase font-black text-gray-500">Carbs</p>
                                <p className="text-2xl font-black text-white">{selectedFood.carbsPer100g}g</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                                <p className="text-[10px] uppercase font-black text-gray-500">Fats</p>
                                <p className="text-2xl font-black text-white">{selectedFood.fatPer100g}g</p>
                            </div>
                        </div>

                        {/* Micros Grid */}
                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> Micronutrients</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                                {[
                                    { label: 'Calcium', val: selectedFood.calcium, unit: 'mg' },
                                    { label: 'Iron', val: selectedFood.iron, unit: 'mg' },
                                    { label: 'Magnesium', val: selectedFood.magnesium, unit: 'mg' },
                                    { label: 'Potassium', val: selectedFood.potassium, unit: 'mg' },
                                    { label: 'Sodium', val: selectedFood.sodium, unit: 'mg' },
                                    { label: 'Zinc', val: selectedFood.zinc, unit: 'mg' },
                                    { label: 'Vit A', val: selectedFood.vitaminA, unit: 'IU' },
                                    { label: 'Vit B6', val: selectedFood.vitaminB6, unit: 'mg' },
                                    { label: 'Vit B12', val: selectedFood.vitaminB12, unit: 'mcg' },
                                    { label: 'Vit C', val: selectedFood.vitaminC, unit: 'mg' },
                                    { label: 'Vit D', val: selectedFood.vitaminD, unit: 'IU' },
                                    { label: 'Vit E', val: selectedFood.vitaminE, unit: 'mg' },
                                ].map((m, i) => (
                                    <div key={i} className={`flex justify-between items-center ${!m.val ? 'opacity-30' : ''}`}>
                                        <span className="text-xs text-gray-500 font-bold uppercase">{m.label}</span>
                                        <span className="text-sm text-white font-mono">{m.val || 0}{m.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD FOOD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-800 border border-white/10 rounded-[2rem] max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-white uppercase">Add Custom Food</h3>
                            <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-gray-500 hover:text-white" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Food Name</label>
                                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                                    value={newFood.foodName} onChange={e => setNewFood({ ...newFood, foodName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Category</label>
                                <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                                    value={newFood.category} onChange={e => setNewFood({ ...newFood, category: e.target.value })}
                                >
                                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Type</label>
                                <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                                    value={newFood.vegType} onChange={e => setNewFood({ ...newFood, vegType: e.target.value })}
                                >
                                    <option value="Veg">Veg</option>
                                    <option value="Non-Veg">Non-Veg</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Macros per 100g</h4>
                            <div className="grid grid-cols-5 gap-3">
                                {['caloriesPer100g', 'proteinPer100g', 'carbsPer100g', 'fatPer100g', 'fiberPer100g'].map(f => (
                                    <div key={f}>
                                        <label className="text-[10px] text-gray-500 uppercase block mb-1">{f.replace('Per100g', '')}</label>
                                        <input type="number" className="w-full bg-black/40 border-white/10 rounded-lg p-2 text-white text-sm"
                                            value={newFood[f]} onChange={e => setNewFood({ ...newFood, [f]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 mb-6">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Micronutrients (Optional)</h4>
                            <div className="grid grid-cols-4 gap-3">
                                {['calcium', 'iron', 'magnesium', 'potassium', 'sodium', 'zinc', 'vitaminA', 'vitaminC', 'vitaminD'].map(m => (
                                    <div key={m}>
                                        <label className="text-[10px] text-gray-500 uppercase block mb-1">{m}</label>
                                        <input type="number" className="w-full bg-white/5 border-white/5 rounded-lg p-2 text-white text-xs"
                                            value={newFood[m]} onChange={e => setNewFood({ ...newFood, [m]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleCreateFood} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase rounded-xl transition-colors">
                            Add to Library
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodLibrary;
