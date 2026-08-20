import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Award, Zap, BarChart2, ShieldCheck, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { modelsService } from '../services/api';
import { ModelComparisonData } from '../types';

export const AiModelsPage: React.FC = () => {
  const [data, setData] = useState<ModelComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await modelsService.getComparison();
      setData(res);
    } catch (e) {
      console.error('Failed to load model metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleSetActive = async (modelId: number) => {
    try {
      await modelsService.setProductionModel(modelId);
      loadModels();
    } catch (e: any) {
      alert('Failed to set production model');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mr-3" />
        <span>Loading Deep Learning & ML Performance Benchmark...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-cyan-400" /> AI Model Monitoring & MLOps Comparison
        </h1>
        <p className="text-xs text-slate-400 mt-1">Empirical evaluation metrics and latency performance comparison across ANN, 1D-CNN, LSTM, and Baseline RF models.</p>
      </div>

      {/* Active Production Banner */}
      <div className="glass-card p-4 rounded-xl border-l-4 border-l-cyan-500 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Production Inference Model</div>
            <div className="text-base font-bold text-white font-mono">{data?.active_production_model}</div>
          </div>
        </div>
        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-semibold">
          Primary Metric: F1-Score (Ensemble Baseline)
        </span>
      </div>

      {/* MODEL COMPARISON TABLE */}
      <div className="glass-card p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white">Empirical Model Performance Benchmark Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Architecture Model</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Accuracy</th>
                <th className="pb-3">Precision</th>
                <th className="pb-3">Recall</th>
                <th className="pb-3">F1-Score</th>
                <th className="pb-3">ROC-AUC</th>
                <th className="pb-3">Inference Time</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {data?.comparison_table.map((row, idx) => (
                <tr key={row.model} className="hover:bg-slate-800/40 transition-all">
                  <td className="py-3 font-semibold text-white font-mono">{row.model}</td>
                  <td className="py-3 text-slate-400">{row.type}</td>
                  <td className="py-3 font-mono text-cyan-400 font-bold">{(row.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-3 font-mono text-slate-300">{(row.precision * 100).toFixed(2)}%</td>
                  <td className="py-3 font-mono text-slate-300">{(row.recall * 100).toFixed(2)}%</td>
                  <td className="py-3 font-mono text-emerald-400 font-bold">{(row.f1_score * 100).toFixed(2)}%</td>
                  <td className="py-3 font-mono text-slate-300">{row.roc_auc.toFixed(4)}</td>
                  <td className="py-3 font-mono text-amber-400">{row.inference_time_ms} ms</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      row.status === 'Production' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {row.status !== 'Production' && (
                      <button
                        onClick={() => handleSetActive(idx + 1)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded border border-slate-700"
                      >
                        Set Production
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* METRICS COMPARISON CHART */}
      <div className="glass-card p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-white mb-4">F1-Score & Accuracy Comparison Across Model Architectures</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.comparison_table}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="model" stroke="#64748B" fontSize={11} />
              <YAxis domain={[0.9, 1.0]} stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1E293B', fontSize: '12px' }} />
              <Bar dataKey="f1_score" fill="#06B6D4" name="F1-Score" radius={[4, 4, 0, 0]} />
              <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
