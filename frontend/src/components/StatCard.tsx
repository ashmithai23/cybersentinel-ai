import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendUp,
  color = 'cyan',
  badgeText
}) => {
  const colorStyles = {
    cyan: {
      border: 'hover:border-cyan-500/50',
      glow: 'hover:shadow-cyan-500/20',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      glow: 'hover:shadow-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    amber: {
      border: 'hover:border-amber-500/50',
      glow: 'hover:shadow-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    rose: {
      border: 'hover:border-rose-500/50',
      glow: 'hover:shadow-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    indigo: {
      border: 'hover:border-indigo-500/50',
      glow: 'hover:shadow-indigo-500/20',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    purple: {
      border: 'hover:border-purple-500/50',
      glow: 'hover:shadow-purple-500/20',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    }
  }[color];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative glass-card p-5 rounded-2xl border border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-xl shadow-xl transition-all duration-300 overflow-hidden group ${colorStyles.border} ${colorStyles.glow}`}
    >
      {/* Background Accent Mesh Glow */}
      <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl group-hover:opacity-100 opacity-30 transition-opacity"></div>

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            {title}
            {badgeText && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${colorStyles.badge}`}>
                {badgeText}
              </span>
            )}
          </span>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight font-sans flex items-baseline gap-2">
            <span>{value}</span>
            {trend && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full font-mono border ${
                trendUp
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-slate-400 mt-1 font-mono">{subtext}</p>}
        </div>

        <div className={`p-3 rounded-2xl border shadow-inner transition-transform group-hover:scale-110 ${colorStyles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Futuristic Bottom Scan Line */}
      <div className="mt-4 w-full bg-slate-800/60 h-1 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400"
        />
      </div>
    </motion.div>
  );
};
