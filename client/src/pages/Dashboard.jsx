import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';

// Import ALL Dashboards
import AdminDashboard from './AdminDashboard'; 
import ManagerDashboard from './ManagerDashboard';
import UserDashboard from './UserDashboard'; 

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
    // If we are done loading and there is still no user, kick them out
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    console.log('🔍 User from AuthContext:', user);
    console.log('📧 Email:', user?.email);
    console.log('👤 Role:', user?.role);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper to determine which dashboard to show
    const renderContent = () => {
        switch (user?.role) {
            case 'Admin':
                return <AdminDashboard />;
            case 'Manager':
                return <ManagerDashboard />;
            default:
                return <UserDashboard user={user} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="text-blue-600 h-8 w-8" />
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Quantrust Secure</h1>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                        <div className="flex justify-end">
                            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide ${
                                user?.role === 'Admin' ? 'bg-red-100 text-red-600' :
                                user?.role === 'Manager' ? 'bg-purple-100 text-purple-600' :
                                'bg-gray-100 text-gray-500'
                            }`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="p-8">
                {renderContent()}
            </main>
        </div>
    );
}