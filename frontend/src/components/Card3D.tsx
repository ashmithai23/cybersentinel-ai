import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo';
  onClick?: () => void;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  glowColor = 'cyan',
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const px = mouseX / width;
    const py = mouseY / height;

    // Calculate rotation (-12deg to +12deg)
    const rY = (px - 0.5) * 16;
    const rX = (0.5 - py) * 16;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({ x: px * 100, y: py * 100 });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const glowStyles = {
    cyan: 'border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_10px_30px_-5px_rgba(6,182,212,0.15)] hover:shadow-[0_20px_50px_-5px_rgba(6,182,212,0.35)]',
    emerald: 'border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_10px_30px_-5px_rgba(16,185,129,0.15)] hover:shadow-[0_20px_50px_-5px_rgba(16,185,129,0.35)]',
    amber: 'border-amber-500/30 hover:border-amber-400/60 shadow-[0_10px_30px_-5px_rgba(245,158,11,0.15)] hover:shadow-[0_20px_50px_-5px_rgba(245,158,11,0.35)]',
    rose: 'border-rose-500/30 hover:border-rose-400/60 shadow-[0_10px_30px_-5px_rgba(239,68,68,0.15)] hover:shadow-[0_20px_50px_-5px_rgba(239,68,68,0.35)]',
    purple: 'border-purple-500/30 hover:border-purple-400/60 shadow-[0_10px_30px_-5px_rgba(168,85,247,0.15)] hover:shadow-[0_20px_50px_-5px_rgba(168,85,247,0.35)]',
    indigo: 'border-indigo-500/30 hover:border-indigo-400/60 shadow-[0_10px_30px_-5px_rgba(99,102,241,0.15)] hover:shadow-[0_20px_50px_-5px_rgba(99,102,241,0.35)]'
  }[glowColor];

  return (
    <div className="perspective-1000 w-full" style={{ perspective: '1000px' }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`relative glass-panel bg-[#0B101D]/90 backdrop-blur-2xl rounded-2xl border transition-colors duration-300 overflow-hidden ${glowStyles} ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Dynamic Holographic Glare */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 65%)`
            }}
          />
        )}

        <div style={{ transform: 'translateZ(20px)' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};
