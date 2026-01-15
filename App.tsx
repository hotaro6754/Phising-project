
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { performDeepAnalysis } from './services/geminiService';
import { triggerN8NWebhook } from './services/n8nService';
import { AnalysisResult, View, User } from './types';
import AnalysisView from './components/AnalysisView';
import HistoryList from './components/HistoryList';
import SignIn from './components/SignIn';
import DemoScenarios from './components/DemoScenarios';
import { SearchIcon, ShieldCheck } from './components/Icons';
import { ForensicTerminal } from './components/ForensicTerminal';
import { sanitizeAnalysisInput, isInputSafe } from './services/securityUtils';

const Toast = ({ message, type = 'error', onClose }: { message: string, type?: 'error' | 'info', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, x: 50, scale: 0.9 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 20, scale: 0.9 }}
    className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${
      type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    }`}
  >
    <div className={`p-1.5 rounded-lg ${type === 'error' ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
      {type === 'error' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      )}
    </div>
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
  </motion.div>
);

const ThemeToggle = ({ isDarkMode, onToggle }: { isDarkMode: boolean, onToggle: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1, backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)' }}
    whileTap={{ scale: 0.9 }}
    onClick={onToggle}
    className={`p-2 rounded-xl transition-all duration-300 border ${isDarkMode ? 'bg-white/5 border-white/10 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'}`}
    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
  >
    {isDarkMode ? (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )}
  </motion.button>
);

