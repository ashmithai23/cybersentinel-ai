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
  Radar,
  RotateCcw,
  Sliders,
  FileText
} from 'lucide-react';
import { useDetection } from '../context/DetectionContext';
import { PredictionResult } from '../types';

export const ThreatDetectionPage: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    fileName,
    fileSize,
    validationData,
    selectedModel,
    setSelectedModel,
    selectedAsset,
    setSelectedAsset,
    loading,
    progressPercent,
    loadingMessage,
    detectionResults,
    selectedResult,
    setSelectedResult,
    filterSeverity,
    setFilterSeverity,
    filterPrediction,
    setFilterPrediction,
    processFile,
    runInference,
    useSampleDataset,
    resetPipeline
  } = useDetection();

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const filteredResults = detectionResults?.results.filter((r) => {
    if (filterSeverity !== 'ALL' && r.severity !== filterSeverity) return false;
    if (filterPrediction !== 'ALL' && r.prediction !== filterPrediction) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* HEADER WITH RESET CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Radar className="w-6 h-6 text-cyan-400" /> AI Threat Detection & Preprocessing Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload security logs or network traffic datasets to run feature scaling, 1D-CNN / ANN / LSTM inference, and transparent SHAP explainability.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {(validationData || detectionResults) && (
            <button
              onClick={resetPipeline}
              className="flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Reset & New Upload
            </button>
          )}

          {!validationData && !loading && (
            <button
              onClick={useSampleDataset}
              className="flex items-center px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Load CIC-IDS Sample
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE LOADING & PROGRESS BAR */}
      {loading && (
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-cyan-500 space-y-3 animate-fadeIn">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-cyan-300 font-bold flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              {loadingMessage || 'Processing threat detection pipeline...'}
            </span>
            <span className="font-mono text-white font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            State is persisted in background. You can navigate between pages while inference completes safely.
          </div>
        </div>
      )}

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
            onClick={() => {
              if (currentStep > s.num || (s.num === 6 && detectionResults)) {
                setCurrentStep(s.num);
              }
            }}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition-all select-none cursor-pointer ${
              currentStep === s.num
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950 font-bold'
                : currentStep > s.num
                ? 'bg-slate-800/80 border-slate-700 text-emerald-400'
                : 'bg-[#0D1527] border-slate-800 text-slate-500'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* STEP 1-5: FILE DROPZONE & PIPELINE CONFIG */}
      {currentStep < 6 && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">Target AI Model Architecture</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="ANN / MLP">ANN / Multi-Layer Perceptron (Dense)</option>
                <option value="1D CNN">1D Convolutional Neural Network (Spatial)</option>
                <option value="LSTM">LSTM Sequence Model (Temporal)</option>
                <option value="Random Forest Baseline">Random Forest Baseline (Ensemble)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">Target Infrastructure Asset</label>
              <input
                type="text"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="/api/v1/network"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={runInference}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center transition-all shadow-lg shadow-cyan-950 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                {validationData ? `Run AI Inference (${validationData.num_rows} records)` : 'Run Pipeline Inference'}
              </button>
            </div>
          </div>

          {/* Drag & Drop File Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-[#080C14]/60 ${
              isDragging ? 'border-cyan-400 bg-cyan-950/30' : 'border-slate-800 hover:border-cyan-500/50'
            }`}
          >
            <UploadCloud className={`w-12 h-12 mx-auto mb-3 transition-colors ${isDragging ? 'text-cyan-300 animate-bounce' : 'text-cyan-400'}`} />
            <div className="text-sm font-bold text-white">
              {isDragging ? 'Drop your CSV file here!' : 'Upload Defensive Security Log (CSV)'}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
              Drag & drop any CSV security dataset here. Universal support for CIC-IDS, Web Server Logs, Snort/Suricata, Firewall exports, and AWS CloudTrail CSVs.
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="log-file-input"
            />
            <div className="mt-4 flex items-center justify-center gap-3">
              <label
                htmlFor="log-file-input"
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-lg shadow-cyan-950 flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" /> Select & Upload Your CSV File
              </label>

              <button
                onClick={useSampleDataset}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Load Pre-Packaged Sample
              </button>
            </div>
          </div>

          {/* Validation Data Preview */}
          {validationData && (
            <div className="p-4 bg-[#080C14] border border-slate-800 rounded-xl text-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Validation Succeeded: {validationData.filename} ({validationData.num_rows} records)
                </div>
                <button
                  onClick={runInference}
                  disabled={loading}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center text-xs shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />}
                  Analyze Dataset Records
                </button>
              </div>
              <div className="text-slate-300">
                <strong className="text-white">Detected Feature Columns ({validationData.detected_columns?.length || 0}):</strong>{' '}
                <span className="font-mono text-cyan-300/80">{(validationData.detected_columns || []).slice(0, 10).join(', ')}...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: INFERENCE RESULTS */}
      {currentStep === 6 && detectionResults && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card p-4 rounded-xl border-l-4 border-l-cyan-500">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Analyzed Records</div>
              <div className="text-2xl font-bold text-white mt-1 font-mono">{detectionResults.total_analyzed}</div>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-4 border-l-orange-500">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Threats Flagged</div>
              <div className="text-2xl font-bold text-orange-400 mt-1 font-mono">{detectionResults.threats_found}</div>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Critical Severity</div>
              <div className="text-2xl font-bold text-red-400 mt-1 font-mono">{detectionResults.critical_count}</div>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-4 border-l-amber-500">
              <div className="text-[11px] font-mono text-slate-400 uppercase">High Severity</div>
              <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{detectionResults.high_count}</div>
            </div>
            <div className="glass-card p-4 rounded-xl border-l-4 border-l-blue-500">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Model Used</div>
              <div className="text-lg font-bold text-cyan-300 mt-1 font-mono">{detectionResults.model_used}</div>
            </div>
          </div>

          {/* Results Table & Filters */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Threat Inference Results & Explainable Findings</h3>
                <p className="text-[11px] text-slate-400">Classified flow records with confidence ratings, severity weights, and SHAP explanations.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="bg-[#080C14] border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono"
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
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center font-mono cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Export JSON
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono">
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
                      <td className="py-3 font-semibold text-white font-mono">{res.prediction}</td>
                      <td className="py-3 font-mono text-cyan-400">{res.confidence}%</td>
                      <td className="py-3 font-mono text-slate-300 font-bold">{res.risk_score} / 100</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono" style={{ backgroundColor: `${res.severity_color}15`, borderColor: `${res.severity_color}40`, color: res.severity_color }}>
                          {res.severity}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300 max-w-sm truncate leading-relaxed">{res.explanation}</td>
                      <td className="py-3">
                        <button
                          onClick={() => setSelectedResult(res)}
                          className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg flex items-center font-mono cursor-pointer transition-all"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" /> Explainable Finding — #{selectedResult.event_index + 1}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Model: {selectedResult.model_used}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-white text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#080C14] rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] font-mono uppercase">Prediction</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{selectedResult.prediction}</div>
              </div>
              <div className="p-3 bg-[#080C14] rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] font-mono uppercase">Confidence</div>
                <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{selectedResult.confidence}%</div>
              </div>
              <div className="p-3 bg-[#080C14] rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] font-mono uppercase">Risk Score</div>
                <div className="text-sm font-bold text-red-400 font-mono mt-0.5">{selectedResult.risk_score} / 100 ({selectedResult.severity})</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-white mb-1">Natural Language Rationale</div>
              <p className="text-xs text-slate-300 p-3 bg-[#080C14] rounded-xl border border-slate-800 leading-relaxed">
                {selectedResult.explanation}
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-white mb-2">Top Contributing Features</div>
              <div className="space-y-2">
                {selectedResult.top_features.map((feat) => (
                  <div key={feat.feature} className="p-2.5 bg-[#080C14] rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-mono text-cyan-300 font-semibold">{feat.feature}</span>
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
