import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // <--- Import the real file
import AuthCallback from './pages/AuthCallback';
import Signup from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;