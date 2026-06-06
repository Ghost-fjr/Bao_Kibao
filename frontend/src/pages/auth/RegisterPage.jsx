import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import BackgroundElements from '../../components/common/BackgroundElements';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData({
            username: '',
            email: '',
            password: '',
            confirm_password: '',
        });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            await authService.register(formData);
            // Auto login after registration and update global store
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration error:', err);
            console.error('Error response:', err.response?.data);
            const errorMessage = err.response?.data?.detail
                || JSON.stringify(err.response?.data)
                || 'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-b from-accent-red/70 via-accent-black/70 to-accent-green/70 relative overflow-hidden min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-accent-red selection:text-white">
            {/* Background Elements */}
            <BackgroundElements />

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="text-center">
                    <h2 className="mt-6 text-4xl font-black text-gray-900 tracking-tight">
                        Create your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-red">Account</span>
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-accent-green hover:text-green-700 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-green to-accent-red rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg animate-fade-in">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        autoComplete="off"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                                        placeholder="Choose a username"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email-address" className="block text-sm font-bold text-gray-700 mb-1">Email address</label>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="off"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                                        placeholder="Create a password"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        id="confirm-password"
                                        name="confirm_password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-accent-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-black shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating account...
                                        </span>
                                    ) : (
                                        'Sign up'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

