import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Clock, Fingerprint } from 'lucide-react';

const UserDashboard = () => {
    // 1. Get the current logged-in user (Same as Manager Dashboard)
    const { user } = useAuth();

    // Helper to format the token expiration nicely
    const getSessionExpiry = () => {
        if (!user?.token) return "Unknown";
        try {
            // Decode the payload part of the JWT (Part 2)
            const payload = JSON.parse(atob(user.token.split('.')[1]));
            const exp = new Date(payload.exp * 1000);
            return exp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return "Unknown";
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="bg-blue-50 p-4 rounded-full shadow-sm">
                        <User className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                        <p className="text-gray-500 font-medium">Welcome back, {user?.email}</p>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border border-green-200 shadow-sm">
                        ACTIVE SESSION
                    </span>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Identity Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                        <Fingerprint className="text-purple-600 w-5 h-5" />
                        <h3 className="text-lg font-bold text-gray-800">Identity Details</h3>
                    </div>
                    
                    <div className="p-6 space-y-5">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <span className="text-gray-500 font-medium text-sm">Role</span>
                            <span className="font-mono bg-gray-100 px-3 py-1 rounded text-sm text-gray-700 font-bold">
                                {user?.role || 'User'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <span className="text-gray-500 font-medium text-sm">Provider</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                user?.provider === 'keycloak' 
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                                {user?.provider === 'keycloak' ? 'SSO (Keycloak)' : 'Local Auth'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium text-sm">User ID</span>
                            <span className="text-gray-800 font-bold">#{user?.id}</span>
                        </div>
                    </div>
                </div>

                {/* Security Status Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                        <Shield className="text-teal-600 w-5 h-5" />
                        <h3 className="text-lg font-bold text-gray-800">Security Status</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-start gap-4">
                            <Key className="w-6 h-6 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-gray-800">Access Token Valid</p>
                                <p className="text-xs text-gray-500 mt-0.5">Your session is secured via JWT (Bearer)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Clock className="w-6 h-6 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-gray-800">Token Expires At</p>
                                <p className="text-xs text-gray-500 mt-0.5">{getSessionExpiry()}</p>
                            </div>
                        </div>
                        
                        {user?.provider === 'keycloak' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex items-start gap-2">
                                <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>
                                    <strong>SSO Login:</strong> Password management is handled by your Identity Provider (Keycloak).
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;