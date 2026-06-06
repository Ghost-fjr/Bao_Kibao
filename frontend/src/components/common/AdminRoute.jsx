import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AdminRoute = () => {
    const { isAdmin, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-accent-red rounded-full animate-spin border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (!isAdmin()) {
        // Redirect non-admin users to the dashboard overview
        return <Navigate to="/dashboard" replace />;
    }

    // If admin, render the child routes
    return <Outlet />;
};

export default AdminRoute;
