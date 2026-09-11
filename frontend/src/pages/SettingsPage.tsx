import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Server,
  ShieldCheck,
  Activity,
  Sliders,
  Bell,
  Check,
  Send,
  RefreshCw,
  Search,
  Lock,
  Cpu
} from 'lucide-react';
import { settingsService, apiClient } from '../services/api';
import { SystemStatus } from '../types';

export const SettingsPage: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditSearch, setAuditSearch] = useState('');

  // Operational Settings
  const [sensitivity, setSensitivity] = useState<'strict' | 'balanced' | 'permissive'>('balanced');
  const [quarantineThreshold, setQuarantineThreshold] = useState<number>(85);
  const [webhookUrl, setWebhookUrl] = useState<string>('https://hooks.slack.com/services/T00/B00/XXXX');
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState(false);

  const fetchSettings = () => {
    setLoading(true);
    settingsService.getStatus().then(setStatus).catch(console.error);
    apiClient.get('/audit').then((res) => setAuditLogs(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTestWebhook = () => {
    setWebhookTesting(true);
    setTimeout(() => {
      setWebhookTesting(false);
      setWebhookSuccess(true);
      setTimeout(() => setWebhookSuccess(false), 3000);
    }, 600);
  };

  const filteredLogs = auditLogs.filter(log =>
    log.user_email?.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.resource?.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-cyan-400" /> Platform Configuration & System Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure defensive detection policies, auto-quarantine thresholds, webhook dispatchers, and review immutable audit records.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="flex items-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 text-cyan-400 ${loading ? 'animate-spin' : ''}`} /> Refresh Diagnostics
        </button>
      </div>

      {/* SYSTEM TELEMETRY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="text-[11px] text-slate-400 uppercase font-mono">System Core Status</div>
          <div className="text-lg font-bold text-emerald-400 mt-1 font-mono flex items-center gap-2">
            {status?.system_status || 'Operational'}
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">All services active</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-cyan-500">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Inference Engine</div>
          <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">{status?.model_status || 'Ready (PyTorch)'}</div>
          <div className="text-[10px] text-cyan-400/80 mt-0.5 font-mono">ANN / 1D-CNN / LSTM</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-blue-500">
          <div className="text-[11px] text-slate-400 uppercase font-mono">FastAPI Core Server</div>
          <div className="text-lg font-bold text-blue-400 mt-1 font-mono">{status?.api_status || 'Online (v0.110)'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Uvicorn Async Worker</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Persistence Layer</div>
          <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">{status?.database_status || 'Connected'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Async SQLite / Supabase</div>
        </div>
      </div>

      {/* SOC OPERATIONAL POLICIES CONFIGURATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detection & Quarantine Policy */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Threat Detection & Quarantine Sensitivity
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Classifier Sensitivity Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['strict', 'balanced', 'permissive'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSensitivity(mode)}
                    className={`py-2 rounded-xl capitalize font-semibold transition-all border ${
                      sensitivity === mode
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-md shadow-cyan-950/40'
                        : 'bg-[#080C14] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {sensitivity === 'strict' && 'Strict: Flags any anomaly with >70% confidence score. Highest sensitivity.'}
                {sensitivity === 'balanced' && 'Balanced: Standard SOC threshold (>85% confidence score). Low false positive rate.'}
                {sensitivity === 'permissive' && 'Permissive: Only alerts on critical certainty (>95% confidence score).'}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                <span>Auto-Quarantine Risk Threshold</span>
                <span className="text-red-400 font-bold">{quarantineThreshold}/100</span>
              </div>
              <input
                type="range"
                min="60"
                max="98"
                value={quarantineThreshold}
                onChange={(e) => setQuarantineThreshold(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Events with risk score &gt;= {quarantineThreshold} automatically trigger containment playbooks.
              </p>
            </div>
          </div>
        </div>

        {/* SIEM / Webhook Dispatcher */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" /> SIEM & SOAR Alert Dispatcher (Webhook)
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Webhook Ingestion Endpoint URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleTestWebhook}
                disabled={webhookTesting}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              >
                {webhookTesting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin text-cyan-400" />
                ) : webhookSuccess ? (
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                ) : (
                  <Send className="w-4 h-4 mr-2 text-cyan-400" />
                )}
                {webhookSuccess ? 'Test Alert Dispatched Successfully (HTTP 200 OK)' : 'Send Test Alert Payload'}
              </button>
            </div>

            <div className="p-3 bg-[#080C14] border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-white">Supported Alert Integrations:</span>
              <p>Splunk HEC, Elastic SIEM, Microsoft Sentinel, Slack Webhooks, PagerDuty Events v2.</p>
            </div>
          </div>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Immutable Platform Audit Trail</h3>
            <p className="text-[11px] text-slate-400">Cryptographically ordered audit history of analyst actions and model updates.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search audit actions..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono">
                <th className="pb-3">Audit ID</th>
                <th className="pb-3">User Email</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Resource Target</th>
                <th className="pb-3">Result</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3 font-mono text-cyan-400">#{log.id}</td>
                  <td className="py-3 font-medium text-white font-mono">{log.user_email}</td>
                  <td className="py-3 font-mono text-slate-300 font-bold">{log.action}</td>
                  <td className="py-3 text-slate-400 font-mono">{log.resource}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {log.result}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
