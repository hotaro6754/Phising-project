
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from './Icons';
import { userService } from '../services/userService';
import { User } from '../types';

interface SignInProps {
  onSignIn: (user: User) => void;
  isDarkMode: boolean;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, isDarkMode }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      let user: User | null = null;
      if (isRegistering) {
        user = userService.register(name, email, password);
        if (!user) setError("Email already registered.");
      } else {
        user = userService.login(email, password);
        if (!user) setError("Invalid credentials.");
      }

      if (user) {
        onSignIn(user);
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[100px] rounded-full ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`backdrop-blur-3xl border p-8 rounded-[2.5rem] shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-slate-200 shadow-slate-200'}`}>
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1, backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' }}
              transition={{ duration: 0.5 }}
              className={`p-5 rounded-3xl mb-4 transition-all duration-300 ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`}
            >
              <ShieldCheck className={`w-12 h-12 transition-colors duration-300 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </motion.div>
            <h1 className={`text-3xl font-black tracking-tight transition-colors text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {isRegistering ? 'Create Operator ID' : 'Access PhishGuard'}
            </h1>
            <p className={`text-sm mt-2 transition-colors font-medium text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Enterprise-grade Neural Threat Intelligence
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {isRegistering && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. John Doe"
                    className={`w-full border-2 focus:outline-none rounded-2xl py-4 px-5 transition-all font-medium ${isDarkMode ? 'bg-slate-950/50 border-white/5 focus:border-emerald-500/40 text-slate-200' : 'bg-slate-50 border-slate-200 focus:border-emerald-500/40 text-slate-900'}`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Operator Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@phishguard.ai"
                className={`w-full border-2 focus:outline-none rounded-2xl py-4 px-5 transition-all font-medium ${isDarkMode ? 'bg-slate-950/50 border-white/5 focus:border-emerald-500/40 text-slate-200' : 'bg-slate-50 border-slate-200 focus:border-emerald-500/40 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Security Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full border-2 focus:outline-none rounded-2xl py-4 px-5 transition-all font-medium ${isDarkMode ? 'bg-slate-950/50 border-white/5 focus:border-emerald-500/40 text-slate-200' : 'bg-slate-50 border-slate-200 focus:border-emerald-500/40 text-slate-900'}`}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-rose-500 font-bold ml-1"
                >
                  ⚠️ {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              disabled={isLoading}
              whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? '#10b981' : '#059669', boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-5 rounded-2xl font-black text-white transition-all duration-300 shadow-2xl disabled:opacity-50 mt-4 flex justify-center items-center gap-3 text-xs uppercase tracking-widest ${isDarkMode ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isRegistering ? 'Register Operator' : 'Authenticate Session'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <motion.button 
              whileHover={{ scale: 1.05, color: isDarkMode ? '#34d399' : '#059669' }}
              onClick={() => setIsRegistering(!isRegistering)}
              className={`text-xs font-bold transition-colors duration-300 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
            >
              {isRegistering ? 'Already have credentials? Access Vault' : 'Need authorization? Create Operator ID'}
            </motion.button>
          </div>

          <div className={`mt-10 pt-8 border-t text-center transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
            <p className={`text-[9px] font-mono uppercase tracking-[0.4em] transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Authorized Personnel Only • Audit Logging Active
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
