import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Activity, Save } from 'lucide-react';

const AdminDashboard = () => {
    const [view, setView] = useState('users'); // 'users' or 'logs'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // 1. Fetch Data
    useEffect(() => {
        if (!user?.token) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = view === 'users' 
                    ? 'https://localhost:5000/api/users' 
                    : 'https://localhost:5000/api/auth/logs';

                const res = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${user.token}` },
                    withCredentials: true
                });
                setData(res.data);
            } catch (err) {
                console.error(`Error fetching ${view}`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [view, user]);

    // 2. Role Update Handler (RESTORED)
    const updateRole = async (id, newRole) => {
        try {
            await axios.put(`https://localhost:5000/api/users/${id}/role`, 
                { role: newRole }, 
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    withCredentials: true
                }
            );
            // Optimistic UI Update
            setData(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
            alert(`User role updated to ${newRole}`);
        } catch (err) {
            console.error("Failed to update role", err);
            alert("Failed to update role");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header with Toggle Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    {view === 'users' ? <Users className="text-blue-600" /> : <FileText className="text-purple-600" />}
                    {view === 'users' ? 'User Management' : 'Activity Logs'}
                </h2>
                
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <button 
                        onClick={() => setView('users')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            view === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Users
                    </button>
                    <button 
                        onClick={() => setView('logs')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            view === 'logs' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Activity Logs
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading data...</div>
                ) : view === 'users' ? (
                    // --- USER MANAGEMENT TABLE (Interactive) ---
                    <table className="min-w-full leading-normal">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Role</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Provider</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((u) => (
                                <tr key={u.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-700">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            u.role === 'Admin' ? 'bg-red-100 text-red-800' : 
                                            u.role === 'Manager' ? 'bg-purple-100 text-purple-800' : 
                                            'bg-green-100 text-green-800'
                                        }`}>{u.role}</span>
                                    </td>
                                    {/* DROPDOWN RESTORED HERE */}
                                    <td className="px-6 py-4">
                                        {u.email !== user.email ? (
                                            <select
                                                value={u.role}
                                                onChange={(e) => updateRole(u.id, e.target.value)}
                                                className="block w-32 bg-white border border-gray-300 text-gray-700 py-1 px-2 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
                                            >
                                                <option value="User">User</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">Self</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{u.provider || 'local'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    // --- ACTIVITY LOGS TABLE (Read Only) ---
                    <table className="min-w-full leading-normal">
                        <thead className="bg-purple-50 border-b border-purple-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((log) => (
                                <tr key={log.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex w-fit items-center gap-2 px-2 py-1 rounded text-xs font-bold ${
                                            log.action === 'LOGIN' ? 'bg-green-100 text-green-700' : 
                                            log.action === 'SIGNUP' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                                        }`}>
                                            <Activity size={14} /> {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{log.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;