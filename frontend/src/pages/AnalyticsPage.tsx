import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  Download,
  AlertOctagon,
  Zap,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Datasets tailored per timeframe
  const datasets = {
    '24h': [
      { period: '00:00', benign: 1200, threats: 45, risk_avg: 38, dos: 18, sqli: 5, portscan: 12, bruteforce: 10 },
      { period: '04:00', benign: 980, threats: 28, risk_avg: 32, dos: 10, sqli: 2, portscan: 8, bruteforce: 8 },
      { period: '08:00', benign: 2400, threats: 94, risk_avg: 58, dos: 42, sqli: 15, portscan: 22, bruteforce: 15 },
      { period: '12:00', benign: 3800, threats: 210, risk_avg: 74, dos: 98, sqli: 35, portscan: 45, bruteforce: 32 },
      { period: '16:00', benign: 3200, threats: 165, risk_avg: 68, dos: 72, sqli: 28, portscan: 38, bruteforce: 27 },
      { period: '20:00', benign: 2100, threats: 88, risk_avg: 49, dos: 35, sqli: 12, portscan: 24, bruteforce: 17 }
    ],
    '7d': [
      { period: 'Mon', benign: 14200, threats: 620, risk_avg: 52, dos: 280, sqli: 90, portscan: 140, bruteforce: 110 },
      { period: 'Tue', benign: 16800, threats: 840, risk_avg: 64, dos: 390, sqli: 130, portscan: 190, bruteforce: 130 },
      { period: 'Wed', benign: 19100, threats: 1120, risk_avg: 78, dos: 540, sqli: 180, portscan: 240, bruteforce: 160 },
      { period: 'Thu', benign: 17400, threats: 910, risk_avg: 66, dos: 410, sqli: 140, portscan: 210, bruteforce: 150 },
      { period: 'Fri', benign: 21500, threats: 1350, risk_avg: 82, dos: 680, sqli: 210, portscan: 280, bruteforce: 180 },
      { period: 'Sat', benign: 9800, threats: 410, risk_avg: 44, dos: 190, sqli: 55, portscan: 95, bruteforce: 70 },
      { period: 'Sun', benign: 8900, threats: 320, risk_avg: 40, dos: 140, sqli: 40, portscan: 80, bruteforce: 60 }
    ],
    '30d': [
      { period: 'Week 1', benign: 42000, threats: 1850, risk_avg: 54, dos: 880, sqli: 280, portscan: 420, bruteforce: 270 },
      { period: 'Week 2', benign: 51000, threats: 2420, risk_avg: 68, dos: 1150, sqli: 390, portscan: 540, bruteforce: 340 },
      { period: 'Week 3', benign: 48000, threats: 2100, risk_avg: 62, dos: 980, sqli: 320, portscan: 480, bruteforce: 320 },
      { period: 'Week 4', benign: 56000, threats: 2950, risk_avg: 75, dos: 1420, sqli: 480, portscan: 610, bruteforce: 440 }
    ],
    '90d': [
      { period: 'Month 1', benign: 185000, threats: 7800, risk_avg: 58, dos: 3600, sqli: 1200, portscan: 1800, bruteforce: 1200 },
      { period: 'Month 2', benign: 210000, threats: 9400, risk_avg: 66, dos: 4400, sqli: 1500, portscan: 2100, bruteforce: 1400 },
      { period: 'Month 3', benign: 235000, threats: 11200, risk_avg: 73, dos: 5300, sqli: 1800, portscan: 2400, bruteforce: 1700 }
    ],
    '1y': [
      { period: 'Q1', benign: 520000, threats: 22000, risk_avg: 56, dos: 10200, sqli: 3400, portscan: 5100, bruteforce: 3300 },
      { period: 'Q2', benign: 610000, threats: 27500, risk_avg: 64, dos: 12800, sqli: 4300, portscan: 6200, bruteforce: 4200 },
      { period: 'Q3', benign: 680000, threats: 31000, risk_avg: 70, dos: 14500, sqli: 4900, portscan: 6900, bruteforce: 4700 },
      { period: 'Q4', benign: 740000, threats: 36200, risk_avg: 76, dos: 17100, sqli: 5800, portscan: 7800, bruteforce: 5500 }
    ]
  };

  const currentData = datasets[timeRange];

  // Severity Distribution Data
  const severityDistribution = [
    { name: 'Critical', value: 38, color: '#EF4444' },
    { name: 'High', value: 32, color: '#F97316' },
    { name: 'Medium', value: 21, color: '#F59E0B' },
    { name: 'Low', value: 9, color: '#3B82F6' }
  ];

  // Attack Vectors Category Shares
  const categoryShares = [
    { category: 'Denial of Service (DoS)', count: '48.2%', color: '#EF4444' },
    { category: 'PortScan Activity', count: '22.4%', color: '#F97316' },
    { category: 'Web Attack - SQLi', count: '14.8%', color: '#06B6D4' },
    { category: 'Brute Force Auth', count: '10.5%', color: '#F59E0B' },
    { category: 'Botnet / C2 Beaconing', count: '4.1%', color: '#8B5CF6' }
  ];

  // Heatmap: Day of Week vs Time Slot
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapHours = ['00-04h', '04-08h', '08-12h', '12-16h', '16-20h', '20-24h'];
  const heatmapValues: Record<string, number> = {
    'Mon-08-12h': 85, 'Mon-12-16h': 92, 'Tue-12-16h': 78, 'Wed-08-12h': 96, 'Wed-12-16h': 100,
    'Thu-12-16h': 88, 'Fri-12-16h': 94, 'Fri-16-20h': 89, 'Sat-20-24h': 45, 'Sun-00-04h': 35
  };

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 90) return 'bg-red-500/80 text-white font-bold';
    if (intensity >= 70) return 'bg-orange-500/70 text-white';
    if (intensity >= 40) return 'bg-amber-500/50 text-slate-200';
    if (intensity >= 20) return 'bg-cyan-500/25 text-slate-300';
    return 'bg-slate-800/40 text-slate-500';
  };

  const handleExportCsv = () => {
    const headers = ['Period', 'Benign Flows', 'Threat Volume', 'Average Risk Score'];
    const rows = currentData.map(d => [d.period, d.benign, d.threats, d.risk_avg]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cybersentinel_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" /> Historical Threat Intelligence & SOC Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical multi-temporal analysis, incident response efficacy (MTTD/MTTR), severity distributions, and threat vectors.
          </p>
        </div>

        {/* TIME RANGE SELECTOR & ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#0D1527] p-1 rounded-xl border border-slate-800 flex items-center">
            {(['24h', '7d', '30d', '90d', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                  timeRange === r
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-2 text-cyan-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* EXECUTIVE SOC KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-cyan-500">
          <div className="flex justify-between items-center text-[11px] text-slate-400 uppercase font-mono">
            <span>Mean Time to Detect (MTTD)</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5 font-mono">4.2 <span className="text-xs font-normal text-slate-400">min</span></div>
          <div className="text-[11px] text-emerald-400 flex items-center mt-1 font-mono">
            <TrendingDown className="w-3.5 h-3.5 mr-1" /> -38.4% vs Industry SLA
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center text-[11px] text-slate-400 uppercase font-mono">
            <span>Mean Time to Remediate (MTTR)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5 font-mono">18.5 <span className="text-xs font-normal text-slate-400">min</span></div>
          <div className="text-[11px] text-emerald-400 flex items-center mt-1 font-mono">
            <TrendingDown className="w-3.5 h-3.5 mr-1" /> -52.1% automated triage
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
          <div className="flex justify-between items-center text-[11px] text-slate-400 uppercase font-mono">
            <span>Total Threats Incurred</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1.5 font-mono">
            {currentData.reduce((acc, curr) => acc + curr.threats, 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {currentData.reduce((acc, curr) => acc + curr.benign, 0).toLocaleString()} total flows
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center text-[11px] text-slate-400 uppercase font-mono">
            <span>Avg Risk Index</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1.5 font-mono">
            {Math.round(currentData.reduce((acc, curr) => acc + curr.risk_avg, 0) / currentData.length)} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1 font-mono">
            Elevated - Active Mitigation
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center text-[11px] text-slate-400 uppercase font-mono">
            <span>Model F1 Score</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 mt-1.5 font-mono">98.27%</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            0.22% False Positive Rate
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1: MULTI-PERIOD THREAT INGESTION & RISK EVOLUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Volume Trend */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-400" /> Threat Volume vs. Benign Baseline Ingestion
              </h3>
              <p className="text-[11px] text-slate-400">Tracking anomalous packets vs normal network throughput in time window ({timeRange.toUpperCase()})</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Live Ingestion
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorBenign" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="period" stroke="#64748B" fontSize={11} fontVariant="mono" />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)'
                  }}
                />
                <Area type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorThreats)" name="Threat Events" />
                <Area type="monotone" dataKey="benign" stroke="#06B6D4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBenign)" name="Benign Flows" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Threat Severity Ratio
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Calculated based on asset impact and confidence</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
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
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {severityDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 bg-[#0D1527] rounded-lg border border-slate-800/60">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-mono font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: ATTACK CATEGORY EVOLUTION & HEATMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Category Stacked Bar */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Specific Attack Category Evolution</h3>
              <p className="text-[11px] text-slate-400">Comparing volumetric floods, injection attempts, discovery scans and brute-force</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
              <span className="flex items-center"><span className="w-2 h-2 rounded bg-[#EF4444] mr-1"></span> DoS</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded bg-[#06B6D4] mr-1"></span> SQLi</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded bg-[#F97316] mr-1"></span> PortScan</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded bg-[#F59E0B] mr-1"></span> BruteForce</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="period" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="dos" name="DoS Floods" fill="#EF4444" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="sqli" name="SQL Injection" fill="#06B6D4" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="portscan" name="PortScan" fill="#F97316" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bruteforce" name="Brute Force" fill="#F59E0B" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Attack Heatmap */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Threat Incursion Heatmap
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Frequency matrix by Day of Week & Hour Window</p>
          </div>

          <div className="my-3 overflow-x-auto">
            <table className="w-full text-[10px] text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-slate-500 font-mono text-left">Day</th>
                  {heatmapHours.map(h => (
                    <th key={h} className="p-1 text-slate-400 font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapDays.map(day => (
                  <tr key={day}>
                    <td className="p-1 font-mono text-slate-400 text-left font-semibold">{day}</td>
                    {heatmapHours.map(hour => {
                      const key = `${day}-${hour}`;
                      const val = heatmapValues[key] || Math.floor(Math.random() * 30 + 10);
                      return (
                        <td key={hour} className="p-0.5">
                          <div className={`p-1.5 rounded text-[9px] font-mono transition-all hover:scale-110 cursor-pointer ${getHeatmapColor(val)}`}>
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Low Intensity</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>
              <span className="w-3 h-3 rounded bg-cyan-500/30"></span>
              <span className="w-3 h-3 rounded bg-amber-500/60"></span>
              <span className="w-3 h-3 rounded bg-red-500/80"></span>
            </div>
            <span>Critical Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
};
