import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Briefcase } from 'lucide-react';

const ManagerDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 1. Get the current logged-in manager
    const { user } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // 2. CRITICAL FIX: Use 'user.token', not 'accessToken'
                const res = await axios.get('https://192.168.218.200:5000/api/users', {
                    headers: { Authorization: `Bearer ${user?.token}` },
                    withCredentials: true
                });
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users", err);
            } finally {
                setLoading(false);
            }
        };

        // Check against the correct property here too
        if (user?.token) fetchUsers();
    }, [user]);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <Briefcase className="text-purple-600 w-8 h-8" />
                <h2 className="text-3xl font-bold text-gray-800">Manager Overview</h2>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-purple-50 text-purple-900 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">ID</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Role</th>
                            <th className="py-3 px-6 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {/* 3. RENAMED 'user' to 'u' to avoid confusion with the auth user */}
                        {users.map((u) => (
                            <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6">{u.id}</td>
                                <td className="py-3 px-6 font-medium">{u.email}</td>
                                <td className="py-3 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        u.role === 'Admin' ? 'bg-red-100 text-red-700' :
                                        u.role === 'Manager' ? 'bg-purple-100 text-purple-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-gray-400 italic">
                                    Read Only
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagerDashboard;