import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Pill, Info, Clock, Users, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const SupplementLibrary = ({ onSelect, isSelectionMode = false }) => {
    const { token } = useAuthStore();
    const [supplements, setSupplements] = useState([]);
    const [filteredSupplements, setFilteredSupplements] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [newSupplement, setNewSupplement] = useState({
        name: '', category: 'Protein', mainUse: '', benefits: '', whoShouldUse: '', bestTime: '', notes: ''
    });
    const [loading, setLoading] = useState(false);

    const categories = ['All', 'Protein', 'Muscle Building', 'Energy', 'Fat Loss', 'Health', 'Joint', 'Recovery', 'Hormone', 'Sleep', 'Immunity', 'Liver', 'Skin/Hair', 'General'];

    useEffect(() => {
        fetchSupplements();
    }, []);

    useEffect(() => {
        filterSupplements();
    }, [search, categoryFilter, supplements]);

    const fetchSupplements = async () => {
        setLoading(true);
        try {
            const res = await api.get('/supplements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupplements(res.data);
        } catch (error) {
            console.error('Error fetching supplements:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterSupplements = () => {
        let res = supplements;

        if (search) {
            res = res.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (categoryFilter !== 'All') {
            res = res.filter(s => s.category === categoryFilter);
        }

        setFilteredSupplements(res);
    };

    const handleCreateSupplement = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/supplements', newSupplement, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupplements([...supplements, res.data]);
            setShowAddModal(false);
            setNewSupplement({ name: '', category: 'Protein', mainUse: '', benefits: '', whoShouldUse: '', bestTime: '', notes: '' });
        } catch (error) {
            alert('Failed to create supplement');
        }
    };

    const handleCopyToPlan = (s) => {
        if (onSelect) {
            onSelect(s);
        }
    };

    return (
        <div className="h-full flex flex-col bg-dark-900 text-white rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Supplement Library</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {supplements.length} Supplements Available
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Custom
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search supplements..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-purple-600 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="appearance-none bg-black/20 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-xs font-bold uppercase text-gray-400 focus:border-purple-600 focus:text-white outline-none cursor-pointer"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-yellow-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    Consult a doctor if any medical condition exists.
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {filteredSupplements.map(s => (
                    <div key={s.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all overflow-hidden">
                        {/* Main Row */}
                        <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-600/10 flex items-center justify-center text-purple-500 font-black text-xs uppercase border border-purple-500/20">
                                    <Pill className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">{s.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/20 px-2 py-0.5 rounded">{s.category}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {onSelect && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCopyToPlan(s); }}
                                        className="px-4 py-2 bg-white/5 hover:bg-green-600 text-green-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-green-500/20 hover:border-green-500"
                                    >
                                        + Add
                                    </button>
                                )}
                                <Info className={`w-4 h-4 text-gray-500 transition-transform ${expandedId === s.id ? 'rotate-180 text-purple-500' : ''}`} />
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedId === s.id && (
                            <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-black/20 space-y-3 text-xs">
                                {s.mainUse && (
                                    <div>
                                        <span className="text-[9px] text-purple-400 font-black uppercase tracking-wider">Main Use:</span>
                                        <p className="text-gray-300 mt-1">{s.mainUse}</p>
                                    </div>
                                )}
                                {s.benefits && (
                                    <div>
                                        <span className="text-[9px] text-green-400 font-black uppercase tracking-wider">Benefits:</span>
                                        <p className="text-gray-300 mt-1">{s.benefits}</p>
                                    </div>
                                )}
                                {s.whoShouldUse && (
                                    <div className="flex items-start gap-2">
                                        <Users className="w-3 h-3 text-blue-400 mt-0.5" />
                                        <div>
                                            <span className="text-[9px] text-blue-400 font-black uppercase tracking-wider">Who Should Use:</span>
                                            <p className="text-gray-300 mt-1">{s.whoShouldUse}</p>
                                        </div>
                                    </div>
                                )}
                                {s.bestTime && (
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-3 h-3 text-yellow-400 mt-0.5" />
                                        <div>
                                            <span className="text-[9px] text-yellow-400 font-black uppercase tracking-wider">Best Time:</span>
                                            <p className="text-gray-300 mt-1">{s.bestTime}</p>
                                        </div>
                                    </div>
                                )}
                                {s.notes && s.notes !== '-' && (
                                    <div className="bg-red-500/10 text-red-400 px-3 py-2 rounded-lg border border-red-500/20 text-[10px]">
                                        <span className="font-black uppercase">Note:</span> {s.notes}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {filteredSupplements.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Pill className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">No supplements found</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-dark-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h4 className="text-lg font-black uppercase mb-4">Add Custom Supplement</h4>
                        <form onSubmit={handleCreateSupplement} className="space-y-3">
                            <input required placeholder="Supplement Name" className="w-full bg-white/5 p-3 rounded-xl text-sm border border-white/10" value={newSupplement.name} onChange={e => setNewSupplement({ ...newSupplement, name: e.target.value })} />

                            <select className="w-full bg-white/5 p-3 rounded-xl text-xs border border-white/10" value={newSupplement.category} onChange={e => setNewSupplement({ ...newSupplement, category: e.target.value })}>
                                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <input placeholder="Main Use" className="w-full bg-white/5 p-3 rounded-xl text-xs border border-white/10" value={newSupplement.mainUse} onChange={e => setNewSupplement({ ...newSupplement, mainUse: e.target.value })} />
                            <input placeholder="Benefits" className="w-full bg-white/5 p-3 rounded-xl text-xs border border-white/10" value={newSupplement.benefits} onChange={e => setNewSupplement({ ...newSupplement, benefits: e.target.value })} />
                            <input placeholder="Who Should Use" className="w-full bg-white/5 p-3 rounded-xl text-xs border border-white/10" value={newSupplement.whoShouldUse} onChange={e => setNewSupplement({ ...newSupplement, whoShouldUse: e.target.value })} />
                            <input placeholder="Best Time to Take" className="w-full bg-white/5 p-3 rounded-xl text-xs border border-white/10" value={newSupplement.bestTime} onChange={e => setNewSupplement({ ...newSupplement, bestTime: e.target.value })} />
                            <input placeholder="Notes / Warnings" className="w-full bg-white/5 p-3 rounded-xl text-xs border border-white/10" value={newSupplement.notes} onChange={e => setNewSupplement({ ...newSupplement, notes: e.target.value })} />

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 text-xs font-black uppercase hover:bg-white/10">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-xs font-black uppercase hover:bg-purple-500">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplementLibrary;
