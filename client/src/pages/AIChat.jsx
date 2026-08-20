import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, Check, X, ShieldAlert, Zap } from 'lucide-react';
import api from '../utils/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AIChat({ user }) {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: `Hello ${user.name.split(' ')[0]}. I'm your PayPilot AI operations agent. How can I help you manage your payments today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [pendingActions, setPendingActions] = useState([]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingActions]);

  // Check for pending actions
  useEffect(() => {
    const fetchActions = async () => {
      try {
        const { data } = await api.get('/admin/agent-actions'); 
        const pending = data.filter(a => a.status === 'PENDING' && a.authorizationRequired);
        setPendingActions(pending);
      } catch (error) {
        console.error('Failed to fetch actions', error);
      }
    };
    fetchActions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: userMessage,
        conversationId
      });

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.message }]);
      
      if (data.toolUsed) {
        const actionsRes = await api.get('/admin/agent-actions');
        setPendingActions(actionsRes.data.filter(a => a.status === 'PENDING' && a.authorizationRequired));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: 'Sorry, I encountered an error communicating with the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (actionId, approved) => {
    try {
      await api.post('/ai/agent/confirm', { actionId, approved });
      setPendingActions(prev => prev.filter(a => a.id !== actionId));
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'system', 
        content: `Action ${approved ? 'approved and executed' : 'rejected'} successfully.` 
      }]);
    } catch (error) {
      console.error(error);
      alert('Failed to process confirmation');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto p-4 md:p-8 animate-fade-in relative z-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Zap size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">PayPilot AI</h2>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-0.5">Intelligent assistance for your payment operations</p>
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.map((msg, idx) => (
            <div 
              key={msg.id || idx} 
              className={cn(
                "flex gap-4 max-w-3xl",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md border",
                msg.role === 'user' ? "bg-[var(--color-surface-bg)] border-[var(--color-border-glass)]" : 
                msg.role === 'system' ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400"
              )}>
                {msg.role === 'user' ? <User size={16} className="text-slate-300" /> : 
                 msg.role === 'system' ? <ShieldAlert size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-md",
                msg.role === 'user' 
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-sm shadow-blue-500/20" 
                  : msg.role === 'system'
                    ? "bg-red-900/20 text-red-200 border border-red-500/20 rounded-tl-sm"
                    : "bg-white/5 text-slate-200 border border-white/10 rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Pending Actions UI */}
          {pendingActions.map(action => (
            <div key={action.id} className="ml-12 max-w-2xl bg-amber-900/20 border border-amber-500/30 rounded-xl p-5 shadow-lg shadow-amber-500/10 backdrop-blur-md animate-slide-up">
              <div className="flex items-start gap-4">
                <ShieldAlert className="text-amber-400 mt-0.5 animate-pulse" size={24} />
                <div className="flex-1">
                  <h4 className="font-bold text-amber-400">Authorization Required</h4>
                  <p className="text-sm text-amber-200/80 mt-1.5 leading-relaxed">
                    The agent wants to execute <span className="font-mono bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">{action.toolName}</span> on transaction <span className="font-mono bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">{action.transactionId}</span>.
                  </p>
                  <div className="mt-5 flex gap-3">
                    <button 
                      onClick={() => handleConfirmAction(action.id, true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 text-white text-sm font-semibold rounded-lg transition-all hover:-translate-y-0.5"
                    >
                      <Check size={16} /> Approve Action
                    </button>
                    <button 
                      onClick={() => handleConfirmAction(action.id, false)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm font-semibold rounded-lg transition-all"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Bot size={16} className="text-cyan-400" />
              </div>
              <div className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm flex items-center gap-3 text-cyan-400 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Analyzing payment data...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[var(--color-surface-secondary)]/50 border-t border-[var(--color-border-glass)] backdrop-blur-xl">
          <form 
            onSubmit={handleSubmit}
            className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:ring-1 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/50 transition-all shadow-inner"
          >
            <textarea
              className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none border-0 focus:ring-0 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none"
              placeholder="Ask me to investigate a payment, find similar failures, or issue a refund..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="mb-1 mr-1 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 hover:brightness-110 disabled:opacity-50 transition-all flex-shrink-0"
            >
              <Send size={18} className={cn(loading && "opacity-0")} />
              {loading && <Loader2 size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />}
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-xs text-[var(--color-text-secondary)] flex items-center justify-center gap-1.5 font-medium">
              <ShieldAlert size={12} className="text-cyan-500/70" /> PayPilot AI operates with human-in-the-loop security for sensitive actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
