import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  onClick,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-xs font-semibold rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-sm font-bold rounded-2xl gap-2.5'
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-400/40',
    secondary:
      'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 shadow-md',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-600/25 hover:shadow-red-600/40 border border-red-400/40',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 border border-emerald-400/40',
    outline:
      'bg-transparent hover:bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400'
  }[variant];

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center font-sans tracking-wide transition-all overflow-hidden cursor-pointer select-none ${sizeStyles} ${variantStyles} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {/* Laser Shimmer Effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

      {Icon && <Icon className="w-4 h-4 transition-transform group-hover:rotate-12" />}
      <span>{children}</span>
    </motion.button>
  );
};
