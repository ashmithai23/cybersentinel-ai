import React, { useEffect, useState } from 'react';
import { BookOpen, Cpu, ShieldAlert, CheckCircle2, AlertTriangle, Terminal, Code2, Database } from 'lucide-react';
import { settingsService } from '../services/api';
import { SystemInfo } from '../types';

export const ProjectInfoPage: React.FC = () => {
  const [info, setInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    settingsService.getInfo().then(setInfo).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-card p-6 rounded-xl border-l-4 border-l-cyan-500">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-bold text-white">INTERVIEW MODE — Technical Architecture & ML Rationale</h1>
        </div>
        <p className="text-xs text-slate-300">
          Detailed technical reference designed for demonstrating this portfolio project during cybersecurity and AI/ML engineering interviews.
        </p>
      </div>

      {/* PROBLEM & SOLUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="glass-card p-5 rounded-xl space-y-2">
          <h3 className="font-bold text-red-400 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Problem Statement
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {info?.architecture.problem_statement || 'Legacy signature-based IDSs fail to catch zero-day variants and produce excessive false positive alerts.'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl space-y-2">
          <h3 className="font-bold text-cyan-400 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> AI Defensive Solution
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {info?.architecture.solution || 'CyberSentinel AI pairs multi-architecture deep learning with explainable feature importance and human analyst verification.'}
          </p>
        </div>
      </div>

      {/* WHY ANN, WHY CNN, WHY LSTM */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" /> Architectural Design Decisions (Why ANN? Why 1D CNN? Why LSTM?)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#0B0F17] border border-slate-800 rounded-lg space-y-2">
            <div className="font-bold text-cyan-300">1. Artificial Neural Network (ANN/MLP)</div>
            <p className="text-slate-400 leading-relaxed">
              {info?.architecture.ml_justifications?.why_ann}
            </p>
          </div>

          <div className="p-4 bg-[#0B0F17] border border-slate-800 rounded-lg space-y-2">
            <div className="font-bold text-cyan-300">2. 1D Convolutional Neural Network (1D CNN)</div>
            <p className="text-slate-400 leading-relaxed">
              {info?.architecture.ml_justifications?.why_cnn1d}
            </p>
          </div>

          <div className="p-4 bg-[#0B0F17] border border-slate-800 rounded-lg space-y-2">
            <div className="font-bold text-cyan-300">3. LSTM Sequence Model</div>
            <p className="text-slate-400 leading-relaxed">
              {info?.architecture.ml_justifications?.why_lstm}
            </p>
          </div>
        </div>
      </div>

      {/* RISK SCORING & ETHICAL BOUNDARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="glass-card p-5 rounded-xl space-y-2">
          <h3 className="font-bold text-amber-400 text-sm">Transparent Risk Engine Formula</h3>
          <p className="p-3 bg-[#0B0F17] border border-slate-800 rounded font-mono text-cyan-300 text-[11px]">
            {info?.architecture.risk_scoring_formula}
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl space-y-2">
          <h3 className="font-bold text-emerald-400 text-sm">Defensive & Ethical Guardrails</h3>
          <p className="p-3 bg-[#0B0F17] border border-slate-800 rounded text-slate-300 text-[11px] leading-relaxed">
            {info?.ethical_boundary}
          </p>
        </div>
      </div>
    </div>
  );
};
