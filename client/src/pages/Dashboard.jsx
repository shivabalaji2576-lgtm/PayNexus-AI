import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, CreditCard, Activity, DollarSign, AlertCircle, Bot } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/transactions/dashboard');
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 animate-pulse flex space-x-4 max-w-7xl mx-auto">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-6 bg-slate-800 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-6 pt-4">
             <div className="h-32 bg-slate-800 rounded-2xl"></div>
             <div className="h-32 bg-slate-800 rounded-2xl"></div>
             <div className="h-32 bg-slate-800 rounded-2xl"></div>
             <div className="h-32 bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for chart
  const chartData = metrics?.recentTransactions?.slice(0, 20).reverse().map(t => ({
    time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: t.amount,
    status: t.status
  })) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Overview</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2 font-medium">Real-time payment intelligence and metrics.</p>
        </div>
        <button className="btn-primary">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Volume" 
          value="₹3.2M" 
          change="+12.5%" 
          trend="up" 
          icon={DollarSign} 
          delay="0s"
        />
        <StatCard 
          title="Total Transactions" 
          value={metrics?.totalTransactions?.toLocaleString() || '0'} 
          change="+5.2%" 
          trend="up" 
          icon={CreditCard} 
          delay="0.1s"
        />
        <StatCard 
          title="Success Rate" 
          value={`${metrics?.successRate || '0'}%`} 
          change="-1.2%" 
          trend="down" 
          icon={Activity} 
          delay="0.2s"
        />
        <StatCard 
          title="Failed Payments" 
          value={metrics?.failedTransactions?.toLocaleString() || '0'} 
          change="+4.1%" 
          trend="down" 
          icon={AlertCircle} 
          alert
          delay="0.3s"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-lg font-bold text-white mb-6">Transaction Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94A3B8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  dx={-10}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: '1px solid rgba(148,163,184,0.15)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#06B6D4' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.5s' }}>
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
               <Bot size={18} className="text-cyan-400" />
            </div>
            AI Insights
          </h3>
          <div className="flex-1 space-y-4">
            <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl group hover:bg-amber-900/20 transition-colors">
              <h4 className="text-sm font-semibold text-amber-400 mb-1 flex items-center gap-2">
                Elevated Failure Rate
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Failure rate increased by 4.1% in the last 2 hours. Most failures are due to INSUFFICIENT_FUNDS.
              </p>
            </div>
            <div className="p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-xl group hover:bg-cyan-900/20 transition-colors">
              <h4 className="text-sm font-semibold text-cyan-400 mb-1">Recovery Opportunity</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {metrics?.failedTransactions || 0} recent failed transactions might be eligible for a retry workflow.
              </p>
            </div>
          </div>
          <button className="mt-6 w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex justify-center items-center gap-2 group">
             Ask PayPilot AI
             <ArrowUpRight size={16} className="text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon: Icon, alert, delay }) {
  const isPositiveTrend = trend === 'up';
  
  return (
    <div 
      className="glass-card p-6 flex flex-col group animate-slide-up" 
      style={{ animationDelay: delay }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl border ${alert ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center text-xs font-bold ${
          isPositiveTrend 
            ? (alert ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-green-400 bg-green-500/10 border-green-500/20') 
            : (alert ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20')
        } px-2.5 py-1 rounded-full border`}>
          {isPositiveTrend ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
        <h4 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</h4>
      </div>
    </div>
  );
}
