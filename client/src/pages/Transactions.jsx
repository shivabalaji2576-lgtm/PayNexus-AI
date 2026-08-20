import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [status]);

  const fetchTransactions = async (searchQuery = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions', {
        params: { status, search: searchQuery }
      });
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions(search);
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle size={16} className="text-green-400" />;
      case 'FAILED': return <AlertCircle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-amber-400" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Transactions</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-medium">Manage and track all your payment activities.</p>
        </div>
        <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID or Order..."
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="relative">
            <select
              className="appearance-none pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer transition-all"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="" className="bg-slate-900 text-white">All Statuses</option>
              <option value="SUCCESS" className="bg-slate-900 text-white">Success</option>
              <option value="FAILED" className="bg-slate-900 text-white">Failed</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-[var(--color-border-glass)] text-[var(--color-text-secondary)] font-semibold">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)] text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-6 bg-white/5 rounded w-full"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-[var(--color-text-secondary)]">No transactions found.</div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-mono text-xs text-cyan-400/80 group-hover:text-cyan-400 transition-colors">{tx.id}</td>
                    <td className="px-6 py-4">
                      {new Date(tx.timestamp).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {tx.currency === 'INR' ? '₹' : '$'}{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-md text-xs font-medium">
                        {tx.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={tx.status} />
                        <span className={`font-semibold ${
                          tx.status === 'SUCCESS' ? 'text-green-400' :
                          tx.status === 'FAILED' ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
