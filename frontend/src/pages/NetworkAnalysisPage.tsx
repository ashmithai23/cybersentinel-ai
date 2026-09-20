import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Activity,
  Server,
  AlertTriangle,
  ShieldCheck,
  Globe,
  Radio,
  Wifi,
  Lock,
  Zap,
  Info,
  X,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { networkService } from '../services/api';
import { NetworkAnalysis } from '../types';
import { StatCard } from '../components/StatCard';
import { CyberButton } from '../components/CyberButton';

interface TopologyNode {
  id: string;
  label: string;
  ip: string;
  type: 'external' | 'firewall' | 'gateway' | 'app' | 'database' | 'bastion';
  x: number;
  y: number;
  status: 'healthy' | 'warning' | 'attacked';
  details: {
    port?: string;
    protocol?: string;
    latency?: string;
    packetsPerSec?: number;
    threatsDetected?: number;
  };
}

export const NetworkAnalysisPage: React.FC = () => {
  const [data, setData] = useState<NetworkAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [blockedIps, setBlockedIps] = useState<string[]>([]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await networkService.getOverview();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const topologyNodes: TopologyNode[] = [
    {
      id: 'ext-1',
      label: 'Attacker (Botnet IP)',
      ip: '198.51.100.42',
      type: 'external',
      x: 70,
      y: 90,
      status: 'attacked',
      details: { protocol: 'TCP SYN', latency: '48ms', packetsPerSec: 48200, threatsDetected: 142 }
    },
    {
      id: 'ext-2',
      label: 'Scanning Host (NL)',
      ip: '203.0.113.88',
      type: 'external',
      x: 70,
      y: 230,
      status: 'attacked',
      details: { protocol: 'HTTP POST', latency: '65ms', packetsPerSec: 1450, threatsDetected: 35 }
    },
    {
      id: 'fw-1',
      label: 'Perimeter Edge Firewall',
      ip: '10.0.0.1',
      type: 'firewall',
      x: 270,
      y: 160,
      status: 'warning',
      details: { port: 'ALL', protocol: 'Stateful SPI', latency: '1.2ms', packetsPerSec: 52000, threatsDetected: 177 }
    },
    {
      id: 'gw-1',
      label: 'Ingress API Gateway',
      ip: '10.0.4.15',
      type: 'gateway',
      x: 470,
      y: 160,
      status: 'warning',
      details: { port: '443 / 80', protocol: 'HTTPS/WAF', latency: '3.4ms', packetsPerSec: 14500, threatsDetected: 88 }
    },
    {
      id: 'app-1',
      label: 'Core Web Cluster (N1)',
      ip: '10.0.1.5',
      type: 'app',
      x: 680,
      y: 90,
      status: 'healthy',
      details: { port: '8080', protocol: 'HTTP', latency: '2.1ms', packetsPerSec: 4200, threatsDetected: 0 }
    },
    {
      id: 'bastion-1',
      label: 'SSH Bastion Host',
      ip: '192.168.1.10',
      type: 'bastion',
      x: 680,
      y: 230,
      status: 'attacked',
      details: { port: '22', protocol: 'SSH', latency: '4.8ms', packetsPerSec: 2400, threatsDetected: 24 }
    },
    {
      id: 'db-1',
      label: 'Primary Database Node',
      ip: '10.0.1.25',
      type: 'database',
      x: 880,
      y: 160,
      status: 'healthy',
      details: { port: '5432', protocol: 'PostgreSQL', latency: '0.8ms', packetsPerSec: 1800, threatsDetected: 0 }
    }
  ];

  const handleBlockIp = (ip: string) => {
    if (blockedIps.includes(ip)) {
      setBlockedIps(blockedIps.filter(item => item !== ip));
    } else {
      setBlockedIps([...blockedIps, ip]);
    }
  };

  const COLORS = ['#06B6D4', '#3B82F6', '#8B5CF6', '#10B981'];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-500/20 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Network className="w-7 h-7 text-cyan-400 animate-pulse" /> Network Flow, Topology & Protocol Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time defensive packet flow analysis, live animated SOC network topology, protocol share, and anomaly identification.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <CyberButton
            onClick={fetchOverview}
            icon={RefreshCw}
            variant="secondary"
            size="sm"
          >
            Refresh Telemetry
          </CyberButton>
        </div>
      </div>

      {/* TOP TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Packets Analyzed"
          value={(data?.total_packets || 24851).toLocaleString()}
          subtext="Real-time pps stream"
          icon={Activity}
          color="cyan"
          badgeText="Inference Stream"
        />

        <StatCard
          title="Bandwidth Analyzed"
          value={`${data?.total_bandwidth_mb || 2017.7} MB`}
          subtext="Peak: 510.5 Mbps"
          icon={Radio}
          color="indigo"
        />

        <StatCard
          title="Unique Source IPs"
          value={data?.unique_sources || 342}
          subtext="18 Anomalous IPs"
          icon={Globe}
          color="rose"
        />

        <StatCard
          title="Active Defense Firewall"
          value={`${blockedIps.length} Rules`}
          subtext="In-line Packet Drop"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* INTERACTIVE NETWORK TOPOLOGY MAP */}
      <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" /> Interactive Defensive Network Topology & Vector Map
            </h3>
            <p className="text-[11px] text-slate-400">Click any host or gateway node to inspect live socket telemetry, open ports, and threat exposure.</p>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-mono">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-1.5 shadow-sm shadow-emerald-400"></span> Healthy</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5 shadow-sm shadow-amber-400"></span> Filtered</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-red-400 mr-1.5 animate-pulse shadow-sm shadow-red-400"></span> Attacked</span>
          </div>
        </div>

        {/* SVG TOPOLOGY CANVAS */}
        <div className="w-full h-80 bg-[#060A14] rounded-xl border border-slate-800/80 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 960 320">
            <defs>
              <linearGradient id="attackLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="safeLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Connecting Lines */}
            <line x1="70" y1="90" x2="270" y2="160" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 4" className="animate-pulse" />
            <line x1="70" y1="230" x2="270" y2="160" stroke="#F97316" strokeWidth="2" strokeDasharray="6 4" />
            <line x1="270" y1="160" x2="470" y2="160" stroke="#06B6D4" strokeWidth="3" />
            <line x1="470" y1="160" x2="680" y2="90" stroke="#10B981" strokeWidth="2" />
            <line x1="470" y1="160" x2="680" y2="230" stroke="#EF4444" strokeWidth="2" strokeDasharray="5 3" />
            <line x1="680" y1="90" x2="880" y2="160" stroke="#06B6D4" strokeWidth="2" />
            <line x1="680" y1="230" x2="880" y2="160" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Animated Packet Pulses */}
            <circle r="4" fill="#EF4444">
              <animateMotion path="M 70 90 L 270 160 L 470 160" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle r="3.5" fill="#06B6D4">
              <animateMotion path="M 270 160 L 470 160 L 680 90 L 880 160" dur="3.5s" repeatCount="indefinite" />
            </circle>

            {/* Node Renderers */}
            {topologyNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isBlocked = blockedIps.includes(node.ip);
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle
                    r={isSelected ? 26 : 22}
                    fill="#0B101D"
                    stroke={
                      isBlocked
                        ? '#64748B'
                        : node.status === 'attacked'
                        ? '#EF4444'
                        : node.status === 'warning'
                        ? '#F59E0B'
                        : '#10B981'
                    }
                    strokeWidth={isSelected ? 3 : 2}
                    className={node.status === 'attacked' && !isBlocked ? 'animate-cyber-pulse' : ''}
                  />
                  <text
                    y="3"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.type === 'external' ? 'WAN' : node.type === 'firewall' ? 'FW' : node.type === 'gateway' ? 'GW' : node.type === 'database' ? 'DB' : 'SRV'}
                  </text>
                  <text
                    y="36"
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="9"
                    fontFamily="sans-serif"
                    fontWeight="500"
                  >
                    {node.label}
                  </text>
                  <text
                    y="47"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {isBlocked ? '[BLOCKED]' : node.ip}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* NODE TELEMETRY INSPECTOR MODAL/DRAWER */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-4 top-4 bottom-4 w-72 bg-[#0B101D]/95 border border-cyan-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md z-20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">{selectedNode.label}</span>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 mt-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">IP Address</span>
                      <div className="font-mono text-cyan-300 font-bold">{selectedNode.ip}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="p-2 bg-[#060A14] rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px]">Port:</span>
                        <div className="text-white font-bold">{selectedNode.details.port || 'Any'}</div>
                      </div>
                      <div className="p-2 bg-[#060A14] rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px]">Latency:</span>
                        <div className="text-white font-bold">{selectedNode.details.latency || 'N/A'}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Packet Velocity</span>
                      <div className="font-mono text-emerald-400 font-semibold">{selectedNode.details.packetsPerSec?.toLocaleString()} pps</div>
                    </div>

                    {selectedNode.details.threatsDetected ? (
                      <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                        {selectedNode.details.threatsDetected} Malicious Packets Filtered
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                        Zero Anomalies Detected
                      </div>
                    )}
                  </div>
                </div>

                {selectedNode.type === 'external' && (
                  <CyberButton
                    onClick={() => handleBlockIp(selectedNode.ip)}
                    variant={blockedIps.includes(selectedNode.ip) ? 'secondary' : 'danger'}
                    size="sm"
                    className="w-full"
                  >
                    {blockedIps.includes(selectedNode.ip) ? 'Unblock Source IP' : 'Block IP via Firewall (Drop)'}
                  </CyberButton>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CHARTS ROW: THROUGHPUT & PROTOCOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bandwidth & Flow Chart */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-cyan-500/20">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Traffic Throughput Timeline (Mbps)</h3>
              <p className="text-[11px] text-slate-400">Monitoring real-time bandwidth spikes and anomalies</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 font-semibold">
              Avg: 184 Mbps
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.traffic_timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timestamp" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="mbps" stroke="#06B6D4" strokeWidth={2} fill="#06B6D4" fillOpacity={0.2} name="Throughput Mbps" />
                <Area type="monotone" dataKey="anomalies" stroke="#EF4444" strokeWidth={1.5} fill="#EF4444" fillOpacity={0.3} name="Packet Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Breakdown */}
        <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Protocol Distribution</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Packet share across transport protocols</p>
          </div>
          <div className="h-44 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.protocol_distribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="packets">
                  {data?.protocol_distribution.map((entry, idx) => (
                    <Cell key={entry.protocol} fill={COLORS[idx % COLORS.length]} />
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
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
            {data?.protocol_distribution.map((p, i) => (
              <div key={p.protocol} className="flex justify-between items-center text-slate-300">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }}></span>
                  {p.protocol}
                </span>
                <span className="font-mono text-cyan-400 font-bold">{p.percentage}% ({p.packets.toLocaleString()} pkts)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP SOURCES & ANOMALY ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Top External Talkers & Threat Attribution</h3>
            <span className="text-[11px] text-slate-400 font-mono">5 High Volume IPs</span>
          </div>
          <div className="space-y-2 text-xs">
            {data?.top_source_ips.map((src) => {
              const isBlocked = blockedIps.includes(src.ip);
              return (
                <div
                  key={src.ip}
                  className={`p-3 bg-[#060A14] border rounded-xl flex justify-between items-center transition-all ${
                    isBlocked ? 'border-slate-700 opacity-60' : 'border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div>
                    <div className="font-mono text-cyan-300 font-semibold flex items-center gap-2">
                      {src.ip} ({src.country})
                      {isBlocked && <span className="text-[9px] px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 rounded font-mono">DROPPED</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{src.bytes_mb} MB total bandwidth transferred</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold border font-mono ${
                        src.threat_level === 'Critical'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      }`}
                    >
                      {src.threat_level}
                    </span>
                    <button
                      onClick={() => handleBlockIp(src.ip)}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer transition-all ${
                        isBlocked ? 'bg-slate-800 text-slate-300' : 'bg-red-500/20 text-red-300 hover:bg-red-500/40 border border-red-500/30'
                      }`}
                    >
                      {isBlocked ? 'Unblock' : 'Drop IP'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" /> Automated Anomaly Alerts & Attack Indicators
          </h3>
          <div className="space-y-2.5 text-xs">
            {data?.detected_anomalies.map((anom) => (
              <div key={anom.id} className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-red-400 font-bold font-mono">
                  <span>[{anom.id}] {anom.type}</span>
                  <span className="text-[11px] text-slate-300">{anom.src} → {anom.dst}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{anom.reason}</p>
                <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400 font-mono">
                  <span>Detection Confidence: 96.4%</span>
                  <span className="text-cyan-400 hover:underline cursor-pointer">View Packet Flow →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
