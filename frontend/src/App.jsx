import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import GalleryPage from './pages/public/GalleryPage';
import AchievementsPage from './pages/public/AchievementsPage';
import TournamentsPage from './pages/public/TournamentsPage';
import TournamentDetailsPage from './pages/public/TournamentDetailsPage';
import StorePage from './pages/public/StorePage';
import CheckoutPage from './pages/store/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DonatePage from './pages/public/DonatePage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';
import PrivacyPage from './pages/public/PrivacyPage';
import ProfilePage from './pages/profile/ProfilePage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import TournamentManagement from './pages/admin/TournamentManagement';
import StoreManagement from './pages/admin/StoreManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import CMSManagement from './pages/admin/CMSManagement';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="gallery" element={<GalleryPage />} />
                    <Route path="achievements" element={<AchievementsPage />} />
                    <Route path="tournaments" element={<TournamentsPage />} />
                    <Route path="tournaments/:id" element={<TournamentDetailsPage />} />
                    <Route path="store" element={<StorePage />} />
                    <Route path="store/checkout" element={<CheckoutPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="donate" element={<DonatePage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="faq" element={<FAQPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Dashboard Routes (Protected) */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Overview />} />
                    <Route path="admin/tournaments" element={<TournamentManagement />} />
                    <Route path="admin/store" element={<StoreManagement />} />
                    <Route path="admin/categories" element={<CategoryManagement />} />
                    <Route path="admin/cms" element={<CMSManagement />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
