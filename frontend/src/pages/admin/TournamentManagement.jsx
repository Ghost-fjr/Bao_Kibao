import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import TeamManagementModal from '../../components/tournaments/TeamManagementModal';

const TournamentManagement = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTournament, setEditingTournament] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'men',
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
    const [modalOpen, setModalOpen] = useState(false);
    const [tournamentToDelete, setTournamentToDelete] = useState(null);
    const [toast, setToast] = useState(null);
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);

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
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category', formData.category);
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
            category: tournament.category,
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
            category: 'men',
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
        setEditingTournament(null);
        setShowForm(false);
    };

    const handleManageTeams = (tournament) => {
        setSelectedTournament(tournament);
        setTeamModalOpen(true);
    };

    if (loading) return <div className="p-6">Loading...</div>;

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

            <TeamManagementModal
                tournament={selectedTournament}
                isOpen={teamModalOpen}
                onClose={() => setTeamModalOpen(false)}
                onUpdate={fetchTournaments}
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
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                >
                                    <option value="men">Men</option>
                                    <option value="women">Women</option>
                                    <option value="mixed">Mixed</option>
                                    <option value="youth">Youth</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Venue</label>
                                <input
                                    type="text"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Max Teams</label>
                                <input
                                    type="number"
                                    value={formData.max_teams}
                                    onChange={(e) => setFormData({ ...formData, max_teams: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Registration Deadline</label>
                                <input
                                    type="date"
                                    value={formData.registration_deadline}
                                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Registration Fee</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-500">Ksh.</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.registration_fee}
                                        onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Prize Pool (Optional)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-500">Ksh.</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.prize_pool}
                                        onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                        placeholder="Total prize pool amount"
                                    />
                                </div>
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
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, banner_image: e.target.files[0] })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-accent-red hover:file:bg-red-100"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="px-8 py-3 bg-accent-red text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all transform hover:-translate-y-1">
                                {editingTournament ? 'Update' : 'Create'} Tournament
                            </button>
                            <button type="button" onClick={resetForm} className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Name</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Category</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Venue</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Start Date</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Status</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tournaments.map((tournament) => (
                                <tr key={tournament.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-medium text-gray-900">{tournament.name}</td>
                                    <td className="p-6 capitalize text-gray-600">{tournament.category}</td>
                                    <td className="p-6 text-gray-600">{tournament.venue}</td>
                                    <td className="p-6 text-gray-600">
                                        {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tournament.status === 'open' ? 'bg-green-100 text-green-800' :
                                            tournament.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {tournament.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleManageTeams(tournament)}
                                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                            >
                                                Manage Teams
                                            </button>
                                            <button
                                                onClick={() => handleEdit(tournament)}
                                                className="text-accent-black hover:text-accent-red font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(tournament)}
                                                className="text-red-400 hover:text-red-600 font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TournamentManagement;
