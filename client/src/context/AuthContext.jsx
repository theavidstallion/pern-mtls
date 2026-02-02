import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                // 1. Attempt to restore session
                // We set a 5-second timeout so it never hangs forever
                const res = await axios.get('https://localhost:5000/api/auth/refresh', {
                    withCredentials: true,
                    timeout: 5000 
                });
                
                // Success: User is logged in
                const { accessToken, user: userData } = res.data;
                setUser({ ...userData, token: accessToken });
                
            } catch (error) {
                // Failure: User is NOT logged in (401) or Backend is down.
                // This is EXPECTED for new users. 
                // We stay as 'null' (Guest) so they can Sign Up.
                console.log("No active session. User is a Guest.");
                setUser(null);
                
            } finally {
                // 2. CRITICAL: Stop loading NO MATTER WHAT happens.
                // This unlocks the screen so you can see the Login/Signup pages.
                setLoading(false); 
            }
        };

        restoreSession();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('https://localhost:5000/api/auth/login', 
                { email, password },
                { withCredentials: true } 
            );
            const { accessToken, user } = res.data;
            setUser({ ...user, token: accessToken });
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await axios.post('https://localhost:5000/api/auth/logout', {}, { withCredentials: true });
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const loginWithToken = (data) => {
        const { accessToken, user } = data;
        setUser({ ...user, token: accessToken });
    };

    // While checking, show a simple loading text
    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-700">Connecting...</div>
                <div className="text-sm text-gray-500 mt-2">Checking security session</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loginWithToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);