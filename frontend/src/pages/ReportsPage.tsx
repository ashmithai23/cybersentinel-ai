import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
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
import { StatCard } from '../components/StatCard';
import { Card3D } from '../components/Card3D';
import { CyberButton } from '../components/CyberButton';
import { cyberSound } from '../utils/cyberSound';

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
    cyberSound.playRadarPing();
    setGenerating(true);
    try {
      await reportsService.generateReport(reportTitle, format);
      cyberSound.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#3b82f6']
      });
      fetchReports();
    } catch (e: any) {
      alert('Failed to generate report: ' + (e.response?.data?.detail || e.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (rep: SecurityReport) => {
    cyberSound.playCyberClick();
    try {
      await reportsService.downloadReport(rep.id, `${rep.report_uuid}.${rep.format.toLowerCase()}`);
      setDownloadSuccess(rep.report_uuid);
      cyberSound.playSuccessChime();
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e: any) {
      alert('Download failed: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-500/20 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-cyan-400 animate-pulse" /> Automated Security Assessment Report Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate executive and technical security reports containing deep learning methodology, findings evidence, and remediation runbooks in PDF, JSON, or CSV formats.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <CyberButton
            onClick={() => {
              cyberSound.playCyberClick();
              fetchReports();
            }}
            icon={RefreshCw}
            variant="secondary"
            size="sm"
          >
            Refresh Archive
          </CyberButton>
        </div>
      </div>

      {/* SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Generated Reports"
          value={reports.length}
          subtext="Executive & Technical Dossiers"
          icon={FileText}
          color="cyan"
        />

        <StatCard
          title="ReportLab Engine"
          value="PDF / JSON / CSV"
          subtext="Automated Layout Engine"
          icon={FileCode}
          color="indigo"
        />

        <StatCard
          title="Executive Digest"
          value="Ready"
          subtext="Model Metrics & SOAR"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* REPORT GENERATION WIZARD */}
      <Card3D glowColor="purple" className="p-6 space-y-5">
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
              className="w-full bg-[#060A14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">Export Document Format</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'PDF', label: 'PDF Dossier', icon: FileText, desc: 'Executive report with graphics' },
                { type: 'JSON', label: 'JSON Dataset', icon: FileCode, desc: 'Machine-readable evidence' },
                { type: 'CSV', label: 'CSV Spreadsheets', icon: FileSpreadsheet, desc: 'Tabular findings export' }
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = format === fmt.type;
                return (
                  <div
                    key={fmt.type}
                    onClick={() => {
                      cyberSound.playCyberClick();
                      setFormat(fmt.type as any);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-[#060A14] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <div className="font-bold text-xs text-white">{fmt.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{fmt.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <CyberButton
              onClick={handleGenerate}
              disabled={generating}
              icon={Plus}
              variant="primary"
              size="md"
            >
              {generating ? 'Compiling Dossier...' : `Generate ${format} Assessment Report`}
            </CyberButton>
          </div>
        </div>
      </Card3D>

      {/* REPORT ARCHIVE TABLE */}
      <Card3D glowColor="cyan" className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Generated Report Archive & Downloads</h3>
          <span className="text-[10px] font-mono text-cyan-400">Historical Dossiers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono">
                <th className="pb-3">Title</th>
                <th className="pb-3">Format</th>
                <th className="pb-3">UUID</th>
                <th className="pb-3">Generated At</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-cyan-500/10 transition-all font-mono">
                  <td className="py-3 font-semibold text-white font-sans max-w-xs truncate">{rep.title}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {rep.format}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">{rep.report_uuid}</td>
                  <td className="py-3 text-slate-400 text-[11px]">{rep.created_at || 'Just now'}</td>
                  <td className="py-3">
                    <CyberButton
                      onClick={() => handleDownload(rep)}
                      icon={Download}
                      variant="outline"
                      size="sm"
                    >
                      {downloadSuccess === rep.report_uuid ? 'Downloaded!' : 'Download'}
                    </CyberButton>
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
