import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';

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

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tournament Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    {showForm ? 'Cancel' : 'Add Tournament'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="men">Men</option>
                                    <option value="women">Women</option>
                                    <option value="mixed">Mixed</option>
                                    <option value="youth">Youth</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Venue</label>
                                <input
                                    type="text"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Max Teams</label>
                                <input
                                    type="number"
                                    value={formData.max_teams}
                                    onChange={(e) => setFormData({ ...formData, max_teams: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Registration Deadline</label>
                                <input
                                    type="date"
                                    value={formData.registration_deadline}
                                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Registration Fee</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.registration_fee}
                                    onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Prize Pool (Optional)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.prize_pool}
                                    onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                                    className="input-field"
                                    placeholder="Total prize pool amount"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Banner Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, banner_image: e.target.files[0] })}
                                className="input-field"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="btn-primary">
                                {editingTournament ? 'Update' : 'Create'} Tournament
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Category</th>
                            <th className="text-left p-3">Venue</th>
                            <th className="text-left p-3">Start Date</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tournaments.map((tournament) => (
                            <tr key={tournament.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{tournament.name}</td>
                                <td className="p-3 capitalize">{tournament.category}</td>
                                <td className="p-3">{tournament.venue}</td>
                                <td className="p-3">
                                    {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs ${tournament.status === 'open' ? 'bg-green-100 text-green-800' :
                                        tournament.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {tournament.status}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleEdit(tournament)}
                                        className="text-blue-600 hover:underline mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(tournament)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TournamentManagement;

