import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const historicalData = [
    { month: 'Jan', benign: 12000, threats: 450, risk_avg: 42 },
    { month: 'Feb', benign: 14500, threats: 620, risk_avg: 54 },
    { month: 'Mar', benign: 18200, threats: 890, risk_avg: 68 },
    { month: 'Apr', benign: 21000, threats: 1100, risk_avg: 71 },
    { month: 'May', benign: 24851, threats: 1284, risk_avg: 65 }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" /> Historical Cyber Threat Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">Multi-month security posture trends, risk score distributions, and model performance over time.</p>
      </div>

      <div className="glass-card p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-white mb-3">Multi-Month Threat Volume Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1E293B', fontSize: '12px' }} />
              <Area type="monotone" dataKey="threats" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Threat Volume" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
