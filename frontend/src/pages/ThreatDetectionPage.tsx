import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  Cpu,
  ShieldAlert,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  ArrowRight,
  Eye,
  RefreshCw,
  Radar
} from 'lucide-react';
import { detectionService } from '../services/api';
import { BatchDetectionResponse, PredictionResult } from '../types';

export const ThreatDetectionPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [validationData, setValidationData] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string>('ANN / MLP');
  const [selectedAsset, setSelectedAsset] = useState<string>('/api/v1/network');
  const [loading, setLoading] = useState<boolean>(false);
  const [detectionResults, setDetectionResults] = useState<BatchDetectionResponse | null>(null);
  const [selectedResult, setSelectedResult] = useState<PredictionResult | null>(null);

  // Filters
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterPrediction, setFilterPrediction] = useState<string>('ALL');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLoading(true);
      try {
        const res = await detectionService.validateLogFile(selectedFile);
        setValidationData(res);
        setCurrentStep(2);
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to validate log file.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRunInference = async () => {
    setLoading(true);
    setCurrentStep(5);
    try {
      // Use sample records or parsed records from CSV for batch inference
      const recordsToAnalyze = validationData?.sample_records || [
        { destination_port: 80, flow_duration: 120, total_fwd_packets: 4500, total_backward_packets: 2, total_length_of_fwd_packets: 450000, total_length_of_bwd_packets: 80, fwd_packet_length_max: 100, fwd_packet_length_min: 40, fwd_packet_length_mean: 60, bwd_packet_length_mean: 40, flow_bytes_s: 15000000, flow_packets_s: 35000, flow_iat_mean: 0.1, fwd_iat_mean: 0.1, bwd_iat_mean: 0, fwd_header_length: 90000, bwd_header_length: 40, fwd_packets_s: 35000, bwd_packets_s: 0, min_packet_length: 40, max_packet_length: 100, packet_length_mean: 60, packet_length_std: 10, syn_flag_count: 1, rst_flag_count: 1, psh_flag_count: 0, ack_flag_count: 0, urg_flag_count: 0, down_up_ratio: 0.0, average_packet_size: 60, active_mean: 0, idle_mean: 0 },
        { destination_port: 443, flow_duration: 1250, total_fwd_packets: 14, total_backward_packets: 10, total_length_of_fwd_packets: 1800, total_length_of_bwd_packets: 500, fwd_packet_length_max: 1800, fwd_packet_length_min: 100, fwd_packet_length_mean: 1800, bwd_packet_length_mean: 500, flow_bytes_s: 100000, flow_packets_s: 20, flow_iat_mean: 100, fwd_iat_mean: 100, bwd_iat_mean: 100, fwd_header_length: 280, bwd_header_length: 200, fwd_packets_s: 10, bwd_packets_s: 10, min_packet_length: 60, max_packet_length: 1800, packet_length_mean: 1150, packet_length_std: 300, syn_flag_count: 1, rst_flag_count: 0, psh_flag_count: 1, ack_flag_count: 1, urg_flag_count: 0, down_up_ratio: 1.0, average_packet_size: 1150, active_mean: 50, idle_mean: 200 },
        { destination_port: 22, flow_duration: 8500, total_fwd_packets: 120, total_backward_packets: 120, total_length_of_fwd_packets: 18000, total_length_of_bwd_packets: 14400, fwd_packet_length_max: 250, fwd_packet_length_min: 40, fwd_packet_length_mean: 150, bwd_packet_length_mean: 120, flow_bytes_s: 80000, flow_packets_s: 80, flow_iat_mean: 20, fwd_iat_mean: 20, bwd_iat_mean: 20, fwd_header_length: 2400, bwd_header_length: 2400, fwd_packets_s: 40, bwd_packets_s: 40, min_packet_length: 40, max_packet_length: 250, packet_length_mean: 135, packet_length_std: 30, syn_flag_count: 1, rst_flag_count: 0, psh_flag_count: 1, ack_flag_count: 1, urg_flag_count: 0, down_up_ratio: 1.0, average_packet_size: 135, active_mean: 20, idle_mean: 100 },
        { destination_port: 8080, flow_duration: 12, total_fwd_packets: 1, total_backward_packets: 0, total_length_of_fwd_packets: 0, total_length_of_bwd_packets: 0, fwd_packet_length_max: 0, fwd_packet_length_min: 0, fwd_packet_length_mean: 0, bwd_packet_length_mean: 0, flow_bytes_s: 0, flow_packets_s: 500, flow_iat_mean: 5, fwd_iat_mean: 0, bwd_iat_mean: 0, fwd_header_length: 20, bwd_header_length: 0, fwd_packets_s: 500, bwd_packets_s: 0, min_packet_length: 0, max_packet_length: 0, packet_length_mean: 0, packet_length_std: 0, syn_flag_count: 1, rst_flag_count: 0, psh_flag_count: 0, ack_flag_count: 0, urg_flag_count: 0, down_up_ratio: 0.0, average_packet_size: 0, active_mean: 0, idle_mean: 0 }
      ];

      const res = await detectionService.analyzeBatch(recordsToAnalyze, selectedModel, selectedAsset);
      setDetectionResults(res);
      setCurrentStep(6);
    } catch (err: any) {
      alert('Inference failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = detectionResults?.results.filter(r => {
    if (filterSeverity !== 'ALL' && r.severity !== filterSeverity) return false;
    if (filterPrediction !== 'ALL' && r.prediction !== filterPrediction) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Radar className="w-6 h-6 text-cyan-400" /> AI Threat Detection & Preprocessing Pipeline
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload security logs or network traffic datasets to run feature scaling, 1D-CNN / ANN / LSTM inference, and transparent explainability.
        </p>
      </div>

      {/* WORKFLOW STEPPER */}
      <div className="grid grid-cols-6 gap-2 text-center text-xs">
        {[
          { num: 1, label: '1. File Validation' },
          { num: 2, label: '2. Detected Columns' },
          { num: 3, label: '3. Feature Mapping' },
          { num: 4, label: '4. Preprocessing' },
          { num: 5, label: '5. AI Inference' },
          { num: 6, label: '6. Classification Results' }
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
              currentStep === s.num
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950'
                : currentStep > s.num
                ? 'bg-slate-800/80 border-slate-700 text-emerald-400'
                : 'bg-[#131B2E] border-slate-800 text-slate-500'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* STEP 1: FILE DROPZONE & CONFIG */}
      {currentStep < 6 && (
        <div className="glass-card p-6 rounded-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target AI Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ANN / MLP">ANN / Multi-Layer Perceptron (Dense)</option>
                <option value="1D CNN">1D Convolutional Neural Network (Spatial)</option>
                <option value="LSTM">LSTM Sequence Model (Temporal)</option>
                <option value="Random Forest Baseline">Random Forest Baseline (Ensemble)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Endpoint Asset</label>
              <input
                type="text"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="/api/v1/network"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRunInference}
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center transition-all shadow-lg shadow-cyan-950"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                Run Pipeline Inference
              </button>
            </div>
          </div>

          {/* Drag & Drop File Box */}
          <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-8 text-center transition-all bg-[#0B0F17]/40">
            <UploadCloud className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
            <div className="text-sm font-semibold text-white">Upload Defensive Security Log (CSV)</div>
            <p className="text-xs text-slate-400 mt-1">Supports CIC-IDS2017 schema, PCAP log exports, and web server request logs.</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="log-file-input"
            />
            <label
              htmlFor="log-file-input"
              className="inline-block mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg cursor-pointer border border-slate-700"
            >
              Browse CSV Files
            </label>
          </div>

          {validationData && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="flex items-center text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Validation Passed: {validationData.filename} ({validationData.num_rows} rows)
              </div>
              <div className="text-slate-300">
                <strong>Detected Feature Columns ({validationData.detected_columns.length}):</strong>{' '}
                <span className="font-mono text-slate-400">{validationData.detected_columns.slice(0, 10).join(', ')}...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: INFERENCE RESULTS TABLE */}
      {currentStep === 6 && detectionResults && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card p-4 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase">Analyzed Records</div>
              <div className="text-xl font-bold text-white mt-1">{detectionResults.total_analyzed}</div>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-4 border-l-orange-500">
              <div className="text-[11px] text-slate-400 uppercase">Threats Detected</div>
              <div className="text-xl font-bold text-orange-400 mt-1">{detectionResults.threats_found}</div>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
              <div className="text-[11px] text-slate-400 uppercase">Critical Severity</div>
              <div className="text-xl font-bold text-red-400 mt-1">{detectionResults.critical_count}</div>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-4 border-l-amber-500">
              <div className="text-[11px] text-slate-400 uppercase">High Severity</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{detectionResults.high_count}</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase">Model Execution</div>
              <div className="text-xl font-bold text-cyan-400 mt-1 font-mono">{detectionResults.model_used}</div>
            </div>
          </div>

          {/* Results Table & Filters */}
          <div className="glass-card p-5 rounded-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-sm font-semibold text-white">Threat Inference Results & Explainable Findings</h3>
              
              {/* Filters */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Severity:</span>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="bg-[#0B0F17] border border-slate-800 rounded px-2 py-1 text-slate-200"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(detectionResults, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", jsonStr);
                    downloadAnchor.setAttribute("download", "cybersentinel_inference_report.json");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Export JSON
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-3">Index</th>
                    <th className="pb-3">Prediction</th>
                    <th className="pb-3">Confidence</th>
                    <th className="pb-3">Risk Score</th>
                    <th className="pb-3">Severity</th>
                    <th className="pb-3">Model Rationale</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredResults.map((res) => (
                    <tr key={res.event_index} className="hover:bg-slate-800/40 transition-all">
                      <td className="py-3 font-mono text-slate-400">#{res.event_index + 1}</td>
                      <td className="py-3 font-semibold text-white">{res.prediction}</td>
                      <td className="py-3 font-mono text-cyan-400">{res.confidence}%</td>
                      <td className="py-3 font-mono text-slate-300 font-bold">{res.risk_score} / 100</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border" style={{ backgroundColor: `${res.severity_color}15`, borderColor: `${res.severity_color}40`, color: res.severity_color }}>
                          {res.severity}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 max-w-sm truncate">{res.explanation}</td>
                      <td className="py-3">
                        <button
                          onClick={() => setSelectedResult(res)}
                          className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Explain
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EXPLAINABILITY MODAL */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-2xl w-full p-6 rounded-xl border border-cyan-500/30 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" /> Explainable Finding — #{selectedResult.event_index + 1}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Model: {selectedResult.model_used}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <div className="text-slate-400">Prediction</div>
                <div className="text-sm font-bold text-white mt-0.5">{selectedResult.prediction}</div>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <div className="text-slate-400">Confidence</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">{selectedResult.confidence}%</div>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <div className="text-slate-400">Risk Score</div>
                <div className="text-sm font-bold text-red-400 mt-0.5">{selectedResult.risk_score} / 100 ({selectedResult.severity})</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-white mb-1">Natural Language Rationale</div>
              <p className="text-xs text-slate-300 p-3 bg-slate-900/80 rounded border border-slate-800">
                {selectedResult.explanation}
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-white mb-2">Top Contributing Features</div>
              <div className="space-y-2">
                {selectedResult.top_features.map((feat) => (
                  <div key={feat.feature} className="p-2 bg-slate-900/60 rounded border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-mono text-cyan-300">{feat.feature}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({feat.description})</span>
                    </div>
                    <div className="font-mono text-slate-200">Value: {feat.value} ({feat.contribution_percentage}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