const App: React.FC = () => {
  const [view, setView] = useState<View>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAiComplete, setIsAiComplete] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isError, setIsError] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'info' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedHistory = localStorage.getItem('phishguard_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    const savedUser = localStorage.getItem('phishguard_active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
    const savedTheme = localStorage.getItem('phishguard_theme');
    if (savedTheme !== null) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('phishguard_theme', newTheme ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleSignIn = useCallback((userData: User) => {
    setUser(userData);
    setView('dashboard');
    localStorage.setItem('phishguard_active_user', JSON.stringify(userData));
  }, []);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('phishguard_active_user');
    setUser(null);
    setView('auth');
  }, []);

  const handleAnalyze = useCallback(async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const rawInput = overrideInput || input;
    
    if (!rawInput.trim()) {
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
      return;
    }

    const safetyCheck = isInputSafe(rawInput);
    if (!safetyCheck.safe) {
      setToast({ message: safetyCheck.reason || "Unsafe input blocked.", type: 'error' });
      setIsError(true);
      setTimeout(() => setIsError(false), 1000);
      return;
    }

    const sanitizedInput = sanitizeAnalysisInput(rawInput);

    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setIsAiComplete(false);
    setCurrentResult(null);
    if (overrideInput) setInput(sanitizedInput);

    try {
      const result = await performDeepAnalysis(sanitizedInput);
      setCurrentResult(result);
      setHistory(prev => {
        const newHistory = [result, ...prev].slice(0, 10);
        localStorage.setItem('phishguard_history', JSON.stringify(newHistory));
        return newHistory;
      });
      await triggerN8NWebhook(result);
      setIsAiComplete(true);
    } catch (error) {
      console.error("Analysis process failed", error);
      setToast({ message: "Forensic engine unavailable. Check connection.", type: 'error' });
      setIsAnalyzing(false);
    }
  }, [input, isAnalyzing]);

  const handleTerminalFinished = useCallback(() => {
    setIsAnalyzing(false);
    setIsAiComplete(false);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  const shakeVariants = {
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'auth' ? (
        <SignIn key="auth" onSignIn={handleSignIn} isDarkMode={isDarkMode} />
      ) : (
        <motion.div
          key="dashboard"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={`min-h-screen transition-all duration-700 selection:bg-emerald-500/30 relative ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} ${isAnalyzing ? 'overflow-hidden' : ''}`}
        >
          <div className={`fixed inset-0 cyber-grid pointer-events-none transition-opacity duration-700 ${isDarkMode ? 'opacity-[0.05]' : 'opacity-[0.03]'}`} />

          <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
            <motion.div 
              animate={isAnalyzing ? { scale: [1.2, 1.4, 1.2], opacity: [0.2, 0.4, 0.2] } : { scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: isAnalyzing ? 3 : 15, repeat: Infinity }}
              className={`absolute top-[-10%] left-[-10%] w-[70%] h-[70%] blur-[150px] rounded-full ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-400/5'}`} 
            />
          </div>

          <motion.header 
            variants={itemVariants}
            className={`container mx-auto px-6 py-6 flex justify-between items-center relative z-10 border-b backdrop-blur-md transition-all duration-500 ${isDarkMode ? 'border-white/5' : 'border-slate-200'} ${isAnalyzing ? 'opacity-20 blur-sm scale-[0.98]' : ''}`}
          >
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 group cursor-pointer">
              <motion.div whileHover={{ rotate: 180, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }} className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20' : 'bg-emerald-500/5 text-emerald-600 group-hover:bg-emerald-500/10'}`}>
                <ShieldCheck className="w-5 h-5 flicker" />
              </motion.div>
              <span className={`text-xl font-bold tracking-tighter transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-emerald-500`}>
                PHISH<span className="text-emerald-500 flicker">GUARD</span>
              </span>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className={`text-[10px] font-mono uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Operator Session</span>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{user?.name}</span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.15, color: isDarkMode ? '#f43f5e' : '#e11d48' }} 
                whileTap={{ scale: 0.9 }} 
                onClick={handleSignOut} 
                className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </motion.button>
            </div>
          </motion.header>

          <main className="container mx-auto px-6 max-w-4xl pt-20 pb-32 relative z-10">
            <div className={`transition-all duration-700 ${isAnalyzing ? 'opacity-10 blur-xl scale-95 translate-y-10' : ''}`}>
              <div className="text-center mb-16">
                <motion.div variants={itemVariants} initial="hidden" animate="visible" className={`inline-block px-3 py-1 mb-6 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest flicker ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600'}`}>
                  Neural Intelligence Grounding Enabled
                </motion.div>
                <motion.h1 variants={itemVariants} className={`text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[0.9] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Zero-Trust <br/><span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Forensics.</span>
                </motion.h1>
                <motion.p variants={itemVariants} className={`text-lg max-w-2xl mx-auto font-medium transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Analyze digital communications for phishing and fraud signatures with real-time AI grounding.
                </motion.p>
              </div>

              <motion.div variants={itemVariants} className="max-w-3xl mx-auto relative group">
                <motion.form onSubmit={handleAnalyze} animate={isError ? "shake" : isFocused ? "focused" : "idle"} variants={{ ...shakeVariants, focused: { scale: 1.015 }, idle: { scale: 1 } }} className={`relative z-20 rounded-2xl transition-all duration-500 ${isFocused ? 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]' : isDarkMode ? 'shadow-2xl shadow-black/50' : 'shadow-xl shadow-slate-200'}`}>
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none z-30">
                    <SearchIcon className={`w-6 h-6 transition-colors duration-300 ${isFocused ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-500') : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`} />
                  </div>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="Analyze real URL, SMS text, or email headers..." className={`w-full backdrop-blur-2xl border-2 rounded-2xl py-6 pl-16 pr-16 transition-all duration-500 placeholder:text-slate-500 font-medium ${isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-900 shadow-sm'} ${isFocused ? (isDarkMode ? 'border-emerald-500/40 ring-8 ring-emerald-500/5' : 'border-emerald-500/40 ring-8 ring-emerald-500/5 shadow-lg shadow-emerald-500/10') : ''}`} />
                </motion.form>
                <DemoScenarios onSelect={(content) => handleAnalyze(undefined, content)} isDarkMode={isDarkMode} />
              </motion.div>
            </div>

            <AnimatePresence>
              {isAnalyzing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                  <motion.div key="terminal" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }} className="w-full max-w-4xl">
                    <ForensicTerminal isDarkMode={isDarkMode} isComplete={isAiComplete} onFinished={handleTerminalFinished} />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {currentResult && !isAnalyzing && (
                <motion.div key={currentResult.id} layout initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>
                  <AnalysisView result={currentResult} isDarkMode={isDarkMode} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`transition-all duration-700 ${isAnalyzing ? 'opacity-0 scale-95 translate-y-10' : ''}`}>
              <motion.div variants={itemVariants} className="mt-20">
                <HistoryList history={history} onSelect={setCurrentResult} isDarkMode={isDarkMode} />
              </motion.div>
            </div>
          </main>

          <motion.footer variants={itemVariants} className={`border-t py-12 text-center relative z-10 transition-all duration-500 ${isDarkMode ? 'border-white/5 bg-slate-950' : 'border-slate-200 bg-slate-100'} ${isAnalyzing ? 'opacity-0' : ''}`}>
            <p className={`text-[10px] font-mono uppercase tracking-[0.5em] flicker ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Authorized Operator Session: {user?.email} • No Logs Policy Active</p>
          </motion.footer>

          <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
