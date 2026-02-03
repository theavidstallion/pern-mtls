import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();
    
    // Use a ref to prevent double-firing in React Strict Mode
    const processed = useRef(false);

    useEffect(() => {
        // 1. Extract the "code" from the URL query params
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (code && !processed.current) {
            processed.current = true; // Mark as running

            const exchangeCode = async () => {
                try {
                    // 2. Send code to backend to get tokens
                    const res = await axios.post(
                        'https://192.168.218.200:5000/api/auth/keycloak', 
                        { code },
                        { withCredentials: true } // <--- CRITICAL FIX: Sends the Client Cert
                    );
                    
                    // 3. Log the user in
                    loginWithToken(res.data);
                    
                    // 4. Redirect to dashboard
                    navigate('/dashboard');
                } catch (err) {
                    console.error("SSO Failed:", err);
                    navigate('/login', { state: { error: "SSO Login Failed" } });
                }
            };

            exchangeCode();
        } else if (!code) {
            navigate('/login');
        }
    }, [location, navigate, loginWithToken]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-xl font-semibold text-gray-700">Verifying Identity...</div>
            <div className="text-sm text-gray-500 mt-2">Completing secure handshake</div>
        </div>
    );
};

export default AuthCallback;