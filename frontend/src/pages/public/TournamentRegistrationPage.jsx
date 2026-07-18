import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tournamentService } from '../../services/tournaments';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TournamentRegistrationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        captain_name: '',
        captain_phone: '',
        captain_email: '',
        alt_contact_person: '',
        alt_contact_phone: '',
        accepted_rules: false,
        mpesa_confirmation_code: '',
        mpesa_name: '',
        players: Array(10).fill({ name: '' })
    });

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const data = await tournamentService.getById(id);
                setTournament(data);
                
                // If there's only one category, auto-select it
                if (data.categories?.length === 1) {
                    setFormData(prev => ({ ...prev, category: data.categories[0].id }));
                }
            } catch (err) {
                toast.error('Failed to load tournament details.');
                navigate('/tournaments');
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePlayerChange = (index, value) => {
        const newPlayers = [...formData.players];
        newPlayers[index] = { name: value };
        setFormData(prev => ({ ...prev, players: newPlayers }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.accepted_rules) {
            toast.error('You must accept the tournament rules to proceed.');
            return;
        }

        if (!formData.category) {
            toast.error('Please select a team category.');
            return;
        }

        // Filter out empty player names
        const filledPlayers = formData.players.filter(p => p.name.trim() !== '');
        if (filledPlayers.length < 7) {
            toast.error('You must register at least 7 players (Starting squad).');
            return;
        }

        setSubmitting(true);
        try {
            await tournamentService.registerTeam(id, {
                ...formData,
                players: filledPlayers
            });
            
            toast.success('Team registered successfully! We will review your payment shortly.');
            navigate(`/tournaments/${id}`);
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                // Show the first error from validation response
                const firstKey = Object.keys(errorData)[0];
                toast.error(`${firstKey}: ${errorData[firstKey][0] || errorData[firstKey]}`);
            } else {
                toast.error('Registration failed. Please check your inputs and try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="relative w-24 h-24">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (!tournament) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-accent-red text-sm font-semibold tracking-wide uppercase mb-3 shadow-sm">
                        Team Registration
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                        {tournament.name}
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600 font-light">
                        7-a-Side Football Tournament
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-medium">
                        <span className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                            <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(tournament.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                            <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {tournament.venue}
                        </span>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECTION A: TEAM & CAPTAIN DETAILS */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
                        <div className="bg-gray-50 px-8 py-5 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 tracking-wide flex items-center">
                                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm">A</span>
                                Team & Captain Details
                            </h3>
                        </div>
                        
                        <div className="p-8 space-y-10">
                            {/* 1. Team Information */}
                            <div className="space-y-5">
                                <h4 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">1. Team Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Team Name <span className="text-accent-red">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                                            placeholder="Enter team name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-accent-red">*</span></label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                required
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm appearance-none"
                                            >
                                                <option value="" disabled>Select Category...</option>
                                                {tournament.categories?.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Captain Details */}
                            <div className="space-y-5">
                                <h4 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">2. Captain / Manager Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Captain's Full Name <span className="text-accent-red">*</span></label>
                                        <input
                                            type="text"
                                            name="captain_name"
                                            required
                                            value={formData.captain_name}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-accent-red">*</span></label>
                                        <input
                                            type="tel"
                                            name="captain_phone"
                                            required
                                            value={formData.captain_phone}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                                            placeholder="e.g. 0712345678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-accent-red">*</span></label>
                                        <input
                                            type="email"
                                            name="captain_email"
                                            required
                                            value={formData.captain_email}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                                            placeholder="captain@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Alt. Contact Person</label>
                                        <input
                                            type="text"
                                            name="alt_contact_person"
                                            value={formData.alt_contact_person}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Alt. Contact Number</label>
                                        <input
                                            type="tel"
                                            name="alt_contact_phone"
                                            value={formData.alt_contact_phone}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                                            placeholder="e.g. 0712345678"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Squad Roster */}
                            <div className="space-y-5">
                                <h4 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">3. Squad Roster</h4>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-800 font-medium flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Maximum 10 players: 7 starting, 3 substitutes. You must register at least 7 players.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formData.players.map((player, index) => {
                                        let labelSuffix = '';
                                        if (index === 0) labelSuffix = '(Goalkeeper)';
                                        else if (index >= 7) labelSuffix = `(Sub ${index - 6})`;
                                        
                                        return (
                                            <div key={index} className="flex items-center space-x-3 group">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 transition-colors ${index < 7 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                                                    {index + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={player.name}
                                                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                                                    required={index < 7} // First 7 are required
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                                                    placeholder={`Player Full Name ${labelSuffix}`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION B: TOURNAMENT RULES */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
                        <div className="bg-gray-50 px-8 py-5 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 tracking-wide flex items-center">
                                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm">B</span>
                                Rules & Regulations
                            </h3>
                        </div>
                        
                        <div className="p-8">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-sm text-gray-700 space-y-4 mb-6 h-56 overflow-y-auto custom-scrollbar shadow-inner">
                                <p><strong className="text-gray-900">Tournament Format:</strong> Matches will be played in a 7-a-side format.</p>
                                <p><strong className="text-gray-900">Punctuality:</strong> Teams must arrive at {tournament.venue || 'the venue'} at least 30 minutes before their scheduled kickoff. Late arrivals may result in a walkover.</p>
                                <p><strong className="text-gray-900">Code of Conduct:</strong> Bao Kibao is built on Unity, Competition, and Purpose. Violence, foul language, or unsportsmanlike behavior toward referees, opponents, or organizers will result in immediate team disqualification and may involve law enforcement.</p>
                                
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-4">
                                    <strong className="text-gray-900">Prizes & Awards:</strong>
                                    <ul className="list-none mt-3 space-y-2">
                                        <li className="flex items-center text-gray-700"><span className="text-yellow-500 mr-2 text-lg">🥇</span> 1st Place: 20,000 KSH + Trophy + Certificate</li>
                                        <li className="flex items-center text-gray-700"><span className="text-gray-400 mr-2 text-lg">🥈</span> 2nd Place: 15,000 KSH + Certificate</li>
                                        <li className="flex items-center text-gray-700"><span className="text-amber-600 mr-2 text-lg">🥉</span> 3rd Place: 10,000 KSH + Certificate</li>
                                    </ul>
                                </div>
                                
                                <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 flex items-start">
                                    <span className="text-xl mr-3">❤️</span>
                                    <p><strong className="text-red-900">Humanitarian Focus:</strong> This is a "Kick for Gaza" initiative. All proceeds go toward supporting humanitarian aid.</p>
                                </div>
                            </div>

                            <label className="flex items-start space-x-4 cursor-pointer group p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center h-5 mt-0.5">
                                    <input
                                        type="checkbox"
                                        name="accepted_rules"
                                        required
                                        checked={formData.accepted_rules}
                                        onChange={handleChange}
                                        className="w-5 h-5 border-2 border-gray-300 rounded text-primary-600 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer transition-colors"
                                    />
                                </div>
                                <div className="text-sm flex-1">
                                    <span className="font-bold text-gray-900 text-base">Captain's Declaration <span className="text-accent-red">*</span></span>
                                    <p className="text-gray-500 mt-1">
                                        I confirm that all team members have read, understood, and agreed to the Bao Kibao tournament rules and code of conduct.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* SECTION C: PAYMENT & SUBMIT */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
                        <div className="bg-gray-50 px-8 py-5 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 tracking-wide flex items-center">
                                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm">C</span>
                                Payment & Submit
                            </h3>
                        </div>
                        
                        <div className="p-8 space-y-8">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-4 shrink-0 shadow-sm">
                                        $
                                    </div>
                                    <p className="text-green-900 text-sm font-medium leading-relaxed">
                                        To officially secure your team's limited slot, the non-refundable registration fee of <strong className="text-lg bg-white px-2 py-0.5 rounded shadow-sm mx-1">2,500 KSH</strong> must be paid while filling this form as commitment, and the rest on or before the start of the tournament.
                                    </p>
                                </div>
                                
                                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-green-100 font-mono text-sm space-y-3 shadow-sm ml-14">
                                    <div className="flex items-center text-gray-700">
                                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs mr-3 font-sans font-bold">1</span>
                                        Go to M-PESA &gt; <span className="font-bold text-green-700 ml-1">Send Money</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs mr-3 font-sans font-bold">2</span>
                                        Enter Phone Number: <span className="text-green-700 text-lg font-black ml-2 tracking-wider">0718183108</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs mr-3 font-sans font-bold">3</span>
                                        Enter Amount: <span className="text-green-700 font-bold ml-2">2500</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">M-PESA Confirmation Code <span className="text-accent-red">*</span></label>
                                    <input
                                        type="text"
                                        name="mpesa_confirmation_code"
                                        required
                                        value={formData.mpesa_confirmation_code}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono uppercase transition-all shadow-sm"
                                        placeholder="e.g. SGR8A9XYZ"
                                    />
                                    <p className="mt-2 text-xs text-gray-500 font-medium">The 10-character code from your M-PESA SMS.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name Registered to M-PESA <span className="text-accent-red">*</span></label>
                                    <input
                                        type="text"
                                        name="mpesa_name"
                                        required
                                        value={formData.mpesa_name}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase transition-all shadow-sm"
                                        placeholder="e.g. JOHN DOE"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-accent-red to-primary-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-5 rounded-2xl shadow-lg shadow-red-500/30 transition-all flex justify-center items-center text-xl disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing Registration...
                                        </>
                                    ) : (
                                        'Submit Registration & Secure Slot'
                                    )}
                                </button>
                                <p className="text-center text-sm text-gray-500 mt-5 font-medium">
                                    <svg className="w-4 h-4 inline mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                    Your information is securely encrypted and submitted.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TournamentRegistrationPage;
