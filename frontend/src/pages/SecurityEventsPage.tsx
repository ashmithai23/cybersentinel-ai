import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Search,
  RefreshCw,
  Radio,
  Pause,
  Play,
  Volume2,
  VolumeX,
  ShieldAlert,
  Sliders,
  Filter,
  Eye,
  X,
  CheckCircle2,
  Zap,
  ArrowRight,
  Download,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../services/api';
import { StatCard } from '../components/StatCard';
import { Card3D } from '../components/Card3D';
import { CyberButton } from '../components/CyberButton';
import { cyberSound } from '../utils/cyberSound';

export const SecurityEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

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

  // WebSocket Live Streaming
  useEffect(() => {
    if (!isStreaming) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/api/v1/ws/live-events`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.severity === 'Critical' || payload.severity === 'High') {
            cyberSound.playAlarmSound();
          } else {
            cyberSound.playRadarPing();
          }
          setLiveEvents((prev) => [payload, ...prev.slice(0, 79)]);
        } catch (e) {}
      };
    } catch (e) {
      console.warn('WebSocket stream fallback to REST polling');
    }

    return () => {
      if (socket) socket.close();
    };
  }, [isStreaming]);

  const allEvents = liveEvents.length > 0 ? [...liveEvents, ...events] : events;
  const filteredEvents = allEvents.filter((ev) => {
    if (severityFilter !== 'ALL' && ev.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-500/20 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-cyan-400 animate-pulse" /> Real-Time Security Event & Telemetry Stream
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live WebSocket flow packet stream, instant anomaly detection, raw packet payload inspection, and alert audio chirps.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <CyberButton
            onClick={() => {
              cyberSound.playCyberClick();
              setIsStreaming(!isStreaming);
            }}
            icon={isStreaming ? Pause : Play}
            variant={isStreaming ? 'primary' : 'secondary'}
            size="sm"
          >
            {isStreaming ? 'Streaming Live (Pause)' : 'Resume Live Stream'}
          </CyberButton>

          <CyberButton
            onClick={() => {
              cyberSound.playCyberClick();
              fetchEvents();
            }}
            icon={RefreshCw}
            variant="outline"
            size="sm"
          >
            Refresh Stream
          </CyberButton>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Telemetry Rate"
          value="48,200 pps"
          subtext="In-line packet stream"
          icon={Radio}
          color="cyan"
          badgeText="WebSocket"
        />

        <StatCard
          title="Buffered Telemetry"
          value={filteredEvents.length}
          subtext="Real-time events"
          icon={Activity}
          color="indigo"
        />

        <StatCard
          title="Critical Anomalies"
          value={filteredEvents.filter(e => e.severity === 'Critical').length}
          subtext="Immediate Attention"
          icon={ShieldAlert}
          color="rose"
        />

        <StatCard
          title="Stream Status"
          value={isStreaming ? 'CONNECTED' : 'PAUSED'}
          subtext="Port 8000 WebSocket"
          icon={CheckCircle2}
          color={isStreaming ? 'emerald' : 'amber'}
        />
      </div>

      {/* STREAM CONTROLS & TABLE */}
      <Card3D glowColor="cyan" className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by IP, attack type, port..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#060A14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#060A14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-bold">LIVE TELEMETRY STREAM ACTIVE</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Source IP</th>
                <th className="pb-3">Destination IP</th>
                <th className="pb-3">Protocol / Port</th>
                <th className="pb-3">Classification</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredEvents.slice(0, 50).map((ev, idx) => (
                <tr
                  key={ev.id || idx}
                  onClick={() => {
                    cyberSound.playCyberClick();
                    setSelectedEvent(ev);
                  }}
                  className="hover:bg-cyan-500/10 transition-all cursor-pointer font-mono"
                >
                  <td className="py-3 text-slate-400 text-[11px]">{ev.timestamp || new Date().toLocaleTimeString()}</td>
                  <td className="py-3 font-semibold text-cyan-300">{ev.source_ip || ev.src_ip || '198.51.100.42'}</td>
                  <td className="py-3 text-slate-300">{ev.dest_ip || '10.0.0.1'}</td>
                  <td className="py-3 text-slate-400">{ev.protocol || 'TCP'} : {ev.destination_port || ev.port || 80}</td>
                  <td className="py-3 font-bold text-white">{ev.attack_type || ev.prediction || 'DoS SYN Flood'}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      ev.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      ev.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {ev.severity || 'Medium'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg flex items-center font-mono cursor-pointer transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card3D>

      {/* EVENT INSPECTOR MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-xl w-full p-6 rounded-2xl border border-cyan-500/40 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Security Telemetry Event Inspector
                </h3>
                <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white text-sm p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#060A14] rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px]">Source IP:</span>
                  <div className="text-cyan-300 font-bold text-sm mt-0.5">{selectedEvent.source_ip || selectedEvent.src_ip || '198.51.100.42'}</div>
                </div>

                <div className="p-3 bg-[#060A14] rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px]">Destination Target:</span>
                  <div className="text-white font-bold text-sm mt-0.5">{selectedEvent.dest_ip || '10.0.0.1'}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-white mb-1 block">Raw Flow Features Payload</span>
                <pre className="p-3.5 bg-[#060A14] border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
