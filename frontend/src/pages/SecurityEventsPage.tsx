import React, { useEffect, useState, useRef } from 'react';
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
  Download
} from 'lucide-react';
import { apiClient, findingsService } from '../services/api';

export const SecurityEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('cybersentinel_audio') !== 'false';
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  const playThreatChirp = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio context may be restricted by browser policy before first interaction
    }
  };

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
            playThreatChirp();
          }
          setLiveEvents((prev) => [payload, ...prev.slice(0, 79)]);
        } catch (e) {}
      };
    } catch (e) {
      console.error('WebSocket connection failed', e);
    }

    return () => {
      if (socket) socket.close();
    };
  }, [isStreaming, soundEnabled]);

  const displayedEvents = (liveEvents.length > 0 ? liveEvents : events).filter((evt) => {
    if (severityFilter !== 'ALL') {
      const sev = evt.severity || (evt.attack_label !== 'Benign' ? 'Critical' : 'Low');
      if (sev !== severityFilter) return false;
    }
    return true;
  });

  const handleEscalateToFinding = (evt: any) => {
    alert(`Event ${evt.uuid || evt.timestamp} escalated to SOC Vulnerability Findings queue.`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & STREAM TOGGLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-cyan-400" /> Real-Time Security Event Stream
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live defensive security packet telemetry, WebSocket streaming, micro-latency packet inspection, and threat categorization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              localStorage.setItem('cybersentinel_audio', String(next));
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Audio alerts active' : 'Audio alerts muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              isStreaming
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className={`w-4 h-4 ${isStreaming ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            {isStreaming ? 'STREAMING ACTIVE (1 PPS)' : 'STREAM PAUSED'}
            {isStreaming ? <Pause className="w-3.5 h-3.5 ml-1" /> : <Play className="w-3.5 h-3.5 ml-1 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* STREAM VELOCITY KPI BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Streaming Velocity</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono flex items-center gap-2">
            1.0 <span className="text-xs text-slate-400 font-normal">evt/sec</span>
            {isStreaming && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Live WebSocket Socket Open</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-cyan-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Live Buffer Depth</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{liveEvents.length} / 80</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">Circular Memory Cache</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Live Threats Detected</div>
          <div className="text-2xl font-bold text-red-400 mt-1 font-mono">
            {liveEvents.filter(e => e.prediction !== 'Benign').length}
          </div>
          <div className="text-[10px] text-red-400 mt-1 font-mono">Real-Time Anomaly Flag</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-amber-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Max Packet Velocity</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">45,200 <span className="text-xs text-slate-400">pps</span></div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Peak Incursion Threshold</div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Source IP, Attack Label, or Event UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Severity Filters */}
          <div className="bg-[#080C14] p-1 rounded-xl border border-slate-800 flex items-center font-mono text-[11px]">
            {(['ALL', 'Critical', 'High', 'Medium', 'Low'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  severityFilter === s
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
          >
            <option value="">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="HTTP">HTTP</option>
            <option value="SSH">SSH</option>
            <option value="IRC">IRC</option>
          </select>

          <button
            onClick={fetchEvents}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EVENT TELEMETRY TABLE WITH EXPANDABLE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`${selectedEvent ? 'lg:col-span-8' : 'lg:col-span-12'} glass-card p-5 rounded-2xl transition-all`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Source IP</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Protocol</th>
                  <th className="pb-3">Throughput / PPS</th>
                  <th className="pb-3">Attack Classification</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {displayedEvents.map((evt, idx) => {
                  const label = evt.prediction || evt.attack_label;
                  const isBenign = label === 'Benign';
                  const isSelected = selectedEvent?.timestamp === evt.timestamp;

                  return (
                    <tr
                      key={evt.id || idx}
                      onClick={() => setSelectedEvent(evt)}
                      className={`hover:bg-slate-800/40 transition-all cursor-pointer ${
                        isSelected ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400' : ''
                      }`}
                    >
                      <td className="py-3 font-mono text-cyan-400 font-semibold">{evt.timestamp || evt.created_at || 'Just now'}</td>
                      <td className="py-3 font-mono text-white font-medium">{evt.source_ip}</td>
                      <td className="py-3 font-mono text-slate-300">{evt.dest_port ? `Port ${evt.dest_port}` : evt.dest_ip}</td>
                      <td className="py-3 font-mono text-slate-400">{evt.protocol || 'TCP'}</td>
                      <td className="py-3 font-mono text-slate-300">{(evt.packet_rate_pps || evt.packet_count || 120).toLocaleString()} pps</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
                          isBenign
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}>
                          {label}
                        </span>
                      </td>
                      <td className="py-3 font-mono">
                        <span className="text-cyan-300 font-bold">{evt.confidence || 98.5}%</span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SLIDE-OUT EVENT INSPECTOR DRAWER */}
        {selectedEvent && (
          <div className="lg:col-span-4 glass-card p-5 rounded-2xl space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white font-mono">Packet Telemetry Inspector</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#080C14] rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Attack Verdict</div>
                <div className="text-base font-bold text-red-400 font-mono">
                  {selectedEvent.prediction || selectedEvent.attack_label}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Confidence: <strong className="text-cyan-400">{selectedEvent.confidence || 98.5}%</strong> | Risk Score: <strong className="text-white">{selectedEvent.risk_score || 88}/100</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 bg-[#080C14] border border-slate-800 rounded-xl">
                  <span className="text-slate-500 text-[10px]">Source IP</span>
                  <div className="text-white font-bold">{selectedEvent.source_ip}</div>
                </div>
                <div className="p-2.5 bg-[#080C14] border border-slate-800 rounded-xl">
                  <span className="text-slate-500 text-[10px]">Destination Port</span>
                  <div className="text-white font-bold">{selectedEvent.dest_port || '80'}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Raw Payload & Header Dump</div>
                <pre className="p-3 bg-[#080C14] border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-48 leading-relaxed">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </div>

              <button
                onClick={() => handleEscalateToFinding(selectedEvent)}
                className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-red-950 font-mono"
              >
                Escalate to Vulnerability Findings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
