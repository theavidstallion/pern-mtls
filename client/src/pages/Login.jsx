import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate('/dashboard');
        } else {
            alert("Invalid Credentials");
        }
    };

    const handleSSO = () => {
        // Added "&scope=openid profile email" to the end
        window.location.href = "http://localhost:8080/realms/quantrust-realm/protocol/openid-connect/auth?client_id=quantrust-app&response_type=code&redirect_uri=http://localhost:5173/auth/callback&scope=openid profile email";
    };

    const handleSocialLogin = (provider) => {
        // 1. Configuration
        const keycloakUrl = 'http://localhost:8080'; 
        const realm = 'quantrust-realm';
        const clientId = 'quantrust-app'; // <--- REPLACE THIS with your actual Client ID
        const redirectUri = 'http://localhost:5173/auth/callback';

        // 2. Build the Direct Link
        // kc_idp_hint is the magic parameter that skips the Keycloak login screen
        const targetUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth` +
            `?client_id=${clientId}` +
            `&redirect_uri=${redirectUri}` +
            `&response_type=code` +
            `&scope=openid email profile` +
            `&kc_idp_hint=${provider}`; 

        // 3. Go there
        window.location.href = targetUrl;
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In</h2>
                
                <button 
                    onClick={handleSSO}
                    className="w-full mb-4 bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition duration-200"
                >
                    Login with Keycloak SSO
                </button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input 
                            type="email" 
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="test@test.com"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input 
                            type="password" 
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password123"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
                    >
                        Login
                    </button>
                </form>
            </div>
            <div className="flex gap-4 mt-6 justify-center">
                <button 
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    Google
                </button>
                <button 
                    onClick={() => handleSocialLogin('github')}
                    className="flex items-center gap-2 bg-[#24292F] text-white px-4 py-2 rounded-lg hover:bg-[#24292F]/90 font-medium transition-colors"
                >
                    <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5 invert" alt="GitHub" />
                    GitHub
                </button>
            </div>
        </div>
        
    );
}