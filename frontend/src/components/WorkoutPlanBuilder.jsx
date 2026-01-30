import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Calendar, Clock, ChevronDown, ChevronRight, X } from 'lucide-react';
import WorkoutLibrary from './WorkoutLibrary';

const WorkoutPlanBuilder = ({ initialData, onSave, loading }) => {
    // Structure: Array of Days, each with exercises
    const [days, setDays] = useState([
        { id: 1, name: 'Day 1: Full Body', exercises: [] }
    ]);
    const [activeDayId, setActiveDayId] = useState(1);
    const [showLibrary, setShowLibrary] = useState(false);

    useEffect(() => {
        if (initialData) {
            try {
                const parsed = JSON.parse(initialData);
                if (Array.isArray(parsed)) setDays(parsed);
            } catch (e) {
                console.error('Failed to parse initial plan data', e);
            }
        }
    }, [initialData]);

    const addDay = () => {
        const newId = Math.max(...days.map(d => d.id), 0) + 1;
        setDays([...days, { id: newId, name: `Day ${days.length + 1}`, exercises: [] }]);
        setActiveDayId(newId);
    };

    const removeDay = (id) => {
        if (days.length === 1) return;
        setDays(days.filter(d => d.id !== id));
        if (activeDayId === id) setActiveDayId(days[0].id);
    };

    const updateDayName = (id, name) => {
        setDays(days.map(d => d.id === id ? { ...d, name } : d));
    };

    const addExercise = (exercise) => {
        setDays(days.map(d => {
            if (d.id === activeDayId) {
                return {
                    ...d,
                    exercises: [
                        ...d.exercises,
                        {
                            id: Date.now(),
                            name: exercise.name,
                            sets: exercise.setsDefault || '3',
                            reps: exercise.repsDefault || '10',
                            rest: '60s',
                            notes: exercise.instructions || '',
                            muscleGroup: exercise.muscleGroup
                        }
                    ]
                };
            }
            return d;
        }));
        setShowLibrary(false);
    };

    const updateExercise = (dayId, exId, field, value) => {
        setDays(days.map(d => {
            if (d.id === dayId) {
                return {
                    ...d,
                    exercises: d.exercises.map(ex => ex.id === exId ? { ...ex, [field]: value } : ex)
                };
            }
            return d;
        }));
    };

    const removeExercise = (dayId, exId) => {
        setDays(days.map(d => {
            if (d.id === dayId) {
                return {
                    ...d,
                    exercises: d.exercises.filter(ex => ex.id !== exId)
                };
            }
            return d;
        }));
    };

    const handleSave = () => {
        onSave(JSON.stringify(days));
    };

    return (
        <div className="flex flex-col h-[70vh] bg-dark-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">

            {/* Toolbar */}
            <div className="bg-white/5 border-b border-white/5 p-4 flex justify-between items-center">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0 max-w-[60%]">
                    {days.map(day => (
                        <button
                            key={day.id}
                            onClick={() => setActiveDayId(day.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${activeDayId === day.id
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'bg-black/20 text-gray-500 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {day.name}
                            {days.length > 1 && (
                                <X
                                    className="w-3 h-3 hover:text-red-300"
                                    onClick={(e) => { e.stopPropagation(); removeDay(day.id); }}
                                />
                            )}
                        </button>
                    ))}
                    <button onClick={addDay} className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-900/20 flex items-center gap-2"
                >
                    <Save className="w-4 h-4" /> Save Plan
                </button>
            </div>

            {/* Content for Active Day */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Editor */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6">
                    {days.filter(d => d.id === activeDayId).map(day => (
                        <div key={day.id}>
                            <input
                                type="text"
                                className="w-full bg-transparent text-2xl font-black text-white uppercase tracking-tight focus:outline-none border-b border-white/10 pb-2 mb-6 focus:border-red-600 transition-colors placeholder-gray-700"
                                value={day.name}
                                onChange={(e) => updateDayName(day.id, e.target.value)}
                                placeholder="Day Name (e.g. Chest & Triceps)"
                            />

                            <div className="space-y-4">
                                {day.exercises.map((ex, idx) => (
                                    <div key={ex.id} className="group bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center text-xs font-black">{idx + 1}</span>
                                                <h4 className="text-lg font-bold text-white uppercase">{ex.name}</h4>
                                                <span className="text-[10px] bg-black/30 px-2 py-1 rounded text-gray-500 uppercase font-bold">{ex.muscleGroup}</span>
                                            </div>
                                            <button onClick={() => removeExercise(day.id, ex.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Sets</label>
                                                <input
                                                    className="w-full bg-black/20 rounded-lg p-2 text-xs font-mono text-white border border-white/5 focus:border-red-600 outline-none"
                                                    value={ex.sets}
                                                    onChange={(e) => updateExercise(day.id, ex.id, 'sets', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Reps</label>
                                                <input
                                                    className="w-full bg-black/20 rounded-lg p-2 text-xs font-mono text-white border border-white/5 focus:border-red-600 outline-none"
                                                    value={ex.reps}
                                                    onChange={(e) => updateExercise(day.id, ex.id, 'reps', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Rest</label>
                                                <input
                                                    className="w-full bg-black/20 rounded-lg p-2 text-xs font-mono text-white border border-white/5 focus:border-red-600 outline-none"
                                                    value={ex.rest}
                                                    onChange={(e) => updateExercise(day.id, ex.id, 'rest', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1 col-span-3 md:col-span-1">
                                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Notes</label>
                                                <input
                                                    className="w-full bg-black/20 rounded-lg p-2 text-xs text-gray-400 border border-white/5 focus:border-red-600 outline-none"
                                                    value={ex.notes}
                                                    onChange={(e) => updateExercise(day.id, ex.id, 'notes', e.target.value)}
                                                    placeholder="Technique cues..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => setShowLibrary(true)}
                                    className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-red-600/50 hover:bg-red-600/5 text-gray-500 hover:text-red-500 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add Exercise
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Library Modal Overlay */}
            {showLibrary && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl p-4 md:p-12 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Exercise Library</h3>
                        <button onClick={() => setShowLibrary(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden relative border border-white/10 rounded-2xl shadow-2xl">
                        <WorkoutLibrary
                            onSelect={addExercise}
                            isSelectionMode={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutPlanBuilder;
