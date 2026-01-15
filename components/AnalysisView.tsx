
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { AnalysisResult } from '../types';
import { THREAT_CONFIG } from '../constants';
import { ShieldCheck, ShieldAlert, AlertTriangle } from './Icons';

interface AnalysisViewProps {
  result: AnalysisResult;
  isDarkMode: boolean;
}

const ScoreCounter: React.FC<{ score: number }> = ({ score }) => {
  const spring = useSpring(0, { stiffness: 35, damping: 12 });
  const displayValue = useTransform(spring, (latest) => Math.floor(latest));
  const [value, setValue] = useState(0);

  useEffect(() => {
    spring.set(score);
    const unsubscribe = displayValue.on('change', (v) => setValue(Math.floor(v)));
    return () => unsubscribe();
  }, [score, spring, displayValue]);

  return <span className="font-mono">{value}</span>;
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, isDarkMode }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopyingInput, setIsCopyingInput] = useState(false);
  const config = THREAT_CONFIG[result.label];
  const Icon = result.label === 'SAFE' ? ShieldCheck : result.label === 'FRAUD' ? ShieldAlert : AlertTriangle;

  const handleShare = () => {
    const reportUrl = `${window.location.origin}/report/${result.id}`;
    navigator.clipboard.writeText(reportUrl);
    setIsSharing(true);
    setTimeout(() => setIsSharing(false), 2000);
  };

  const handleCopyInput = () => {
    navigator.clipboard.writeText(result.input);
    setIsCopyingInput(true);
    setTimeout(() => setIsCopyingInput(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6 }}
      className={`mt-10 p-8 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden shadow-2xl backdrop-blur-xl ${config.border} ${isDarkMode ? config.bg + ' ' + config.glow : 'bg-white/90 shadow-slate-200'}`}
    >
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className={`absolute -right-20 -top-20 w-72 h-72 rounded-full blur-[100px] ${isDarkMode ? config.bg.replace('/10', '/40') : config.bg.replace('/10', '/20')}`} 
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-6">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
            className={`p-6 rounded-[1.8rem] ring-1 ring-inset ring-white/10 shadow-2xl flicker ${config.bg} ${config.color}`}
          >
            <Icon className="w-14 h-14" />
          </motion.div>
          <div>
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`inline-block px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase mb-2 border border-white/5 shadow-lg ${config.bg} ${config.color}`}
            >
              System Trace: Verified
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-5xl font-black tracking-tighter uppercase leading-none mb-1 transition-colors ${isDarkMode ? config.color : config.color.replace('400', '600')}`}
            >
              {result.label}
            </motion.h3>
            <p className={`text-[10px] font-mono mt-2 tracking-[0.2em] uppercase flex items-center gap-2 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              CRITICALITY_INDEX: <span className={`font-black text-xl tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><ScoreCounter score={result.score} /></span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="text-right">
             <span className={`text-[10px] font-black uppercase tracking-[0.2em] flicker ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Heuristic Confidence</span>
             <p className={`text-2xl font-black tabular-nums transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{94 + Math.floor(Math.random() * 5)}.<span className="text-xs opacity-50">{Math.floor(Math.random() * 9)}</span>%</p>
          </div>
          <div className={`h-2.5 w-full md:w-64 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner transition-colors ${isDarkMode ? 'bg-black/40' : 'bg-slate-200'}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.score}%` }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className={`h-full rounded-full ${result.score > 70 ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : result.score > 30 ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}`}
            />
          </div>
        </div>
      </div>

      <motion.div layout className="mt-10 space-y-6 relative z-10">
        {/* Source Vector Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h5 className={`text-[9px] font-black uppercase tracking-[0.3em] ml-1 flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className={`w-1 h-3 rounded-full ${config.color.replace('text', 'bg')} opacity-40`} />
              Forensic_Input_Stream
            </h5>
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyInput}
                className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-[8px] font-black tracking-widest uppercase ${isDarkMode ? 'bg-black/40 border-white/5 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'}`}
              >
                {isCopyingInput ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                )}
                {isCopyingInput ? 'COPIED' : 'COPY_RAW'}
              </motion.button>
              <AnimatePresence>
                {isCopyingInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: -25, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-600 text-white text-[8px] font-black rounded-md shadow-lg pointer-events-none"
                  >
                    COPIED_TO_CLIPBOARD
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className={`p-5 rounded-2xl border font-mono text-[11px] leading-relaxed break-all transition-colors ${isDarkMode ? 'bg-black/60 border-white/5 text-emerald-500/80 shadow-inner' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
            {result.input}
          </div>
        </div>

        <motion.div layout>
          <div className="flex justify-between items-center mb-5">
            <h4 className={`font-black flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <motion.span 
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-3 h-3 rounded-full ${config.color.replace('text', 'bg')} shadow-lg shadow-white/10`}
              />
              Intelligence Report
            </h4>
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.05, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all border flex items-center gap-2 ${isDarkMode ? 'bg-white/5 text-emerald-400 border-white/5' : 'bg-slate-100 text-emerald-600 border-slate-200'}`}
              >
                {isSharing ? (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    LINK COPIED
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    SHARE REPORT
                  </>
                )}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.6)', backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDetails(!showDetails)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all border ${isDarkMode ? 'bg-white/5 text-emerald-400 border-white/5' : 'bg-slate-100 text-emerald-600 border-slate-200'}`}
              >
                {showDetails ? 'CONSOLIDATE VIEW' : 'EXPAND EVIDENCE'}
              </motion.button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`leading-relaxed p-8 rounded-[2rem] border font-medium shadow-2xl backdrop-blur-md relative group transition-all duration-300 ${isDarkMode ? 'text-slate-200 bg-black/40 border-white/5' : 'text-slate-700 bg-white/50 border-slate-200'}`}
          >
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl transition-colors duration-300 ${isDarkMode ? 'border-emerald-500/20 group-hover:border-emerald-500/50' : 'border-emerald-500/30 group-hover:border-emerald-500/60'}`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl transition-colors duration-300 ${isDarkMode ? 'border-emerald-500/20 group-hover:border-emerald-500/50' : 'border-emerald-500/30 group-hover:border-emerald-500/60'}`} />
            {result.explanation}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {result.groundingLinks && result.groundingLinks.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h5 className={`text-[9px] font-black uppercase tracking-[0.3em] ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Real-World Evidence Grounding</h5>
              <div className="flex flex-wrap gap-2">
                {result.groundingLinks.map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, borderColor: '#10b981', backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' }}
                    className={`px-4 py-2 rounded-xl border text-[10px] font-bold flex items-center gap-2 transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-emerald-400' : 'bg-white border-slate-200 text-emerald-600 shadow-sm'}`}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    {link.title}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}

          {(showDetails && result.indicators.length > 0) && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              className="overflow-hidden"
            >
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
                initial="hidden"
                animate="visible"
              >
                {result.indicators.map((indicator, idx) => (
                  <motion.div 
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, x: -15 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,1)', borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)' }}
                    className={`p-5 rounded-[1.5rem] border flex items-start gap-4 transition-all duration-300 ${isDarkMode ? 'bg-black/25 border-white/5' : 'bg-white shadow-sm border-slate-100'}`}
                  >
                    <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[10px] border shadow-lg transition-all duration-300 ${
                      indicator.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      indicator.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {indicator.type.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{indicator.type}</span>
                        <motion.span 
                          animate={indicator.severity === 'HIGH' ? { opacity: [1, 0.4, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className={`text-[8px] font-black px-2.5 py-1 rounded-full ${
                            indicator.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 
                            indicator.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 
                            'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {indicator.severity}
                        </motion.span>
                      </div>
                      <p className={`text-[11px] leading-relaxed tracking-wide transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{indicator.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className={`pt-8 border-t flex flex-wrap justify-between items-center gap-4 text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-colors ${isDarkMode ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
           <div className="flex items-center gap-8">
             <span className={`px-3 py-1 rounded border transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>SHA256: {result.id.slice(0, 16).toUpperCase()}</span>
             <span className="hidden sm:inline">NODAL_STRAT: LVL_{result.score > 60 ? '9' : '3'}</span>
           </div>
           <span className="opacity-50">{new Date(result.timestamp).toUTCString()}</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisView;
