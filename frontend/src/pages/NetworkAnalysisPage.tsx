import React, { useEffect, useState } from 'react';
import { Network, Activity, Server, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { networkService } from '../services/api';
import { NetworkAnalysis } from '../types';

export const NetworkAnalysisPage: React.FC = () => {
  const [data, setData] = useState<NetworkAnalysis | null>(null);

  useEffect(() => {
    networkService.getOverview().then(setData).catch(console.error);
  }, []);

  const COLORS = ['#06B6D4', '#3B82F6', '#8B5CF6', '#10B981'];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Network className="w-6 h-6 text-cyan-400" /> Network Flow & Protocol Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-1">Deep inspection of authorized PCAP/log packet flows, protocol distributions, and top talkers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bandwidth & Flow Chart */}
        <div className="lg:col-span-2 glass-card p-5 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-3">Traffic Throughput Timeline (Mbps)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.traffic_timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timestamp" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1E293B', fontSize: '12px' }} />
                <Area type="monotone" dataKey="mbps" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} name="Throughput Mbps" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Breakdown */}
        <div className="glass-card p-5 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-3">Protocol Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.protocol_distribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="packets">
                  {data?.protocol_distribution.map((entry, idx) => (
                    <Cell key={entry.protocol} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1E293B', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs mt-2">
            {data?.protocol_distribution.map((p, i) => (
              <div key={p.protocol} className="flex justify-between items-center text-slate-300">
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }}></span>{p.protocol}</span>
                <span className="font-mono text-cyan-400">{p.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP SOURCES & ANOMALIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-3">Top External Source IP Address Volume</h3>
          <div className="space-y-2 text-xs">
            {data?.top_source_ips.map((src) => (
              <div key={src.ip} className="p-3 bg-[#0B0F17] border border-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-mono text-cyan-300 font-semibold">{src.ip} ({src.country})</div>
                  <div className="text-[10px] text-slate-400">{src.bytes_mb} MB total bandwidth</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  src.threat_level === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                }`}>
                  {src.threat_level}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-white">Detection Analysis & Anomaly Alerts</h3>
          {data?.detected_anomalies.map((anom) => (
            <div key={anom.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-red-400 font-bold">
                <span>[{anom.id}] {anom.type}</span>
                <span>{anom.src} → {anom.dst}</span>
              </div>
              <p className="text-slate-300 text-[11px]">{anom.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
