import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  FileCode,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Clock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { reportsService } from '../services/api';
import { SecurityReport } from '../types';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportTitle, setReportTitle] = useState('CyberSentinel AI Executive Threat Assessment Report');
  const [format, setFormat] = useState<'PDF' | 'JSON' | 'CSV'>('PDF');
  const [generating, setGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportsService.listReports();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await reportsService.generateReport(reportTitle, format);
      fetchReports();
    } catch (e: any) {
      alert('Failed to generate report: ' + (e.response?.data?.detail || e.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (rep: SecurityReport) => {
    try {
      await reportsService.downloadReport(rep.id, `${rep.report_uuid}.${rep.format.toLowerCase()}`);
      setDownloadSuccess(rep.report_uuid);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e: any) {
      alert('Download failed: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" /> Automated Security Assessment Report Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate executive and technical security reports containing deep learning methodology, findings evidence, and remediation runbooks in PDF, JSON, or CSV formats.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="flex items-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 text-cyan-400 ${loading ? 'animate-spin' : ''}`} /> Refresh Archive
        </button>
      </div>

      {/* REPORT GENERATION WIZARD */}
      <div className="glass-card p-6 rounded-2xl space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" /> Generate New Security Assessment Dossier
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">Document Assessment Title</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-2">Export Format Selection</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'PDF', label: 'PDF Document', desc: 'Formatted ReportLab tables, executive charts, and remediation steps.', icon: FileText, color: 'text-red-400' },
                { id: 'JSON', label: 'Structured JSON', desc: 'Machine-readable schema compatible with Splunk & SIEM ingestion.', icon: FileCode, color: 'text-cyan-400' },
                { id: 'CSV', label: 'Tabular CSV', desc: 'Raw findings matrix for spreadsheet analysis and metric audits.', icon: FileSpreadsheet, color: 'text-emerald-400' }
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = format === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border-cyan-500 shadow-lg shadow-cyan-950/40'
                        : 'bg-[#080C14] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 mb-1">
                      <Icon className={`w-4 h-4 ${fmt.color}`} />
                      <span className="font-bold text-xs text-white font-mono">{fmt.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{fmt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center transition-all shadow-lg shadow-cyan-950 cursor-pointer"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Generate Assessment Report
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE REPORT PREVIEW CARD */}
      <div className="glass-card p-6 rounded-2xl border-l-4 border-l-cyan-500 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Report Executive Summary Structure Preview</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Preview Mode
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed p-4 bg-[#080C14] rounded-xl border border-slate-800">
          "CyberSentinel AI conducted an automated defensive threat assessment. The multi-model deep learning inference engine analyzed packet flows across perimeter gateways. Findings are cataloged with transparent SHAP feature importances, mathematical risk scores (0-100), MITRE ATT&CK alignments, and immediate mitigation containment scripts."
        </p>
      </div>

      {/* GENERATED REPORTS REPOSITORY */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Generated Report Repository Archive</h3>
          <span className="text-xs text-slate-400 font-mono">{reports.length} Total Documents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono">
                <th className="pb-3">Report UUID</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Format</th>
                <th className="pb-3">Findings</th>
                <th className="pb-3">Author</th>
                <th className="pb-3">Generated Date</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3 font-mono text-cyan-400 font-bold">{rep.report_uuid}</td>
                  <td className="py-3 font-semibold text-white max-w-xs truncate">{rep.title}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      rep.format === 'PDF' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                      rep.format === 'JSON' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {rep.format}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {rep.total_findings} items
                  </td>
                  <td className="py-3 font-mono text-slate-400 text-[11px]">{rep.generated_by}</td>
                  <td className="py-3 font-mono text-slate-500 text-[11px]">
                    {rep.created_at ? new Date(rep.created_at).toLocaleString() : 'Just now'}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDownload(rep)}
                      className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded-lg font-mono font-semibold inline-flex items-center cursor-pointer transition-all text-xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      {downloadSuccess === rep.report_uuid ? 'Downloaded!' : `Download ${rep.format}`}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
