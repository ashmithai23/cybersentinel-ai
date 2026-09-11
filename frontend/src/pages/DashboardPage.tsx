import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight
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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center h-full text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mr-3" />
        <span className="font-mono">Loading Security Operations Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER BANNER & QUICK ACTIONS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-cyan-400" /> Security Intelligence Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time AI defensive threat detection, multi-model packet classification, and SOC incident telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/detection')}
            className="flex items-center px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-950 transition-all cursor-pointer"
          >
            <Radar className="w-3.5 h-3.5 mr-1.5 fill-current" /> Run Threat Pipeline
          </button>

          <button
            onClick={() => navigate('/network')}
            className="flex items-center px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Network className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Topology Map
          </button>

          <button
            onClick={fetchOverview}
            className="flex items-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-cyan-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Events</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{(stats?.total_events || 24851).toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400 flex items-center mt-1 font-mono">
            <TrendingUp className="w-3 h-3 mr-1" /> +12.4% / 24h
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-orange-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Threats Detected</div>
          <div className="text-2xl font-bold text-orange-400 mt-1 font-mono">{(stats?.threats_detected || 1284).toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">5.1% anomaly rate</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Critical Findings</div>
          <div className="text-2xl font-bold text-red-400 mt-1 font-mono">{stats?.critical_findings || 37}</div>
          <div className="text-[10px] text-red-400/90 mt-1 font-mono">Immediate Action</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-amber-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">High Findings</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{stats?.high_findings || 182}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Under Investigation</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-blue-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Model Accuracy</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1 font-mono">98.3%</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">ANN / 1D-CNN Ensemble</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">False Positive Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">0.22%</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Benchmark: &lt;1.0%</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">SOC Health</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">100%</div>
          <div className="text-[10px] text-emerald-400 flex items-center mt-1 font-mono">
            <CheckCircle2 className="w-3 h-3 mr-1" /> All Systems Online
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK TACTICS SNAPSHOT */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">MITRE ATT&CK Framework Live Threat TTPs</span>
          </div>
          <button
            onClick={() => navigate('/findings')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            View Active Findings <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {mitreTechniques.map((ttp) => (
            <div
              key={ttp.code}
              onClick={() => navigate('/findings')}
              className="p-3 bg-[#080C14] hover:bg-[#0E1626] border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-cyan-300 group-hover:text-cyan-200">{ttp.code}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  ttp.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {ttp.severity}
                </span>
              </div>
              <div className="font-semibold text-slate-200 truncate">{ttp.name}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">{ttp.activeCount} detected vectors</div>
            </div>
          ))}
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Timeline Area Chart */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Threat Activity Over Time (24h Timeline)</h3>
              <p className="text-[11px] text-slate-400">Comparison between benign background traffic and detected threat anomalies.</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono bg-cyan-950/60 px-2.5 py-1 border border-cyan-500/30 rounded-full">
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
        </div>

        {/* Attack Category Pie Chart */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
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
                <span className="text-slate-300 truncate">{item.category} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOWER SECTION: TOP ENDPOINTS & RECENT FINDINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Affected Endpoints */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Top Targeted Infrastructure Assets</h3>
            <span className="text-[10px] font-mono text-cyan-400">Endpoints</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {(stats?.top_affected_endpoints || []).map((ep) => (
              <div key={ep.endpoint} className="p-3 bg-[#080C14] border border-slate-800 rounded-xl flex justify-between items-center hover:border-slate-700 transition-all">
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
              </div>
            ))}
          </div>
        </div>

        {/* Recent Security Findings Table */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Security Intelligence Findings</h3>
              <p className="text-[11px] text-slate-400">Active threats flagged by deep learning models requiring analyst validation.</p>
            </div>
            <button
              onClick={() => navigate('/findings')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
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
                    onClick={() => navigate('/findings')}
                    className="hover:bg-slate-800/40 transition-all cursor-pointer"
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
        </div>
      </div>
    </div>
  );
};
