import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import PageSkeleton from '../../components/common/PageSkeleton';

const TournamentManagement = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTournament, setEditingTournament] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        venue: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        registration_fee: '',
        max_teams: '',
        rules: '',
        prizes: '',
        prize_pool: '',
        status: 'open',
        banner_image: null
    });
    // Categories state - array of category objects
    const [categories, setCategories] = useState([
        { name: '', short_name: '', min_age: '', max_age: '', max_teams: '', registration_fee: '' }
    ]);
    const [modalOpen, setModalOpen] = useState(false);
    const [tournamentToDelete, setTournamentToDelete] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const response = await api.get('/tournaments/tournaments/');
            const data = response.data.results || response.data;
            setTournaments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            setToast({ message: 'Failed to fetch tournaments', type: 'error' });
            setTournaments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate at least one category
        const validCategories = categories.filter(c => c.name.trim());
        if (validCategories.length === 0) {
            setToast({ message: 'Please add at least one category', type: 'error' });
            return;
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('venue', formData.venue);
            data.append('start_date', formData.start_date);
            data.append('end_date', formData.end_date);
            data.append('registration_deadline', formData.registration_deadline);
            data.append('registration_fee', formData.registration_fee);
            data.append('max_teams', formData.max_teams);
            data.append('rules', formData.rules || '');
            data.append('prizes', formData.prizes || '');
            if (formData.prize_pool) {
                data.append('prize_pool', formData.prize_pool);
            }
            data.append('status', formData.status);
            if (formData.banner_image) {
                data.append('banner_image', formData.banner_image);
            }

            // Add categories as JSON
            data.append('categories_data', JSON.stringify(validCategories));

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (editingTournament) {
                await api.put(`/tournaments/tournaments/${editingTournament.id}/`, data, config);
                setToast({ message: 'Tournament updated successfully', type: 'success' });
            } else {
                await api.post('/tournaments/tournaments/', data, config);
                setToast({ message: 'Tournament created successfully', type: 'success' });
            }
            fetchTournaments();
            resetForm();
        } catch (error) {
            console.error('Error saving tournament:', error);
            setToast({ message: 'Failed to save tournament', type: 'error' });
        }
    };

    const handleEdit = (tournament) => {
        setEditingTournament(tournament);
        setFormData({
            name: tournament.name,
            description: tournament.description,
            venue: tournament.venue,
            start_date: tournament.start_date ? tournament.start_date.split('T')[0] : '',
            end_date: tournament.end_date ? tournament.end_date.split('T')[0] : '',
            registration_deadline: tournament.registration_deadline ? tournament.registration_deadline.split('T')[0] : '',
            registration_fee: tournament.registration_fee,
            max_teams: tournament.max_teams,
            rules: tournament.rules || '',
            prizes: tournament.prizes || '',
            prize_pool: tournament.prize_pool || '',
            status: tournament.status,
            banner_image: null
        });
        // Load existing categories
        if (tournament.categories && tournament.categories.length > 0) {
            setCategories(tournament.categories.map(c => ({
                id: c.id,
                name: c.name,
                short_name: c.short_name || '',
                min_age: c.min_age || '',
                max_age: c.max_age || '',
                max_teams: c.max_teams || '',
                registration_fee: c.registration_fee || ''
            })));
        } else {
            setCategories([{ name: '', short_name: '', min_age: '', max_age: '', max_teams: '', registration_fee: '' }]);
        }
        setShowForm(true);
    };

    const confirmDelete = (tournament) => {
        setTournamentToDelete(tournament);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!tournamentToDelete) return;
        try {
            await api.delete(`/tournaments/tournaments/${tournamentToDelete.id}/`);
            setToast({ message: 'Tournament deleted successfully', type: 'success' });
            fetchTournaments();
        } catch (error) {
            console.error('Error deleting tournament:', error);
            setToast({ message: 'Failed to delete tournament', type: 'error' });
        } finally {
            setModalOpen(false);
            setTournamentToDelete(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            venue: '',
            start_date: '',
            end_date: '',
            registration_deadline: '',
            registration_fee: '',
            max_teams: '',
            rules: '',
            prizes: '',
            prize_pool: '',
            status: 'open',
            banner_image: null
        });
        setCategories([{ name: '', short_name: '', min_age: '', max_age: '', max_teams: '', registration_fee: '' }]);
        setEditingTournament(null);
        setShowForm(false);
    };

    const handleManageTeams = (tournament) => {
        navigate(`/dashboard/admin/tournaments/${tournament.id}/teams`);
    };

    // Category management functions
    const addCategory = () => {
        setCategories([...categories, { name: '', short_name: '', min_age: '', max_age: '', max_teams: '', registration_fee: '' }]);
    };

    const removeCategory = (index) => {
        if (categories.length > 1) {
            setCategories(categories.filter((_, i) => i !== index));
        }
    };

    const updateCategory = (index, field, value) => {
        const updated = [...categories];
        updated[index][field] = value;
        setCategories(updated);
    };

    // Quick category presets
    const addPresetCategories = () => {
        setCategories([
            { name: 'Under 12', short_name: 'U12', min_age: '', max_age: '12', max_teams: '', registration_fee: '' },
            { name: 'Under 16', short_name: 'U16', min_age: '13', max_age: '16', max_teams: '', registration_fee: '' },
            { name: 'Under 18', short_name: 'U18', min_age: '17', max_age: '18', max_teams: '', registration_fee: '' },
            { name: 'Open/Adults', short_name: 'Open', min_age: '18', max_age: '', max_teams: '', registration_fee: '' }
        ]);
    };

    if (loading) return <PageSkeleton type="dashboard" />;

    return (
        <div className="p-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Tournament"
                message={`Are you sure you want to delete the tournament "${tournamentToDelete?.name}"? This action cannot be undone.`}
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-accent-black tracking-tight">Tournament Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-accent-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all transform hover:-translate-y-1 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {showForm ? 'Cancel' : 'Add Tournament'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-accent-black mb-6">{editingTournament ? 'Edit Tournament' : 'Create New Tournament'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tournament Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    placeholder="e.g., Summer Beach Cup 2024"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Venue *</label>
                                <input
                                    type="text"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                rows="3"
                                required
                            />
                        </div>

                        {/* Categories Section */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Categories / Age Groups *</h3>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={addPresetCategories}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                    >
                                        Use Presets (U12, U16, U18, Open)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addCategory}
                                        className="px-3 py-1 bg-accent-green text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                                    >
                                        + Add Category
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {categories.map((cat, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 relative">
                                        {categories.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Name *</label>
                                                <input
                                                    type="text"
                                                    value={cat.name}
                                                    onChange={(e) => updateCategory(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-accent-red text-sm"
                                                    placeholder="e.g., Under 16"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Short Name</label>
                                                <input
                                                    type="text"
                                                    value={cat.short_name}
                                                    onChange={(e) => updateCategory(index, 'short_name', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-accent-red text-sm"
                                                    placeholder="e.g., U16"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Min Age</label>
                                                <input
                                                    type="number"
                                                    value={cat.min_age}
                                                    onChange={(e) => updateCategory(index, 'min_age', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-accent-red text-sm"
                                                    placeholder="13"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Max Age</label>
                                                <input
                                                    type="number"
                                                    value={cat.max_age}
                                                    onChange={(e) => updateCategory(index, 'max_age', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-accent-red text-sm"
                                                    placeholder="16"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Max Teams</label>
                                                <input
                                                    type="number"
                                                    value={cat.max_teams}
                                                    onChange={(e) => updateCategory(index, 'max_teams', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-accent-red text-sm"
                                                    placeholder="8"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Date *</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Registration Deadline *</label>
                                <input
                                    type="date"
                                    value={formData.registration_deadline}
                                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Default Registration Fee (KES) *</label>
                                <input
                                    type="number"
                                    value={formData.registration_fee}
                                    onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Default Max Teams Per Category *</label>
                                <input
                                    type="number"
                                    value={formData.max_teams}
                                    onChange={(e) => setFormData({ ...formData, max_teams: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Prize Pool (KES)</label>
                                <input
                                    type="number"
                                    value={formData.prize_pool}
                                    onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Rules</label>
                                <textarea
                                    value={formData.rules}
                                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Prizes Description</label>
                                <textarea
                                    value={formData.prizes}
                                    onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="open">Open for Registration</option>
                                    <option value="closed">Registration Closed</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFormData({ ...formData, banner_image: e.target.files[0] })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-accent-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
                            >
                                {editingTournament ? 'Update Tournament' : 'Create Tournament'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tournaments List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tournaments.map((tournament) => (
                    <div key={tournament.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                        {tournament.banner_image && (
                            <div className="h-40 bg-gray-200">
                                <img src={tournament.banner_image} alt={tournament.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-gray-900">{tournament.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tournament.status === 'open' ? 'bg-green-100 text-green-800' :
                                        tournament.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                            tournament.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {tournament.status}
                                </span>
                            </div>

                            {/* Categories Display */}
                            {tournament.categories && tournament.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {tournament.categories.map((cat, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                                            {cat.short_name || cat.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tournament.description}</p>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                <p><span className="text-gray-500">📍</span> {tournament.venue}</p>
                                <p><span className="text-gray-500">📅</span> {new Date(tournament.start_date).toLocaleDateString()}</p>
                                <p><span className="text-gray-500">👥</span> {tournament.approved_teams_count || 0}/{tournament.max_teams} teams</p>
                                <p><span className="text-gray-500">💰</span> KES {tournament.registration_fee}</p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleManageTeams(tournament)}
                                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm"
                                >
                                    Manage Teams
                                </button>
                                <button
                                    onClick={() => handleEdit(tournament)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => confirmDelete(tournament)}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {tournaments.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Tournaments Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first tournament to get started</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 bg-accent-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                        Create Tournament
                    </button>
                </div>
            )}
        </div>
    );
};

export default TournamentManagement;
