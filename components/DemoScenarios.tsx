
import React from 'react';
import { motion } from 'framer-motion';

interface Scenario {
  title: string;
  description: string;
  content: string;
  type: 'SMS' | 'URL' | 'EMAIL';
}

const SCENARIOS: Scenario[] = [
  {
    title: "Bank Urgent Alert",
    description: "Typical SMS phishing attack aiming for banking credentials.",
    type: 'SMS',
    content: "URGENT: Your Chase account has been locked due to suspicious activity. Verify your identity immediately at https://chase-security-portal-verify.com or your funds will be frozen."
  },
  {
    title: "Suspicious Crypto Airdrop",
    description: "Social media scam targeting crypto wallets.",
    type: 'URL',
    content: "CONGRATS! You've been selected for the $SOL airdrop. Claim your 100 SOL now at http://solana-airdrop-claim-2024.xyz/connect-wallet"
  },
  {
    title: "Legit Company Update",
    description: "A standard, safe business communication.",
    type: 'EMAIL',
    content: "Hi Team, the Q3 quarterly report is now available on the internal company drive. Please review it before our meeting tomorrow. Best, Sarah."
  }
];

interface DemoScenariosProps {
  onSelect: (content: string) => void;
  isDarkMode: boolean;
}

const DemoScenarios: React.FC<DemoScenariosProps> = ({ onSelect, isDarkMode }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      <h4 className={`text-[10px] font-mono uppercase tracking-widest mb-3 ml-1 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Threat Simulation Scenarios</h4>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {SCENARIOS.map((s, idx) => (
          <motion.button
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ 
              y: -5, 
              scale: 1.02,
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
              borderColor: 'rgba(16, 185, 129, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(s.content)}
            className={`text-left border p-4 rounded-xl transition-all duration-300 group ${
              isDarkMode 
                ? 'bg-slate-900/40 border-slate-800' 
                : 'bg-white border-slate-200 shadow-sm shadow-slate-200/50'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter transition-all duration-300 ${isDarkMode ? 'text-emerald-500/80 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-500/5'} group-hover:bg-emerald-500/20`}>
                {s.type}
              </span>
              <span className={`text-xs font-mono transition-colors duration-300 group-hover:text-emerald-400 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>#0{idx + 1}</span>
            </div>
            <p className={`text-sm font-black truncate group-hover:text-emerald-500 transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{s.title}</p>
            <p className={`text-[11px] leading-tight mt-1 line-clamp-2 transition-colors duration-300 ${isDarkMode ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-500 group-hover:text-slate-600'}`}>{s.description}</p>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default DemoScenarios;
