import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, Building, Zap } from 'lucide-react';
import api from '../utils/api';

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, formData);
      
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-bg)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-white font-sans">
      {/* Subtle Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-float"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')}>
            <Zap size={32} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          {isLogin ? 'Welcome Back' : 'Join PayNexus AI'}
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
          Intelligent Payment Operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="glass-card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Full Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      required
                      className="bg-white/5 border border-white/10 text-white focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-3 pr-12 sm:text-sm rounded-lg py-2.5 outline-none transition-colors"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Business Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="bg-white/5 border border-white/10 text-white focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 sm:text-sm rounded-lg py-2.5 outline-none transition-colors"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="bg-white/5 border border-white/10 text-white focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 sm:text-sm rounded-lg py-2.5 outline-none transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="bg-white/5 border border-white/10 text-white focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 sm:text-sm rounded-lg py-2.5 outline-none transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border-glass)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--color-surface-card)] text-slate-400">
                  {isLogin ? 'New to PayNexus?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-2.5 px-4 border border-[var(--color-border-glass)] rounded-lg shadow-sm text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none transition-colors duration-300"
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>
            
            {isLogin && (
              <div className="mt-4 text-center text-xs text-slate-500">
                Demo Account: merchant@example.com / merchant123
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
