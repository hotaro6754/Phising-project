
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOG_MESSAGES = [
  { threshold: 0, time: "[0.00ms]", text: "Initializing PhishGuard Core Engine...", color: "text-slate-500" },
  { threshold: 8, time: "[0.04ms]", text: "Establishing secure sandbox environment...", color: "text-slate-400" },
  { threshold: 15, time: "[0.12ms]", text: "Parsing input vector segments for entropy...", color: "text-slate-400" },
  { threshold: 22, time: "[0.45ms]", text: "Performing lexical signature matching...", color: "text-emerald-500/60" },
  { threshold: 30, time: "[1.02ms]", text: "Querying global threat intelligence database...", color: "text-emerald-400" },
  { threshold: 40, time: "[SCAN]", text: "Detecting social engineering patterns (NLU)...", color: "text-emerald-500/60" },
  { threshold: 50, time: "[SCAN]", text: "Verifying URL SSL/TLS certificate chain...", color: "text-indigo-500/60" },
  { threshold: 60, time: "[SCAN]", text: "Triggering Deep Neural Inference (v2.4.0)...", color: "text-indigo-400 font-bold" },
  { threshold: 70, time: "[SCAN]", text: "Analyzing financial fraud indicators...", color: "text-indigo-500/60" },
  { threshold: 80, time: "[SCAN]", text: "Cross-referencing domain age and reputation...", color: "text-cyan-500/60" },
  { threshold: 88, time: "[SYNC]", text: "Aggregating risk metrics from neural layers...", color: "text-cyan-500/60" },
  { threshold: 95, time: "[DONE]", text: "Finalizing comprehensive forensic report...", color: "text-cyan-400" }
];

const ANALYSIS_PHASES = [
  { id: 'INIT', label: 'INITIALIZATION', range: [0, 25], color: 'bg-slate-500', glow: 'shadow-slate-500/20', text: 'text-slate-400' },
  { id: 'HEUR', label: 'HEURISTICS_ENGINE', range: [25, 55], color: 'bg-emerald-500', glow: 'shadow-emerald-500/30', text: 'text-emerald-400' },
  { id: 'NEUR', label: 'NEURAL_INFERENCE', range: [55, 85], color: 'bg-indigo-500', glow: 'shadow-indigo-500/40', text: 'text-indigo-400' },
  { id: 'CONC', label: 'REPORT_CONCLUSION', range: [85, 100], color: 'bg-cyan-500', glow: 'shadow-cyan-500/50', text: 'text-cyan-400' }
];

interface ForensicTerminalProps {
  isDarkMode: boolean;
  isComplete?: boolean;
  onFinished?: () => void;
}

