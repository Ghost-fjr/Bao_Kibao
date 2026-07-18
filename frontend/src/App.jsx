import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import GalleryPage from './pages/public/GalleryPage';
import AchievementsPage from './pages/public/AchievementsPage';
import TournamentsPage from './pages/public/TournamentsPage';
import TournamentDetailsPage from './pages/public/TournamentDetailsPage';
import TournamentRegistrationPage from './pages/public/TournamentRegistrationPage';
import StorePage from './pages/public/StorePage';
import CheckoutPage from './pages/store/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DonatePage from './pages/public/DonatePage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';
import PrivacyPage from './pages/public/PrivacyPage';
import ProfilePage from './pages/profile/ProfilePage';
import PaymentLinkPage from './pages/public/PaymentLinkPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import MyTournaments from './pages/dashboard/MyTournaments';
import MyOrders from './pages/dashboard/MyOrders';
import Profile from './pages/dashboard/Profile';
// Admin Management Pages
import TournamentManagement from './pages/admin/TournamentManagement';
import TeamManagementPage from './pages/admin/TeamManagementPage';
import StoreManagement from './pages/admin/StoreManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import CMSManagement from './pages/admin/CMSManagement';
import GalleryManagement from './pages/admin/GalleryManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import PaymentsManagement from './pages/admin/PaymentsManagement';
import PaymentLinksManagement from './pages/admin/PaymentLinksManagement';
import UsersManagement from './pages/admin/UsersManagement';

import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import AdminRoute from './components/common/AdminRoute';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <ScrollToTop />
                <Toaster position="top-right" />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<LandingPage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="gallery" element={<GalleryPage />} />
                        <Route path="achievements" element={<AchievementsPage />} />
                        <Route path="tournaments" element={<TournamentsPage />} />
                        <Route path="tournaments/:id" element={<TournamentDetailsPage />} />
                        <Route path="tournaments/:id/register" element={<TournamentRegistrationPage />} />
                        <Route path="store" element={<StorePage />} />
                        <Route path="store/checkout" element={<CheckoutPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="verify-email/:token" element={<VerifyEmailPage />} />
                        <Route path="forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
                        <Route path="donate" element={<DonatePage />} />
                        <Route path="contact" element={<ContactPage />} />
                        <Route path="faq" element={<FAQPage />} />
                        <Route path="privacy" element={<PrivacyPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="pay/:code" element={<PaymentLinkPage />} />
                    </Route>

                    {/* Dashboard Routes (Protected) */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Overview />} />
                        <Route path="my-tournaments" element={<MyTournaments />} />
                        <Route path="my-orders" element={<MyOrders />} />
                        <Route path="profile" element={<Profile />} />
                        
                        {/* Admin Routes */}
                        <Route element={<AdminRoute />}>
                            <Route path="admin/tournaments" element={<TournamentManagement />} />
                            <Route path="admin/tournaments/:id/teams" element={<TeamManagementPage />} />
                            <Route path="admin/store" element={<StoreManagement />} />
                            <Route path="admin/categories" element={<CategoryManagement />} />
                            <Route path="admin/cms" element={<CMSManagement />} />
                            <Route path="admin/gallery" element={<GalleryManagement />} />
                            <Route path="admin/orders" element={<OrdersManagement />} />
                            <Route path="admin/payments" element={<PaymentsManagement />} />
                            <Route path="admin/payment-links" element={<PaymentLinksManagement />} />
                            <Route path="admin/users" element={<UsersManagement />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
