import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Dumbbell, Activity, Flame, ChevronRight, X } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const WorkoutLibrary = ({ onSelect, isSelectionMode = false }) => {
    const { token } = useAuthStore();
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState({ muscle: 'All', equipment: 'All' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [newExercise, setNewExercise] = useState({
        name: '', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner',
        setsDefault: '3', repsDefault: '10'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        filterExercises();
    }, [search, filter, exercises]);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const res = await api.get('/exercises', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExercises(res.data);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterExercises = () => {
        let res = exercises;

        if (search) {
            res = res.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (filter.muscle !== 'All') {
            res = res.filter(e => e.muscleGroup === filter.muscle);
        }
        if (filter.equipment !== 'All') {
            res = res.filter(e => e.equipment === filter.equipment);
        }

        setFilteredExercises(res);
    };

    const handleCreateExercise = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/exercises', newExercise, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExercises([...exercises, res.data]);
            setShowAddModal(false);
            setNewExercise({
                name: '', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner',
                setsDefault: '3', repsDefault: '10'
            });
            if (onSelect) onSelect(res.data);
        } catch (error) {
            alert('Failed to create exercise');
        }
    };

    return (
        <div className="h-full flex flex-col bg-dark-900 text-white rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Workout Library</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {exercises.length} Exercises Available
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Custom
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-red-600 focus:outline-none transition-colors"
                        />
                    </div>
                    {/* Muscle Filter */}
                    <div className="relative group">
                        <select
                            value={filter.muscle}
                            onChange={e => setFilter({ ...filter, muscle: e.target.value })}
                            className="appearance-none bg-black/20 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-xs font-bold uppercase text-gray-400 focus:border-red-600 focus:text-white outline-none cursor-pointer"
                        >
                            <option value="All">All Muscles</option>
                            <option value="Chest">Chest</option>
                            <option value="Back">Back</option>
                            <option value="Legs">Legs</option>
                            <option value="Shoulders">Shoulders</option>
                            <option value="Arms">Arms</option>
                            <option value="Core">Core</option>
                            <option value="Cardio">Cardio</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {filteredExercises.map(ex => (
                    <div key={ex.id} className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 font-black text-xs uppercase border border-red-500/20">
                                {ex.muscleGroup.substring(0, 2)}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-white group-hover:text-red-500 transition-colors">{ex.name}</h4>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/20 px-2 py-0.5 rounded">{ex.equipment}</span>
                                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/20 px-2 py-0.5 rounded">{ex.difficulty}</span>
                                </div>
                            </div>
                        </div>

                        {onSelect ? (
                            <button
                                onClick={() => onSelect(ex)}
                                className="px-4 py-2 bg-white/5 hover:bg-green-600 text-green-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-green-500/20 hover:border-green-500"
                            >
                                + Add
                            </button>
                        ) : (
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Defaults</p>
                                <p className="text-xs font-mono text-gray-300">{ex.setsDefault} x {ex.repsDefault}</p>
                            </div>
                        )}
                    </div>
                ))}
                {filteredExercises.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Dumbbell className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">No exercises found</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-dark-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h4 className="text-lg font-black uppercase mb-4">Add Custom Exercise</h4>
                        <form onSubmit={handleCreateExercise} className="space-y-3">
                            <input required placeholder="Exercise Name" className="w-full bg-white/5 p-3 rounded-xl text-sm border border-white/10" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} />

                            <div className="grid grid-cols-2 gap-3">
                                <select className="bg-white/5 p-3 rounded-xl text-xs" value={newExercise.muscleGroup} onChange={e => setNewExercise({ ...newExercise, muscleGroup: e.target.value })}>
                                    <option value="Chest">Chest</option>
                                    <option value="Back">Back</option>
                                    <option value="Legs">Legs</option>
                                    <option value="Shoulders">Shoulders</option>
                                    <option value="Arms">Arms</option>
                                    <option value="Core">Core</option>
                                    <option value="Cardio">Cardio</option>
                                </select>
                                <select className="bg-white/5 p-3 rounded-xl text-xs" value={newExercise.category} onChange={e => setNewExercise({ ...newExercise, category: e.target.value })}>
                                    <option value="Strength">Strength</option>
                                    <option value="Cardio">Cardio</option>
                                    <option value="Bodyweight">Bodyweight</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="Sets (e.g. 3)" className="bg-white/5 p-3 rounded-xl text-xs border border-white/10" value={newExercise.setsDefault} onChange={e => setNewExercise({ ...newExercise, setsDefault: e.target.value })} />
                                <input placeholder="Reps (e.g. 10-12)" className="bg-white/5 p-3 rounded-xl text-xs border border-white/10" value={newExercise.repsDefault} onChange={e => setNewExercise({ ...newExercise, repsDefault: e.target.value })} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 text-xs font-black uppercase hover:bg-white/10">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-black uppercase hover:bg-red-500">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutLibrary;
