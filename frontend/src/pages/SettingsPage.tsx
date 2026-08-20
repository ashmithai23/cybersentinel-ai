import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Database, Server, ShieldCheck, Activity } from 'lucide-react';
import { settingsService, apiClient } from '../services/api';
import { SystemStatus } from '../types';

export const SettingsPage: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    settingsService.getStatus().then(setStatus).catch(console.error);
    apiClient.get('/audit').then((res) => setAuditLogs(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-cyan-400" /> Platform Configuration & System Audit Logs
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure environment variables, database connections, and review immutable audit trails.</p>
      </div>

      {/* SYSTEM TELEMETRY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-emerald-500">
          <div className="text-[11px] text-slate-400 uppercase">System Status</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{status?.system_status || 'Operational'}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-cyan-500">
          <div className="text-[11px] text-slate-400 uppercase">Inference Engine</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">{status?.model_status || 'Ready'}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-blue-500">
          <div className="text-[11px] text-slate-400 uppercase">FastAPI Server</div>
          <div className="text-lg font-bold text-blue-400 mt-1">{status?.api_status || 'Online'}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-4 border-l-emerald-500">
          <div className="text-[11px] text-slate-400 uppercase">Database Connection</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{status?.database_status || 'Connected'}</div>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="glass-card p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white">Immutable Platform Audit Trail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Audit ID</th>
                <th className="pb-3">User Email</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Resource Target</th>
                <th className="pb-3">Result</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-3 font-mono text-cyan-400">#{log.id}</td>
                  <td className="py-3 font-medium text-white">{log.user_email}</td>
                  <td className="py-3 font-mono text-slate-300">{log.action}</td>
                  <td className="py-3 text-slate-400">{log.resource}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {log.result}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
