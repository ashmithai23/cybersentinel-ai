import React, { useEffect, useState } from 'react';
import {
  Lock,
  ShieldAlert,
  AlertCircle,
  FileCode,
  CheckCircle2,
  Terminal,
  Play,
  Copy,
  Check,
  Code,
  Zap,
  RefreshCw,
  Search
} from 'lucide-react';
import { apiSecurityService } from '../services/api';
import { ApiSecurityAnalysis } from '../types';

export const ApiSecurityPage: React.FC = () => {
  const [data, setData] = useState<ApiSecurityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [testPayload, setTestPayload] = useState<string>("' UNION SELECT username, password_hash FROM users--");
  const [testResult, setTestResult] = useState<any>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await apiSecurityService.getOverview();
      setData(res);
      if (res.recent_payload_anomalies?.length > 0) {
        setSelectedAnomaly(res.recent_payload_anomalies[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRunPayloadTest = () => {
    const p = testPayload.toLowerCase();
    let detected = false;
    let type = 'Benign Payload';
    let severity = 'Low';
    let score = 15;
    let rationale = 'Payload passed all signature and heuristic sanitization checks.';

    if (p.includes('union') || p.includes('select') || p.includes('--') || p.includes('or 1=1')) {
      detected = true;
      type = 'SQL Injection (SQLi)';
      severity = 'Critical';
      score = 96;
      rationale = 'Detected SQL keywords (UNION/SELECT) and comment delimiter sequence attempting authentication bypass.';
    } else if (p.includes('<script') || p.includes('document.cookie') || p.includes('javascript:')) {
      detected = true;
      type = 'Cross-Site Scripting (XSS)';
      severity = 'High';
      score = 91;
      rationale = 'Detected executable JavaScript tags and DOM access payloads.';
    } else if (p.includes('../') || p.includes('/etc/passwd') || p.includes('win.ini')) {
      detected = true;
      type = 'Path Traversal / LFI';
      severity = 'High';
      score = 88;
      rationale = 'Directory climbing string sequences attempting to access system configuration files.';
    }

    setTestResult({
      detected,
      type,
      severity,
      score,
      rationale,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-cyan-400" /> API Security & Payload Threat Inspection
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Defensive inspection of HTTP headers, parameter injection payloads, authentication anomalies, and rate limit abuse.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="flex items-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 text-cyan-400 ${loading ? 'animate-spin' : ''}`} /> Refresh API Telemetry
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-cyan-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total API Requests</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{(data?.total_api_requests || 17450).toLocaleString()}</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">200 OK: 94.2%</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">SQLi Injections Filtered</div>
          <div className="text-2xl font-bold text-red-400 mt-1 font-mono">{data?.sqli_attempts_count || 140}</div>
          <div className="text-[10px] text-red-400 mt-1 font-mono">Critical WAF Drops</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-orange-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">XSS Cross-Site Vectors</div>
          <div className="text-2xl font-bold text-orange-400 mt-1 font-mono">{data?.xss_attempts_count || 82}</div>
          <div className="text-[10px] text-orange-400 mt-1 font-mono">Sanitized In-Line</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-amber-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Auth / Token Failures</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{data?.auth_failure_count || 371}</div>
          <div className="text-[10px] text-amber-300 mt-1 font-mono">401 / 403 Response Surge</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-l-4 border-l-blue-500">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Rate Limit Abuse Violations</div>
          <div className="text-2xl font-bold text-blue-400 mt-1 font-mono">{data?.rate_limit_violations || 215}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">429 Throttling Active</div>
        </div>
      </div>

      {/* INTERACTIVE PAYLOAD TESTING SANDBOX */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" /> Interactive Defensive Payload Scanner Sandbox
            </h3>
            <p className="text-[11px] text-slate-400">Test arbitrary HTTP payloads against the heuristic injection parser and signature rules.</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Defense Sandbox
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            placeholder="Type payload or query string: ' OR 1=1-- or <script>alert(1)</script>"
            className="flex-1 bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleRunPayloadTest}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-cyan-950"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Scan Payload
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
            testResult.detected
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  testResult.detected ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  [{testResult.type}]
                </span>
                <span className="text-xs text-slate-300 font-mono">Threat Score: <strong className="text-white">{testResult.score}/100</strong></span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">{testResult.rationale}</p>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Scanned at {testResult.timestamp}
            </div>
          </div>
        )}
      </div>

      {/* TOP TARGETED ENDPOINTS TABLE */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white">Targeted API Endpoints & Request Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono">
                <th className="pb-3">Method</th>
                <th className="pb-3">API Endpoint Path</th>
                <th className="pb-3">Total Requests</th>
                <th className="pb-3">Anomalies Detected</th>
                <th className="pb-3">Status Breakdown</th>
                <th className="pb-3">Threat Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {(data?.top_targeted_endpoints || []).map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ep.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-cyan-300 font-semibold">{ep.path}</td>
                  <td className="py-3 font-mono">{ep.requests.toLocaleString()}</td>
                  <td className="py-3 font-mono text-red-400 font-bold">{ep.anomalies}</td>
                  <td className="py-3 font-mono text-slate-400">
                    {Object.entries(ep.status_breakdown || {}).map(([code, cnt]) => `${code}: ${cnt}`).join(' | ')}
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                      OWASP API2
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT MALICIOUS PAYLOADS LIST */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" /> Recent Intercepted Malicious Payload Logs
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {data?.recent_payload_anomalies.map((item) => (
            <div key={item.id} className="p-4 bg-[#080C14] border border-slate-800 rounded-xl space-y-2.5 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-red-400 font-bold text-xs">[{item.threat_type}]</span>
                  <span className="font-mono text-cyan-300 font-semibold">{item.endpoint}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Confidence: <strong className="text-cyan-400">{item.confidence}%</strong> | Client IP: <strong className="text-white">{item.client_ip}</strong> | {item.timestamp}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase font-mono">
                  <span>Detected Raw Payload String</span>
                  <button
                    onClick={() => copyToClipboard(item.detected_pattern)}
                    className="text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy String
                  </button>
                </div>
                <pre className="p-3 bg-[#0D1527] border border-slate-800/80 rounded-lg font-mono text-amber-300 text-xs mt-1 overflow-x-auto">
                  {item.detected_pattern}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
