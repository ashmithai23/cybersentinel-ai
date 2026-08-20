import React, { useEffect, useState } from 'react';
import { Activity, Search, Filter, RefreshCw, Eye } from 'lucide-react';
import { apiClient } from '../services/api';

export const SecurityEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/events', {
        params: { search, protocol: protocolFilter }
      });
      setEvents(res.data.events || []);
    } catch (e) {
      console.error('Failed to load events', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, protocolFilter]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" /> Security Event Stream
        </h1>
        <p className="text-xs text-slate-400 mt-1">Real-time defensive security event log stream with full protocol & IP filtering.</p>
      </div>

      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by Source IP, Attack Label, or Event UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
          >
            <option value="">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="HTTP">HTTP</option>
            <option value="SSH">SSH</option>
            <option value="IRC">IRC</option>
          </select>
          <button
            onClick={fetchEvents}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Event UUID</th>
                <th className="pb-3">Source IP</th>
                <th className="pb-3">Destination Target</th>
                <th className="pb-3">Protocol</th>
                <th className="pb-3">Packets / Bytes</th>
                <th className="pb-3">Attack Classification</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3 font-mono text-cyan-400 font-semibold">{evt.uuid}</td>
                  <td className="py-3 font-mono text-slate-300">{evt.source_ip}</td>
                  <td className="py-3 font-mono text-slate-300">{evt.dest_ip}:{evt.dest_port}</td>
                  <td className="py-3 font-mono text-slate-400">{evt.protocol}</td>
                  <td className="py-3 font-mono text-slate-400">{evt.packet_count} p / {(evt.bytes_count / 1024).toFixed(1)} KB</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      evt.attack_label === 'Benign' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {evt.attack_label}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{evt.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
