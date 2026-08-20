import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AIChat from './pages/AIChat';
import AppLayout from './layouts/AppLayout';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-surface-bg)] text-white">Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route element={user ? <AppLayout setUser={setUser} /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/ai-agent" element={<AIChat user={user} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
