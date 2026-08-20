import React, { useEffect, useState } from 'react';
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
  Server
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
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { dashboardService } from '../services/api';
import { DashboardStats } from '../types';

export const DashboardPage: React.FC = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mr-3" />
        <span>Loading Security Operations Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Security Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI-assisted monitoring, threat detection and vulnerability intelligence.
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <button
            onClick={fetchOverview}
            className="flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh Feed
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Total Events</div>
          <div className="text-2xl font-bold text-white mt-1">24,851</div>
          <div className="text-[10px] text-emerald-400 flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" /> +12.4% / 24h
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-orange-500">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Threats Detected</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">1,284</div>
          <div className="text-[10px] text-slate-400 mt-1">5.1% anomaly rate</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Critical Findings</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{stats?.critical_findings || 37}</div>
          <div className="text-[10px] text-red-400/80 mt-1">Requires immediate action</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-amber-500">
          <div className="text-[11px] font-medium text-slate-400 uppercase">High Findings</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{stats?.high_findings || 182}</div>
          <div className="text-[10px] text-slate-400 mt-1">Under investigation</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Model Accuracy</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">98.3%</div>
          <div className="text-[10px] text-slate-400 mt-1">ANN & 1D-CNN ensemble</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 uppercase">False Positive Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">0.22%</div>
          <div className="text-[10px] text-slate-400 mt-1">Defensive benchmark</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 uppercase">System Health</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">100%</div>
          <div className="text-[10px] text-emerald-400/80 flex items-center mt-1">
            <CheckCircle2 className="w-3 h-3 mr-1" /> All Systems Operational
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Timeline Area Chart */}
        <div className="lg:col-span-2 glass-card p-5 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Threat Activity Over Time (24h)</h3>
              <p className="text-[11px] text-slate-400">Comparison between benign background traffic and detected threat anomalies.</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono bg-cyan-950/50 px-2 py-1 border border-cyan-500/30 rounded">Live Feed</span>
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
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1E293B', fontSize: '12px' }} />
                <Area type="monotone" dataKey="benign" stroke="#06B6D4" fillOpacity={1} fill="url(#colorBenign)" name="Benign Traffic" />
                <Area type="monotone" dataKey="threats" stroke="#EF4444" fillOpacity={1} fill="url(#colorThreats)" name="Threat Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Category Pie Chart */}
        <div className="glass-card p-5 rounded-xl">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Attack Category Distribution</h3>
            <p className="text-[11px] text-slate-400">Classification by dataset threat categories.</p>
          </div>
          <div className="h-48 flex items-center justify-center">
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
                <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1E293B', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
            {(stats?.attack_category_distribution || []).map((item, idx) => (
              <div key={item.category} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-300 truncate">{item.category} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOWER SECTION: TOP ENDPOINTS & RECENT FINDINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Affected Endpoints */}
        <div className="glass-card p-5 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-3">Top Targeted Infrastructure Assets</h3>
          <div className="space-y-3">
            {(stats?.top_affected_endpoints || []).map((ep) => (
              <div key={ep.endpoint} className="p-3 bg-[#0B0F17] border border-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <div className="text-xs font-mono text-cyan-300 font-semibold">{ep.endpoint}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{ep.threat_count} threat vectors detected</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
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
        <div className="lg:col-span-2 glass-card p-5 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Security Intelligence Findings</h3>
            <span className="text-xs text-slate-400">Total {(stats?.recent_findings || []).length} Managed Findings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
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
                  <tr key={finding.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        finding.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        finding.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                        finding.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {finding.severity}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-white max-w-xs truncate">{finding.title}</td>
                    <td className="py-3 text-slate-400">{finding.category}</td>
                    <td className="py-3 font-mono text-cyan-400">{finding.confidence}%</td>
                    <td className="py-3 font-mono text-slate-300 text-[11px]">{finding.asset}</td>
                    <td className="py-3">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">
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
