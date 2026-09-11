import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Code2,
  Database,
  Calculator,
  Sliders,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { settingsService } from '../services/api';
import { SystemInfo } from '../types';

export const ProjectInfoPage: React.FC = () => {
  const [info, setInfo] = useState<SystemInfo | null>(null);

  // Interactive Risk Formula Calculator State
  const [baseCategory, setBaseCategory] = useState<string>('Denial of Service (DoS)');
  const [modelConfidence, setModelConfidence] = useState<number>(96);
  const [isCriticalAsset, setIsCriticalAsset] = useState<boolean>(true);
  const [isHighFrequency, setIsHighFrequency] = useState<boolean>(true);

  // Feature Dictionary Search
  const [featureSearch, setFeatureSearch] = useState<string>('');

  useEffect(() => {
    settingsService.getInfo().then(setInfo).catch(console.error);
  }, []);

  const categoryBaseWeights: Record<string, number> = {
    'Web Attack - SQL Injection': 95,
    'Denial of Service (DoS)': 90,
    'Botnet / C2 Beaconing': 85,
    'PortScan Sweep': 70,
    'Brute Force Authentication': 65,
    'Benign Normal Traffic': 0
  };

  const calculateCalculatedRisk = () => {
    const base = categoryBaseWeights[baseCategory] || 50;
    const confidenceScaled = base * (modelConfidence / 100);
    const assetBonus = isCriticalAsset ? 10 : 0;
    const freqBonus = isHighFrequency ? 15 : 0;
    const total = Math.min(100, Math.round(confidenceScaled + assetBonus + freqBonus));

    let severity = 'Low';
    let color = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (total >= 80) {
      severity = 'Critical';
      color = 'text-red-400 border-red-500/30 bg-red-500/10';
    } else if (total >= 60) {
      severity = 'High';
      color = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    } else if (total >= 40) {
      severity = 'Medium';
      color = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    }

    return {
      base,
      confidenceScaled: Math.round(confidenceScaled),
      assetBonus,
      freqBonus,
      total,
      severity,
      color
    };
  };

  const riskResult = calculateCalculatedRisk();

  const featureDictionary = [
    { name: 'destination_port', type: 'Integer (0-65535)', desc: 'Target listening service port (e.g. 80 HTTP, 443 HTTPS, 22 SSH, 3306 MySQL). Key indicator for targeted reconnaissance.' },
    { name: 'flow_duration', type: 'Float (Microseconds)', desc: 'Total lifetime of the bidirectional network flow. Zero-duration bursts often signify single-packet scanning sweeps.' },
    { name: 'total_fwd_packets', type: 'Integer', desc: 'Forward packet count sent from client to server. Extremely high ratios indicate volumetric flood vectors.' },
    { name: 'total_backward_packets', type: 'Integer', desc: 'Response packets returned by server. Asymmetry indicates spoofed IP addresses where return ACKs are never completed.' },
    { name: 'flow_bytes_s', type: 'Float (Bytes/sec)', desc: 'Throughput bandwidth rate. Used to detect bandwidth exfiltration and saturation floods.' },
    { name: 'flow_packets_s', type: 'Float (Packets/sec)', desc: 'Packet generation frequency. Key metric for differentiating automated tools from human interactive sessions.' },
    { name: 'syn_flag_count', type: 'Binary (0 or 1)', desc: 'TCP connection initiation flag. High SYN without corresponding ACK/FIN signifies classic TCP SYN flood DoS.' },
    { name: 'psh_flag_count', type: 'Binary (0 or 1)', desc: 'Urgent Push flag instructing recipient to immediately push data to application layer. High during data injection attacks.' },
    { name: 'rst_flag_count', type: 'Binary (0 or 1)', desc: 'Connection reset flag. Abnormal bursts indicate closed-port rejection during brute force or host discovery.' },
    { name: 'down_up_ratio', type: 'Float', desc: 'Ratio of downloaded to uploaded payload. Deviation from normal application profiles indicates stealth tunneling.' }
  ];

  const filteredFeatures = featureDictionary.filter(f =>
    f.name.toLowerCase().includes(featureSearch.toLowerCase()) ||
    f.desc.toLowerCase().includes(featureSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="glass-card p-6 rounded-2xl border-l-4 border-l-cyan-500 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-bold text-white tracking-wide">
            INTERVIEW MODE — Technical Architecture, ML Rationale & Risk Formulas
          </h1>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Comprehensive defense portfolio dossier designed for engineering discussions, architecture deep-dives, and cybersecurity defense demonstrations.
        </p>
      </div>

      {/* PROBLEM & SOLUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="glass-card p-5 rounded-2xl space-y-2 border-l-4 border-l-red-500">
          <h3 className="font-bold text-red-400 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Core Problem Statement
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {info?.architecture.problem_statement ||
              'Legacy signature-based Intrusion Detection Systems (IDS) suffer from catastrophic false positive rates (>95%) and fail to detect novel zero-day attack variants across encrypted high-throughput enterprise backbones.'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border-l-4 border-l-cyan-500">
          <h3 className="font-bold text-cyan-400 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> AI Defensive Architecture
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {info?.architecture.solution ||
              'CyberSentinel AI deploys a multi-model deep learning inference engine (ANN, 1D-CNN, LSTM) paired with transparent explainability (SHAP feature attribution), mathematical risk engine, and SOAR automated playbook containment.'}
          </p>
        </div>
      </div>

      {/* INTERACTIVE TRANSPARENT RISK CALCULATOR */}
      <div className="glass-card p-6 rounded-2xl space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" /> Interactive Transparent Risk Engine Sandbox
            </h3>
            <p className="text-[11px] text-slate-400">Tweak formula variables to verify how CyberSentinel computes deterministic 0-100 risk scores.</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Live Math Sandbox
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Controls */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Threat Category (Base Weight: {riskResult.base})</label>
              <select
                value={baseCategory}
                onChange={(e) => setBaseCategory(e.target.value)}
                className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                {Object.keys(categoryBaseWeights).map(cat => (
                  <option key={cat} value={cat}>{cat} (Base: {categoryBaseWeights[cat]})</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Model Confidence %</span>
                <span className="text-cyan-400 font-bold">{modelConfidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={modelConfidence}
                onChange={(e) => setModelConfidence(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isCriticalAsset}
                  onChange={(e) => setIsCriticalAsset(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-300 text-xs">Sensitive Asset (+10 Bonus)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isHighFrequency}
                  onChange={(e) => setIsHighFrequency(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-300 text-xs">Volumetric Repeat (+15 Bonus)</span>
              </label>
            </div>
          </div>

          {/* Output Display */}
          <div className="p-5 bg-[#080C14] border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Computed Risk Score</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-extrabold font-mono text-white">{riskResult.total}</span>
                <span className="text-slate-500 font-mono text-sm">/ 100</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${riskResult.color}`}>
                  {riskResult.severity} Severity
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono space-y-1 text-slate-300">
              <div className="text-cyan-400 text-[10px] uppercase font-bold">Mathematical Formula Breakdown:</div>
              <div>Scaled Base: {riskResult.base} × ({modelConfidence}%) = <strong className="text-white">{riskResult.confidenceScaled}</strong></div>
              <div>Asset Criticality Bonus: <strong className="text-white">+{riskResult.assetBonus}</strong></div>
              <div>Repeat Incursion Bonus: <strong className="text-white">+{riskResult.freqBonus}</strong></div>
              <div className="border-t border-slate-800 pt-1 text-cyan-300 font-bold">
                Total Score = min(100, {riskResult.confidenceScaled} + {riskResult.assetBonus} + {riskResult.freqBonus}) = {riskResult.total}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHY ANN, WHY 1D-CNN, WHY LSTM */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" /> Architectural Design Decisions (Why ANN? Why 1D-CNN? Why LSTM?)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#080C14] border border-slate-800 rounded-xl space-y-2">
            <div className="font-bold text-cyan-300 font-mono">1. Multi-Layer Perceptron (ANN)</div>
            <p className="text-slate-300 leading-relaxed">
              {info?.architecture.ml_justifications?.why_ann ||
                'MLP models non-linear correlations across static flow features with rapid sub-6ms batch latency, making it the primary choice for line-rate perimeter packet triage.'}
            </p>
          </div>

          <div className="p-4 bg-[#080C14] border border-slate-800 rounded-xl space-y-2">
            <div className="font-bold text-cyan-300 font-mono">2. 1D Convolutional Neural Net</div>
            <p className="text-slate-300 leading-relaxed">
              {info?.architecture.ml_justifications?.why_cnn1d ||
                '1D-CNN filters slide across adjacent header metrics to extract spatial and ratio patterns (e.g. packet size variance vs flag ratios) invariant to absolute scale.'}
            </p>
          </div>

          <div className="p-4 bg-[#080C14] border border-slate-800 rounded-xl space-y-2">
            <div className="font-bold text-cyan-300 font-mono">3. LSTM Temporal Memory</div>
            <p className="text-slate-300 leading-relaxed">
              {info?.architecture.ml_justifications?.why_lstm ||
                'LSTM gates capture multi-step temporal attack progressions over sequential time windows, such as slow-and-low port reconnaissance followed by credential stuffing.'}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCHABLE CIC-IDS2017 FEATURE DICTIONARY */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" /> CIC-IDS2017 Benchmark Feature Dictionary
            </h3>
            <p className="text-[11px] text-slate-400">Domain definitions for network flow features extracted from PCAP sessions.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search feature names..."
              value={featureSearch}
              onChange={(e) => setFeatureSearch(e.target.value)}
              className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredFeatures.map((feat) => (
            <div key={feat.name} className="p-3 bg-[#080C14] border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="flex justify-between items-center font-mono">
                <span className="font-bold text-cyan-300">{feat.name}</span>
                <span className="text-[10px] text-slate-500">{feat.type}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DEFENSIVE & ETHICAL GUARDRAILS */}
      <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500 space-y-2 text-xs">
        <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Defensive Scope & Ethical Guardrails Statement
        </h3>
        <p className="text-slate-300 leading-relaxed">
          {info?.ethical_boundary ||
            'DEFENSIVE ONLY. CyberSentinel AI is built exclusively for authorized threat monitoring, incident response, anomaly triage, and vulnerability reporting. It contains zero autonomous offensive exploit modules, credential harvesting, or unauthorized network scanning capabilities.'}
        </p>
      </div>
    </div>
  );
};