const BackgroundDataNoise = ({ intensity = 1 }: { intensity?: number }) => {
  const [data, setData] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newHex = Array.from({ length: 4 }).map(() => 
        Math.floor(Math.random() * 0xFF).toString(16).padStart(2, '0').toUpperCase()
      ).join('');
      setData(prev => [newHex, ...prev].slice(0, 15));
    }, 200 / intensity);
    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex flex-wrap gap-12 p-12 transition-opacity duration-1000" style={{ opacity: 0.02 * intensity }}>
      {data.map((hex, i) => (
        <motion.span
          key={`${hex}-${i}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-[40px] font-mono font-black select-none"
        >
          {hex}
        </motion.span>
      ))}
    </div>
  );
};

export const ForensicTerminal: React.FC<ForensicTerminalProps> = ({ isDarkMode, isComplete, onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [entropy, setEntropy] = useState('0x00000000');
  const [isGlitching, setIsGlitching] = useState(false);
  const [phaseFlash, setPhaseFlash] = useState(false);
  const [cycle, setCycle] = useState(0);
  const finishedRef = useRef(false);
  const previousPhaseId = useRef<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const logCountRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle(c => c + 1);
      setProgress(prev => {
        if (prev >= 100) {
          if (!finishedRef.current && isComplete) {
            finishedRef.current = true;
            setTimeout(() => onFinished?.(), 1000);
          }
          return 100;
        }

        let increment = 0;
        if (isComplete) {
          increment = 10 + Math.random() * 15;
        } else {
          if (prev < 40) increment = 0.8 + Math.random() * 1.5;
          else if (prev < 75) increment = 0.4 + Math.random() * 0.8;
          else if (prev < 90) increment = 0.1 + Math.random() * 0.2;
          else increment = 0.02 + Math.random() * 0.05;
        }
        
        if (Math.random() < 0.008) {
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 60);
        }

        return Math.min(prev + increment, isComplete ? 100 : 99.9);
      });

      setEntropy(`0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase()}`);
    }, 100);

    return () => clearInterval(interval);
  }, [isComplete, onFinished]);

  const currentPhase = useMemo(() => {
    return ANALYSIS_PHASES.find(p => progress >= p.range[0] && progress < p.range[1]) || ANALYSIS_PHASES[3];
  }, [progress]);

  useEffect(() => {
    if (currentPhase.id !== previousPhaseId.current) {
      if (previousPhaseId.current !== null) {
        setPhaseFlash(true);
        setIsGlitching(true);
        setTimeout(() => setPhaseFlash(false), 600);
        setTimeout(() => setIsGlitching(false), 150);
      }
      previousPhaseId.current = currentPhase.id;
    }
  }, [currentPhase]);

  const visibleLinesCount = LOG_MESSAGES.filter(msg => progress >= msg.threshold).length;
  useEffect(() => {
    if (visibleLinesCount > logCountRef.current) {
      logCountRef.current = visibleLinesCount;
    }
  }, [visibleLinesCount]);

  const noiseIntensity = useMemo(() => {
    if (currentPhase.id === 'NEUR') return 2.5;
    if (currentPhase.id === 'HEUR') return 1.5;
    if (currentPhase.id === 'CONC') return 0.8;
    return 1;
  }, [currentPhase.id]);

  const estimatedTimeRemaining = useMemo(() => {
    if (isComplete) return "0.00s";
    const rem = 100 - progress;
    return (rem * 0.12).toFixed(2) + "s";
  }, [progress, isComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        x: isGlitching ? [-0.5, 1, -1, 0.5, 0] : 0,
        filter: isGlitching 
          ? ['blur(0px)', 'blur(1px)', 'blur(0px)', 'contrast(1.1)'] 
          : phaseFlash 
            ? ['brightness(1)', 'brightness(1.4)', 'brightness(1)'] 
            : 'blur(0px)'
      }}
      transition={{ type: 'spring', damping: 22, stiffness: 120 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)', transition: { duration: 0.4 } }}
      className={`relative w-full border rounded-[2.5rem] p-8 font-mono text-[11px] overflow-hidden shadow-[0_0_150px_-30px_rgba(16,185,129,0.3)] transition-all duration-500 backdrop-blur-3xl ${isDarkMode ? 'bg-slate-950/98 border-emerald-500/20' : 'bg-slate-900 border-slate-700'}`}
    >
      <AnimatePresence>
        {phaseFlash && (
          <motion.div
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none z-0 ${currentPhase.color}`}
          />
        )}
      </AnimatePresence>

      <BackgroundDataNoise intensity={noiseIntensity} />
      <div className="absolute inset-0 pointer-events-none crt-lines z-20 opacity-20" />
      
      <motion.div 
        animate={{ 
          opacity: isGlitching ? [0.06, 0.1, 0.06] : phaseFlash ? [0.06, 0.1, 0.06] : [0.02, 0.03, 0.02],
          x: isGlitching ? [-0.5, 0.5, -0.5] : [0, 0, 0],
          y: isGlitching ? [0.2, -0.2, 0] : [0, 0, 0],
          scale: isGlitching ? [1, 1.002, 1] : 1
        }}
        transition={{ duration: 0.12, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute inset-0 pointer-events-none cyber-noise z-0" 
      />
      
      <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-8 relative z-30">
        <div className="flex items-center gap-6">
          <div className="flex gap-2.5">
            {ANALYSIS_PHASES.map((p, i) => (
              <motion.div 
                key={p.id}
                animate={{ 
                  scale: progress >= p.range[0] ? [1, 1.4, 1] : 1,
                  opacity: progress >= p.range[0] ? 1 : 0.15,
                  boxShadow: progress >= p.range[0] ? [`0 0 0px transparent`, `0 0 15px 3px currentColor`, `0 0 0px transparent`] : 'none'
                }} 
                transition={{ repeat: Infinity, duration: progress >= p.range[0] ? 2 : 3, delay: i * 0.4 }} 
                className={`w-4 h-4 rounded-full border border-white/10 ${progress >= p.range[0] ? p.color + ' ' + p.glow : 'bg-slate-800'}`} 
              />
            ))}
          </div>
          <div className="flex flex-col">
            <motion.span 
              animate={phaseFlash ? { y: [-1, 0], opacity: [0.8, 1] } : {}}
              className={`font-black uppercase tracking-[0.5em] text-[10px] flicker transition-colors duration-700 ${currentPhase.text}`}
            >
              Forensic Interface // {currentPhase.id}_NODE
            </motion.span>
            <span className={`text-[8px] uppercase tracking-[0.3em] mt-1.5 font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Cycle: <span className="text-white">0x{cycle.toString(16).toUpperCase().padStart(4, '0')}</span> • Session: <span className={`${currentPhase.text} opacity-80`}>{entropy.slice(0, 14)}</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <div className={`flex items-center gap-4 bg-black/70 px-6 py-3.5 rounded-2xl border transition-all duration-300 ${isGlitching ? 'border-emerald-500/40' : 'border-white/5 shadow-2xl shadow-black/40'}`}>
              <div className="text-right flex flex-col items-end justify-center">
                <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black mb-0.5">Est. Completion</span>
                <span className={`text-[11px] font-black tabular-nums transition-colors ${currentPhase.text}`}>{estimatedTimeRemaining}</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10 mx-1" />
              <div className="relative flex items-center gap-3">
                <span className={`text-xl font-black tabular-nums tracking-tighter transition-colors duration-500 ${currentPhase.text}`}>
                  {Math.floor(progress).toString().padStart(2, '0')}
                </span>
                <span className={`text-[9px] font-black mt-1.5 opacity-40 ${currentPhase.text}`}>%</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-10 relative z-30">
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-6">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <motion.div 
                animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.8, 1, 0.8] }} 
                transition={{ repeat: Infinity, duration: 3 }} 
                className={`w-2 h-4 block rounded-sm transition-colors duration-500 ${currentPhase.color}`} 
              /> 
              PhishGuard_Forensic_Log
            </span>
            <span className={`text-[8px] font-mono uppercase tracking-widest animate-pulse transition-colors duration-500 ${currentPhase.text} opacity-50`}>
              {progress > 90 && !isComplete ? '[SYNCING_AI_NEURAL_LINK]' : isComplete ? '[AUDIT_LOCKED]' : '[STREAM_ACTIVE]'}
            </span>
          </div>
          
          <div ref={terminalRef} className="space-y-4 min-h-[220px] max-h-[220px] overflow-hidden px-1">
            <AnimatePresence initial={false}>
              {LOG_MESSAGES.filter(msg => progress >= msg.threshold).map((line, i, arr) => (
                <motion.div
                  key={line.text}
                  initial={{ opacity: 0, x: -3, y: 5 }}
                  animate={{ opacity: 1, x: 0, y: 0, skewX: isGlitching ? [0, -1, 1, 0] : 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                  className="flex gap-6 group/line items-baseline"
                >
                  <span className="text-slate-600 shrink-0 font-bold tabular-nums text-[9px] opacity-30 select-none tracking-tighter">{line.time}</span>
                  <span className={`${line.color} flex items-center gap-4 tracking-wider text-[11px] font-medium drop-shadow-[0_0_5px_rgba(255,255,255,0.05)] transition-colors duration-700`}>
                    <motion.span 
                      animate={{ rotate: 360, opacity: [0.1, 0.4, 0.1] }} 
                      transition={{ repeat: Infinity, duration: 6, ease: "linear" }} 
                      className={`text-[8px] font-black transition-colors duration-700 ${currentPhase.text} opacity-40`}
                    >
                      »
                    </motion.span>
                    <DecryptText text={line.text} active={progress >= line.threshold} speed={isComplete ? 4 : 14} isGlitching={isGlitching} />
                    {i === arr.length - 1 && progress < 100 && (
                      <motion.span 
                        animate={{ opacity: [0, 1, 0], scaleY: [0.9, 1.1, 0.9] }} 
                        transition={{ repeat: Infinity, duration: 0.7 }} 
                        className={`inline-block w-2 h-4 shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-colors duration-500 ${currentPhase.color}`} 
                      />
                    )}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className={`border border-white/10 rounded-[2rem] bg-black/40 p-6 flex flex-col items-center relative overflow-hidden group transition-all duration-700 ${isGlitching ? 'scale-[0.99]' : ''}`}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${currentPhase.color === 'bg-slate-500' ? 'bg-slate-500/5' : currentPhase.color === 'bg-emerald-500' ? 'bg-emerald-500/5' : currentPhase.color === 'bg-indigo-500' ? 'bg-indigo-500/5' : 'bg-cyan-500/5'}`} />
              <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em] mb-10 relative z-10">Neural Load Balance</span>
              <div className="flex gap-2.5 h-28 items-end relative z-10">
                {Array.from({ length: 14 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: [
                        Math.random() * (progress > 50 ? 95 : 40) + 15 + '%', 
                        Math.random() * (progress > 50 ? 100 : 70) + 25 + '%', 
                        Math.random() * (progress > 50 ? 95 : 40) + 15 + '%'
                      ],
                      backgroundColor: isGlitching ? ['#f43f5e', '#ffffff', '#10b981'] : undefined
                    }}
                    transition={{ duration: 0.3 + Math.random() * 0.6, repeat: Infinity, ease: "linear" }}
                    className={`w-1 rounded-full transition-all duration-700 ${progress >= (i/14)*100 ? currentPhase.color : 'bg-slate-800'} ${currentPhase.glow}`}
                  />
                ))}
              </div>
              <div className="mt-8 text-[7px] font-mono tracking-widest uppercase flex items-center gap-2 relative z-10 opacity-60">
                <span className={`w-1 h-1 rounded-full animate-pulse ${currentPhase.color}`} /> SYNC_RATE: { (0.9 + Math.random() * 0.08).toFixed(6) }
              </div>
           </div>
           
           <div className={`border border-white/10 rounded-[2rem] bg-black/20 p-6 space-y-5 transition-all duration-700 ${isGlitching ? 'bg-rose-500/5' : ''}`}>
              <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black">
                 <span className="text-slate-600">Phase_Status</span>
                 <motion.span 
                   key={currentPhase.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: phaseFlash ? [1, 1.05, 1] : 1 }}
                   className={`transition-colors duration-500 ${currentPhase.text} font-black uppercase`}
                 >
                   {currentPhase.id === 'CONC' && !isComplete ? 'WAITING_SYNC' : currentPhase.id}
                 </motion.span>
              </div>
              <div className="h-1.5 bg-slate-900/50 rounded-full overflow-hidden p-[1px] border border-white/5 relative">
                 <motion.div 
                   className={`h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-700 ${currentPhase.color}`} 
                   animate={{ 
                     width: `${progress}%`,
                     filter: phaseFlash ? 'brightness(1.3)' : 'brightness(1)'
                   }} 
                 />
              </div>
              <div className="text-[7px] font-bold text-slate-500 text-center uppercase tracking-[0.3em] opacity-30">VECT_KEY: {entropy.slice(6, 14)}</div>
           </div>
        </div>
      </div>

      <div className="relative mb-8 z-30 px-2">
        <div className="flex justify-between mb-4">
          <span className={`text-[9px] font-black tracking-widest uppercase ${currentPhase.text} opacity-60`}>Analysis Progress Mapping</span>
          <span className={`text-[9px] font-black tracking-widest uppercase text-slate-500`}>{progress.toFixed(1)}% COMPLETE</span>
        </div>
        
        <div className="h-4 w-full bg-slate-900/50 rounded-lg p-1 border border-white/10 relative overflow-hidden group">
          <motion.div 
            className={`absolute inset-y-1 left-1 rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-700 ${currentPhase.color}`}
            animate={{ width: `calc(${progress}% - 8px)` }}
          />
          <div className="absolute inset-0 flex">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-white/5 last:border-0" />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
           {ANALYSIS_PHASES.map((p) => (
             <div key={p.id} className="flex flex-col items-center">
               <span className={`text-[7px] font-black uppercase tracking-widest transition-colors ${progress >= p.range[0] ? p.text : 'text-slate-800'}`}>
                 {p.id}
               </span>
               <motion.div 
                 className={`w-1 h-1 rounded-full mt-1.5 transition-all duration-700 ${progress >= p.range[0] ? p.color : 'bg-slate-900'}`}
                 animate={progress >= p.range[0] && progress < p.range[1] ? { scale: [1, 2.5, 1], opacity: [1, 0.4, 1] } : {}}
               />
             </div>
           ))}
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex justify-between items-center relative z-30 opacity-80">
        <div className="flex gap-14">
          <div className="flex flex-col">
            <span className="text-slate-600 text-[8px] font-black uppercase tracking-[0.4em]">Heuristic Precision</span>
            <span className={`text-[10px] font-mono tabular-nums tracking-tighter transition-colors duration-700 ${currentPhase.text} opacity-60`}>
              {(99.9992 - Math.random() * 0.0005).toFixed(5)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-600 text-[8px] font-black uppercase tracking-[0.4em]">Node Cluster</span>
            <span className="text-slate-400 text-[10px] font-mono tracking-tighter uppercase">N-CORE_0{Math.floor(Math.random() * 9)}::{Math.floor(Math.random() * 999)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <motion.span 
            animate={isComplete ? { color: ['#22d3ee', '#818cf8', '#22d3ee'], scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
            className={`text-[11px] font-black uppercase tracking-[0.7em] transition-colors font-mono ${isComplete ? 'text-cyan-400' : currentPhase.text}`}
          >
            {isComplete ? 'FORENSIC_SECURED' : progress > 90 ? 'NEURAL_SYNCING...' : `${currentPhase.id}_DECODE_RUN`}
          </motion.span>
          <span className="text-[7px] text-slate-700 mt-2 font-black uppercase tracking-[0.4em]">Zero_Trust_Protocol_V6.1_LINK</span>
        </div>
      </div>
    </motion.div>
  );
};

const DecryptText: React.FC<{ text: string; active: boolean; speed?: number; isGlitching?: boolean }> = ({ text, active, speed = 15, isGlitching }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = '0123456789ABCDEF!@#$%&*+=-_█▒░';

  useEffect(() => {
    if (!active) return;
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split('').map((char, index) => {
        if (index < iteration) return text[index];
        if (text[index] === ' ') return ' ';
        if (isGlitching && Math.random() < 0.05) return chars[Math.floor(Math.random() * chars.length)];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1; 
    }, speed);

    return () => clearInterval(interval);
  }, [text, active, speed, isGlitching]);

  return <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.05)]">{displayText}</span>;
};
