import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Route guard component.
 * Usage in App.jsx:
 *
 *   // Any authenticated user:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   // Admin only:
 *   <Route element={<ProtectedRoute adminOnly />}>
 *     <Route path="/dashboard/admin/..." element={<AdminPage />} />
 *   </Route>
 */
const ProtectedRoute = ({ adminOnly = false }) => {
    const location = useLocation();
    const { isAuthenticated, isAdmin, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-accent-red rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Preserve the intended destination so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin()) {
        // Authenticated but not admin — redirect to user dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
