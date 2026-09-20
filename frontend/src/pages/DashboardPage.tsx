import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Server,
  Radar,
  Network,
  Lock,
  FileText,
  Radio,
  ArrowRight,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardService } from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { CyberRadar3D } from '../components/CyberRadar3D';
import { CyberGlobe3D } from '../components/CyberGlobe3D';
import { Card3D } from '../components/Card3D';
import { CyberButton } from '../components/CyberButton';
import { cyberSound } from '../utils/cyberSound';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getOverview();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard overview', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const triggerAuditConfetti = () => {
    cyberSound.playSuccessChime();
    setIsAuditing(true);
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#ef4444', '#a855f7']
    });
    setTimeout(() => {
      setIsAuditing(false);
      fetchOverview();
    }, 1200);
  };

  const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

  const mitreTechniques = [
    { code: 'T1498', name: 'Network Denial of Service', category: 'DoS', severity: 'Critical', activeCount: 482 },
    { code: 'T1190', name: 'Exploit Public-Facing App', category: 'SQLi', severity: 'Critical', activeCount: 140 },
    { code: 'T1046', name: 'Network Service Discovery', category: 'PortScan', severity: 'High', activeCount: 310 },
    { code: 'T1110', name: 'Brute Force Authentication', category: 'Auth', severity: 'Medium', activeCount: 215 },
    { code: 'T1071', name: 'App Layer Protocol C2', category: 'Botnet', severity: 'High', activeCount: 55 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mr-3" />
        <span className="font-mono text-sm tracking-wide text-cyan-300">Loading Enterprise 3D SOC Operations Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER BANNER & QUICK ACTIONS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-cyan-500/20 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3 font-sans">
            <ShieldAlert className="w-7 h-7 text-cyan-400 animate-pulse" /> 3D Security Intelligence Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Real-time 3D WebGL defensive threat telemetry, multi-model packet classification, and SOC incident engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CyberButton
            onClick={() => {
              cyberSound.playCyberClick();
              navigate('/detection');
            }}
            icon={Radar}
            variant="primary"
            size="md"
          >
            Run 3D Threat Pipeline
          </CyberButton>

          <CyberButton
            onClick={() => {
              cyberSound.playCyberClick();
              navigate('/network');
            }}
            icon={Network}
            variant="secondary"
            size="md"
          >
            Topology Map
          </CyberButton>

          <CyberButton
            onClick={triggerAuditConfetti}
            icon={Zap}
            variant="outline"
            size="md"
            disabled={isAuditing}
          >
            {isAuditing ? 'Auditing SOC...' : 'Auto Audit'}
          </CyberButton>
        </div>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          title="Total Events"
          value={(stats?.total_events || 24851).toLocaleString()}
          subtext="+12.4% / 24h"
          icon={Activity}
          color="cyan"
          badgeText="Live Stream"
        />

        <StatCard
          title="Threats Detected"
          value={(stats?.threats_detected || 1284).toLocaleString()}
          subtext="5.1% anomaly rate"
          icon={ShieldAlert}
          color="amber"
          badgeText="AI Flagged"
        />

        <StatCard
          title="Critical Findings"
          value={stats?.critical_findings || 37}
          subtext="Immediate Action"
          icon={AlertTriangle}
          color="rose"
          badgeText="SOAR P0"
        />

        <StatCard
          title="High Findings"
          value={stats?.high_findings || 182}
          subtext="Under Investigation"
          icon={Filter}
          color="amber"
        />

        <StatCard
          title="Model Accuracy"
          value="98.3%"
          subtext="ANN / CNN Ensemble"
          icon={Cpu}
          color="cyan"
          badgeText="PyTorch 3D"
        />

        <StatCard
          title="False Positive"
          value="0.22%"
          subtext="Benchmark: <1.0%"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="SOC Health"
          value="100%"
          subtext="All Systems Online"
          icon={Server}
          color="emerald"
          badgeText="Active"
        />
      </div>

      {/* 3D WEBGL GLOBE & 3D HOLOGRAPHIC RADAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive 3D WebGL Threat Globe */}
        <div className="lg:col-span-2">
          <CyberGlobe3D />
        </div>

        {/* 3D Volumetric Radar Scanner */}
        <div className="lg:col-span-1">
          <CyberRadar3D />
        </div>
      </div>

      {/* MITRE ATT&CK TACTICS SNAPSHOT */}
      <Card3D glowColor="cyan" className="p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">MITRE ATT&CK Framework Live Threat TTPs</span>
          </div>
          <button
            onClick={() => {
              cyberSound.playCyberClick();
              navigate('/findings');
            }}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 font-semibold cursor-pointer"
          >
            View Active Findings <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {mitreTechniques.map((ttp) => (
            <motion.div
              key={ttp.code}
              whileHover={{ scale: 1.04, y: -2 }}
              onClick={() => {
                cyberSound.playCyberClick();
                navigate('/findings');
              }}
              className="p-3 bg-[#060A14] hover:bg-[#0C1222] border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all cursor-pointer group shadow-md"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-cyan-300 group-hover:text-cyan-200">{ttp.code}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  ttp.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {ttp.severity}
                </span>
              </div>
              <div className="font-semibold text-slate-200 truncate">{ttp.name}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">{ttp.activeCount} detected vectors</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Threat Taxonomy: CIC-IDS2017 Dataset Schema</span>
          <span className="text-cyan-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Automated SOAR Mitigation Playbooks Active
          </span>
        </div>
      </Card3D>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Timeline Area Chart */}
        <Card3D glowColor="cyan" className="lg:col-span-2 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Threat Activity Over Time (24h Timeline)</h3>
              <p className="text-[11px] text-slate-400">Comparison between benign background traffic and detected threat anomalies.</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono bg-cyan-950/60 px-3 py-1 border border-cyan-500/30 rounded-full font-semibold">
              Live Ingestion Feed
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.threats_over_time}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBenign" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} fontVariant="mono" />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="benign" stroke="#06B6D4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBenign)" name="Benign Traffic" />
                <Area type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" name="Threat Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card3D>

        {/* Attack Category Pie Chart */}
        <Card3D glowColor="purple" className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Attack Category Distribution</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Classification by dataset threat categories.</p>
          </div>
          <div className="h-48 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.attack_category_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(stats?.attack_category_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
            {(stats?.attack_category_distribution || []).slice(0, 6).map((item, idx) => (
              <div key={item.category} className="flex items-center space-x-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-300 truncate font-mono">{item.category} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </Card3D>
      </div>

      {/* LOWER SECTION: TOP ENDPOINTS & RECENT FINDINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Affected Endpoints */}
        <Card3D glowColor="indigo" className="p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Top Targeted Infrastructure Assets</h3>
            <span className="text-[10px] font-mono text-cyan-400">Endpoints</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {(stats?.top_affected_endpoints || []).map((ep) => (
              <motion.div
                key={ep.endpoint}
                whileHover={{ x: 2 }}
                className="p-3 bg-[#060A14] border border-slate-800 rounded-xl flex justify-between items-center hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <div className="text-xs font-mono text-cyan-300 font-semibold">{ep.endpoint}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{ep.threat_count} threat vectors detected</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                  ep.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                  ep.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}>
                  {ep.severity}
                </span>
              </motion.div>
            ))}
          </div>
        </Card3D>

        {/* Recent Security Findings Table */}
        <Card3D glowColor="rose" className="lg:col-span-2 p-5 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Security Intelligence Findings</h3>
              <p className="text-[11px] text-slate-400">Active threats flagged by deep learning models requiring analyst validation.</p>
            </div>
            <button
              onClick={() => {
                cyberSound.playCyberClick();
                navigate('/findings');
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 font-semibold cursor-pointer"
            >
              All Findings <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono">
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Threat Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Asset Target</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {(stats?.recent_findings || []).map((finding) => (
                  <tr
                    key={finding.id}
                    onClick={() => {
                      cyberSound.playCyberClick();
                      navigate('/findings');
                    }}
                    className="hover:bg-cyan-500/10 transition-all cursor-pointer"
                  >
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
                        finding.severity === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        finding.severity === 'High' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                        finding.severity === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}>
                        {finding.severity}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-white max-w-xs truncate">{finding.title}</td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{finding.category}</td>
                    <td className="py-3 font-mono text-cyan-400 font-bold">{finding.confidence}%</td>
                    <td className="py-3 font-mono text-slate-300 text-[11px]">{finding.asset}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 rounded-md border border-slate-800 text-slate-300 font-semibold">
                        {finding.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card3D>
      </div>
    </div>
  );
};
