import { ArrowRight, Activity, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-surface-bg)] overflow-hidden relative font-sans text-white">
      {/* Subtle Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-float"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-cyan-600/15 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '4s' }}></div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">PayNexus <span className="text-blue-400">AI</span></span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-white transition-colors duration-300">
            Sign In
          </button>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Hero Text */}
        <div className="flex-1 text-center lg:text-left space-y-8 animate-slide-up">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400">
            The Future of <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Payment Operations
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto lg:mx-0 font-medium">
            AI-powered intelligence to automatically detect anomalies, recover failed payments, and secure your transactions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button onClick={() => navigate('/login')} className="btn-primary w-full sm:w-auto text-lg px-8 py-3 group">
              Launch Dashboard
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => navigate('/login')} className="px-8 py-3 rounded-lg font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 w-full sm:w-auto">
              View Documentation
            </button>
          </div>
          
          <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-[var(--color-border-glass)]">
            <div className="flex items-center gap-2">
              <Shield className="text-cyan-400" size={20} />
              <span className="text-sm text-slate-300 font-medium">Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="text-blue-400" size={20} />
              <span className="text-sm text-slate-300 font-medium">99.99% Uptime</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="flex-1 w-full animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="relative w-full aspect-square max-w-[600px] mx-auto">
            {/* Visual Glass Pane */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-3xl backdrop-blur-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
              {/* Mock App Header */}
              <div className="h-12 border-b border-white/10 flex items-center px-6 gap-2 bg-black/20">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              {/* Mock App Content */}
              <div className="flex-1 p-8 space-y-6 flex flex-col justify-center">
                <div className="space-y-3">
                  <div className="h-4 w-1/3 bg-white/10 rounded-full"></div>
                  <div className="h-10 w-2/3 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-lg border border-blue-400/30"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col justify-between">
                    <div className="h-3 w-1/2 bg-white/20 rounded-full"></div>
                    <div className="h-6 w-3/4 bg-white/40 rounded-full"></div>
                  </div>
                  <div className="h-24 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] w-16 h-16 bg-blue-500/30 blur-2xl rounded-full"></div>
                    <div className="h-3 w-1/2 bg-white/20 rounded-full relative z-10"></div>
                    <div className="h-6 w-3/4 bg-cyan-400/80 rounded-full relative z-10"></div>
                  </div>
                </div>
                <div className="h-32 bg-white/5 rounded-xl border border-white/10 p-4">
                   <div className="flex items-end justify-between h-full gap-2 pt-4">
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                        <div key={i} className="w-full bg-gradient-to-t from-blue-500/50 to-cyan-400/50 rounded-t-sm" style={{ height: \`\${h}%\` }}></div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -left-8 top-1/4 glass-card p-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Activity size={18} className="text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Success Rate</div>
                  <div className="text-sm font-bold text-white">99.8%</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 bottom-1/4 glass-card p-4 animate-float" style={{ animationDelay: '2.5s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Zap size={18} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">AI Recovered</div>
                  <div className="text-sm font-bold text-white">₹1.2M</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
