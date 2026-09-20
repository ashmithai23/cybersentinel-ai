import React from 'react';
import { motion } from 'framer-motion';

export const CyberRadar: React.FC = () => {
  return (
    <div className="relative w-full h-64 flex items-center justify-center bg-[#070B14] rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl group">
      {/* Background Cyber Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>

      {/* Concentric Radar Rings */}
      <div className="absolute w-56 h-56 rounded-full border border-cyan-500/20"></div>
      <div className="absolute w-40 h-40 rounded-full border border-cyan-500/30 border-dashed"></div>
      <div className="absolute w-24 h-24 rounded-full border border-cyan-500/40"></div>
      <div className="absolute w-8 h-8 rounded-full border border-cyan-400 bg-cyan-500/20 animate-ping"></div>

      {/* Crosshairs */}
      <div className="absolute w-full h-[1px] bg-cyan-500/20"></div>
      <div className="absolute h-full w-[1px] bg-cyan-500/20"></div>

      {/* Rotating Radar Sweep Beam */}
      <div className="absolute w-56 h-56 rounded-full animate-radar pointer-events-none">
        <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/40 via-cyan-500/10 to-transparent origin-bottom-right rounded-tl-full"></div>
      </div>

      {/* Simulated Live Threat Coordinates (Pulsing Blips) */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="absolute top-16 right-20 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444]"
        title="Active DDoS Attack Node"
      >
        <span className="absolute -top-4 -right-12 text-[9px] font-mono text-red-400 font-bold bg-black/60 px-1 rounded border border-red-500/30">
          DoS 98.4%
        </span>
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }}
        className="absolute bottom-20 left-24 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]"
        title="Port Scan Anomaly"
      >
        <span className="absolute -bottom-4 -left-8 text-[9px] font-mono text-amber-300 font-bold bg-black/60 px-1 rounded border border-amber-500/30">
          PortScan
        </span>
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1.1 }}
        className="absolute top-28 left-28 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#06b6d4]"
        title="Authorized Node"
      />

      {/* Center Holographic Badge */}
      <div className="absolute bottom-3 right-4 px-3 py-1 bg-[#0F172A]/90 backdrop-blur border border-cyan-500/30 rounded-lg text-[10px] font-mono text-cyan-300 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        RADAR: ACTIVE STREAM 2.4 GHz
      </div>
    </div>
  );
};
