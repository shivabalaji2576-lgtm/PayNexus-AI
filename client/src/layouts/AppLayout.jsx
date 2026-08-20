import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Bot, LogOut, Settings, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AppLayout({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'AI Operations', path: '/ai-agent', icon: Bot },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-surface-bg)] text-[var(--color-text-main)] overflow-hidden font-sans relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-[var(--color-surface-card)]/40 backdrop-blur-xl border-r border-[var(--color-border-glass)] flex flex-col z-10">
        <div className="h-20 flex items-center px-6 border-b border-[var(--color-border-glass)]">
          <Link to="/dashboard" className="flex items-center gap-3 text-white font-bold text-xl tracking-tight hover:scale-105 transition-transform cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap size={20} className="text-white" />
            </div>
            PayNexus <span className="text-blue-400">AI</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium relative overflow-hidden",
                  isActive 
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-inner" 
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500"></div>
                )}
                <Icon size={18} className={cn("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-[var(--color-border-glass)] space-y-2">
          <button 
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
          >
            <Settings size={18} className="transition-transform duration-300 hover:rotate-90" />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col z-10">
        <header className="h-20 bg-[var(--color-surface-bg)]/60 backdrop-blur-lg border-b border-[var(--color-border-glass)] flex items-center justify-between px-8 sticky top-0 z-20">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            {navItems.find(item => item.path === location.pathname)?.name || 'Overview'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-500/50 transition-all cursor-pointer">
              JD
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
