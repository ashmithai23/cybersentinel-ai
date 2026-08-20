import React, { useEffect, useState } from 'react';
import { Lock, ShieldAlert, AlertCircle, FileCode, CheckCircle2 } from 'lucide-react';
import { apiSecurityService } from '../services/api';
import { ApiSecurityAnalysis } from '../types';

export const ApiSecurityPage: React.FC = () => {
  const [data, setData] = useState<ApiSecurityAnalysis | null>(null);

  useEffect(() => {
    apiSecurityService.getOverview().then(setData).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Lock className="w-6 h-6 text-cyan-400" /> API Security & Payload Threat Inspection
        </h1>
        <p className="text-xs text-slate-400 mt-1">Defensive inspection of HTTP headers, parameter payloads, authentication anomalies, and rate limit violations.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase">API Requests</div>
          <div className="text-xl font-bold text-white mt-1">{data?.total_api_requests}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
          <div className="text-[11px] text-slate-400 uppercase">SQLi Payload Attempts</div>
          <div className="text-xl font-bold text-red-400 mt-1">{data?.sqli_attempts_count}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-orange-500">
          <div className="text-[11px] text-slate-400 uppercase">XSS Payload Vectors</div>
          <div className="text-xl font-bold text-orange-400 mt-1">{data?.xss_attempts_count}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-amber-500">
          <div className="text-[11px] text-slate-400 uppercase">Auth Failures</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{data?.auth_failure_count}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase">Rate Limit Abuse</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">{data?.rate_limit_violations}</div>
        </div>
      </div>

      {/* PAYLOAD ANOMALY INSPECTION TABLE */}
      <div className="glass-card p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" /> Recent Detected Malicious Payload Attempts
        </h3>
        <div className="space-y-3">
          {data?.recent_payload_anomalies.map((item) => (
            <div key={item.id} className="p-4 bg-[#0B0F17] border border-slate-800 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono text-red-400 font-bold">[{item.threat_type}] {item.endpoint}</span>
                <span className="text-[10px] text-cyan-400 font-mono">Confidence: {item.confidence}% | IP: {item.client_ip}</span>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Detected Raw Payload String</div>
                <pre className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-amber-300 text-[11px] mt-1 overflow-x-auto">
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
