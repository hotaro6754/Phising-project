
import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../types';
import { THREAT_CONFIG } from '../constants';

interface HistoryListProps {
  history: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
  isDarkMode: boolean;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, isDarkMode }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-mono text-xs uppercase tracking-[0.3em] flex items-center gap-3 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Forensic Scan Vault
        </h3>
        <span className={`text-[10px] font-mono transition-colors ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`}>{history.length} SCANS CACHED</span>
      </div>
      
      <div className="space-y-4">
        {history.map((item, idx) => {
          const config = THREAT_CONFIG[item.label];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.08, type: 'spring', stiffness: 120 }}
              whileHover={{ 
                x: 8, 
                backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                scale: 1.01
              }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(item)}
              className={`group cursor-pointer border p-5 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 ${isDarkMode ? 'bg-slate-900/20 border-slate-800/40' : 'bg-white border-slate-100 shadow-slate-200/50'}`}
            >
              <div className="flex items-center gap-5 truncate">
                <div className={`w-1.5 h-12 rounded-full transition-all duration-300 ${config.color.replace('text', 'bg')} opacity-50 shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:opacity-100`} />
                <div className="truncate">
                  <p className={`text-sm truncate max-w-xs md:max-w-xl font-medium group-hover:text-emerald-500 transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.input}
                  </p>
                  <p className={`text-[10px] font-mono mt-1 uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Trace Date: {new Date(item.timestamp).toLocaleDateString()} // {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right hidden sm:block">
                   <p className={`text-[10px] font-black tracking-widest transition-colors duration-300 ${isDarkMode ? 'text-white/40 group-hover:text-emerald-400/60' : 'text-slate-400 group-hover:text-emerald-600/60'}`}>{item.score}% RISK</p>
                   <div className={`h-1 w-12 rounded-full mt-1 overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div className={`h-full transition-all duration-700 ${config.color.replace('text', 'bg')}`} style={{ width: `${item.score}%` }} />
                   </div>
                </div>
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-tighter shadow-sm transition-all duration-300 ${config.border} ${config.bg} ${config.color} group-hover:brightness-110`}
                >
                  {item.label}
                </motion.span>
                <span className={`transition-all duration-300 text-lg ${isDarkMode ? 'text-slate-700 group-hover:text-emerald-400 group-hover:translate-x-1' : 'text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1'}`}>
                  →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryList;
