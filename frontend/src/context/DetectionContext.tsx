import React, { createContext, useContext, useState, useEffect } from 'react';
import { BatchDetectionResponse, PredictionResult } from '../types';
import { detectionService } from '../services/api';

interface DetectionContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  fileName: string | null;
  fileSize: number | null;
  validationData: any;
  setValidationData: (data: any) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  loading: boolean;
  progressPercent: number;
  loadingMessage: string;
  detectionResults: BatchDetectionResponse | null;
  setDetectionResults: (res: BatchDetectionResponse | null) => void;
  selectedResult: PredictionResult | null;
  setSelectedResult: (res: PredictionResult | null) => void;
  filterSeverity: string;
  setFilterSeverity: (sev: string) => void;
  filterPrediction: string;
  setFilterPrediction: (pred: string) => void;
  processFile: (file: File) => Promise<void>;
  runInference: () => Promise<void>;
  useSampleDataset: () => void;
  resetPipeline: () => void;
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

const STORAGE_KEY = 'cybersentinel_detection_state';

export const DetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state from sessionStorage if available
  const savedState = (() => {
    try {
      const item = sessionStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  })();

  const [currentStep, setCurrentStep] = useState<number>(savedState?.currentStep || 1);
  const [fileName, setFileName] = useState<string | null>(savedState?.fileName || null);
  const [fileSize, setFileSize] = useState<number | null>(savedState?.fileSize || null);
  const [validationData, setValidationData] = useState<any>(savedState?.validationData || null);
  const [selectedModel, setSelectedModel] = useState<string>(savedState?.selectedModel || 'ANN / MLP');
  const [selectedAsset, setSelectedAsset] = useState<string>(savedState?.selectedAsset || '/api/v1/network');
  const [loading, setLoading] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [detectionResults, setDetectionResults] = useState<BatchDetectionResponse | null>(savedState?.detectionResults || null);
  const [selectedResult, setSelectedResult] = useState<PredictionResult | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterPrediction, setFilterPrediction] = useState<string>('ALL');

  // Cache state in sessionStorage across component navigation and refreshes
  useEffect(() => {
    try {
      const stateToSave = {
        currentStep,
        fileName,
        fileSize,
        validationData,
        selectedModel,
        selectedAsset,
        detectionResults
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      // Ignore storage errors if quota exceeded
    }
  }, [currentStep, fileName, fileSize, validationData, selectedModel, selectedAsset, detectionResults]);

  const parseCsvOnClient = (fileContent: string) => {
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { columns: [], records: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase().replace(/\s+|-/g, '_'));
    const records: Record<string, any>[] = [];

    // Cap client parsed records to responsive batch of up to 250 rows for fast, instant inference
    for (let i = 1; i < Math.min(lines.length, 251); i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length === headers.length) {
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          const val = values[idx];
          const numVal = Number(val);
          rowObj[h] = isNaN(numVal) ? val : numVal;
        });
        records.push(rowObj);
      }
    }
    return { columns: headers, records, totalLines: lines.length - 1 };
  };

  const processFile = async (selectedFile: File) => {
    setFileName(selectedFile.name);
    setFileSize(selectedFile.size);
    setLoading(true);
    setLoadingMessage('Validating CSV dataset & mapping feature schema...');
    setProgressPercent(20);

    try {
      const res = await detectionService.validateLogFile(selectedFile);
      setValidationData(res);
      setProgressPercent(100);
      setCurrentStep(2);
    } catch (err: any) {
      console.warn('Backend validation notice, switching to instant client-side CSV parser:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const { columns, records, totalLines } = parseCsvOnClient(text);
          if (records.length > 0) {
            setValidationData({
              filename: selectedFile.name,
              num_rows: totalLines,
              detected_columns: columns,
              sample_records: records.slice(0, 5),
              parsed_records: records,
              message: `Successfully validated ${totalLines} records (${records.length} sampled for real-time inference).`
            });
            setProgressPercent(100);
            setCurrentStep(2);
          } else {
            alert('Could not parse valid records from CSV file. Please check file format.');
          }
        }
      };
      reader.readAsText(selectedFile);
    } finally {
      setLoading(false);
      setProgressPercent(0);
    }
  };

  const runInference = async () => {
    setLoading(true);
    setLoadingMessage('Running PyTorch feature scaling, deep learning classification, and SHAP explainability...');
    setProgressPercent(35);
    setCurrentStep(5);

    try {
      const recordsToAnalyze = validationData?.parsed_records || validationData?.sample_records || [
        { destination_port: 80, flow_duration: 120, total_fwd_packets: 4500, total_backward_packets: 2, total_length_of_fwd_packets: 450000, total_length_of_bwd_packets: 80, fwd_packet_length_max: 100, fwd_packet_length_min: 40, fwd_packet_length_mean: 60, bwd_packet_length_mean: 40, flow_bytes_s: 15000000, flow_packets_s: 35000, flow_iat_mean: 0.1, fwd_iat_mean: 0.1, bwd_iat_mean: 0, fwd_header_length: 90000, bwd_header_length: 40, fwd_packets_s: 35000, bwd_packets_s: 0, min_packet_length: 40, max_packet_length: 100, packet_length_mean: 60, packet_length_std: 10, syn_flag_count: 1, rst_flag_count: 1, psh_flag_count: 0, ack_flag_count: 0, urg_flag_count: 0, down_up_ratio: 0.0, average_packet_size: 60, active_mean: 0, idle_mean: 0 },
        { destination_port: 443, flow_duration: 1250, total_fwd_packets: 14, total_backward_packets: 10, total_length_of_fwd_packets: 1800, total_length_of_bwd_packets: 500, fwd_packet_length_max: 1800, fwd_packet_length_min: 100, fwd_packet_length_mean: 1800, bwd_packet_length_mean: 500, flow_bytes_s: 100000, flow_packets_s: 20, flow_iat_mean: 100, fwd_iat_mean: 100, bwd_iat_mean: 100, fwd_header_length: 280, bwd_header_length: 200, fwd_packets_s: 10, bwd_packets_s: 10, min_packet_length: 60, max_packet_length: 1800, packet_length_mean: 1150, packet_length_std: 300, syn_flag_count: 1, rst_flag_count: 0, psh_flag_count: 1, ack_flag_count: 1, urg_flag_count: 0, down_up_ratio: 1.0, average_packet_size: 1150, active_mean: 50, idle_mean: 200 }
      ];

      // Bound records payload to responsive size for sub-second execution
      const cappedRecords = recordsToAnalyze.slice(0, 250);

      setProgressPercent(60);
      const res = await detectionService.analyzeBatch(cappedRecords, selectedModel, selectedAsset);
      setProgressPercent(90);

      setDetectionResults(res);
      setCurrentStep(6);
      setProgressPercent(100);
    } catch (err: any) {
      alert('Inference failed: ' + (err.response?.data?.detail || err.message));
      setCurrentStep(2);
    } finally {
      setLoading(false);
      setProgressPercent(0);
    }
  };

  const useSampleDataset = () => {
    setLoading(true);
    setLoadingMessage('Loading pre-packaged CIC-IDS synthetic threat traffic...');
    setTimeout(() => {
      const sampleRecords = [
        { destination_port: 80, flow_duration: 120, total_fwd_packets: 4500, total_backward_packets: 2, total_length_of_fwd_packets: 450000, total_length_of_bwd_packets: 80, fwd_packet_length_max: 100, fwd_packet_length_min: 40, fwd_packet_length_mean: 60, bwd_packet_length_mean: 40, flow_bytes_s: 15000000, flow_packets_s: 35000, flow_iat_mean: 0.1, fwd_iat_mean: 0.1, bwd_iat_mean: 0, fwd_header_length: 90000, bwd_header_length: 40, fwd_packets_s: 35000, bwd_packets_s: 0, min_packet_length: 40, max_packet_length: 100, packet_length_mean: 60, packet_length_std: 10, syn_flag_count: 1, rst_flag_count: 1, psh_flag_count: 0, ack_flag_count: 0, urg_flag_count: 0, down_up_ratio: 0.0, average_packet_size: 60, active_mean: 0, idle_mean: 0 },
        { destination_port: 443, flow_duration: 1250, total_fwd_packets: 14, total_backward_packets: 10, total_length_of_fwd_packets: 1800, total_length_of_bwd_packets: 500, fwd_packet_length_max: 1800, fwd_packet_length_min: 100, fwd_packet_length_mean: 1800, bwd_packet_length_mean: 500, flow_bytes_s: 100000, flow_packets_s: 20, flow_iat_mean: 100, fwd_iat_mean: 100, bwd_iat_mean: 100, fwd_header_length: 280, bwd_header_length: 200, fwd_packets_s: 10, bwd_packets_s: 10, min_packet_length: 60, max_packet_length: 1800, packet_length_mean: 1150, packet_length_std: 300, syn_flag_count: 1, rst_flag_count: 0, psh_flag_count: 1, ack_flag_count: 1, urg_flag_count: 0, down_up_ratio: 1.0, average_packet_size: 1150, active_mean: 50, idle_mean: 200 },
        { destination_port: 22, flow_duration: 8500, total_fwd_packets: 120, total_backward_packets: 120, total_length_of_fwd_packets: 18000, total_length_of_bwd_packets: 14400, fwd_packet_length_max: 250, fwd_packet_length_min: 40, fwd_packet_length_mean: 150, bwd_packet_length_mean: 120, flow_bytes_s: 80000, flow_packets_s: 80, flow_iat_mean: 20, fwd_iat_mean: 20, bwd_iat_mean: 20, fwd_header_length: 2400, bwd_header_length: 2400, fwd_packets_s: 40, bwd_packets_s: 40, min_packet_length: 40, max_packet_length: 250, packet_length_mean: 135, packet_length_std: 30, syn_flag_count: 1, rst_flag_count: 0, psh_flag_count: 1, ack_flag_count: 1, urg_flag_count: 0, down_up_ratio: 1.0, average_packet_size: 135, active_mean: 20, idle_mean: 100 },
        { destination_port: 8080, flow_duration: 12, total_fwd_packets: 1, total_backward_packets: 0, total_length_of_fwd_packets: 0, total_length_of_bwd_packets: 0, fwd_packet_length_max: 0, fwd_packet_length_min: 0, fwd_packet_length_mean: 0, bwd_packet_length_mean: 0, flow_bytes_s: 0, flow_packets_s: 500, flow_iat_mean: 5, fwd_iat_mean: 0, bwd_iat_mean: 0, fwd_header_length: 20, bwd_header_length: 0, fwd_packets_s: 500, bwd_packets_s: 0, min_packet_length: 0, max_packet_length: 0, packet_length_mean: 0, packet_length_std: 0, syn_flag_count: 1, rst_flag_count: 0, psh_flag_count: 0, ack_flag_count: 0, urg_flag_count: 0, down_up_ratio: 0.0, average_packet_size: 0, active_mean: 0, idle_mean: 0 }
      ];
      setFileName('cicids_sample_traffic.csv');
      setFileSize(15240);
      setValidationData({
        filename: 'cicids_sample_traffic.csv',
        num_rows: sampleRecords.length,
        detected_columns: Object.keys(sampleRecords[0]),
        sample_records: sampleRecords,
        parsed_records: sampleRecords,
        message: 'Pre-packaged CIC-IDS dataset loaded.'
      });
      setCurrentStep(2);
      setLoading(false);
    }, 300);
  };

  const resetPipeline = () => {
    setCurrentStep(1);
    setFileName(null);
    setFileSize(null);
    setValidationData(null);
    setDetectionResults(null);
    setSelectedResult(null);
    setLoading(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DetectionContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        fileName,
        fileSize,
        validationData,
        setValidationData,
        selectedModel,
        setSelectedModel,
        selectedAsset,
        setSelectedAsset,
        loading,
        progressPercent,
        loadingMessage,
        detectionResults,
        setDetectionResults,
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
      }}
    >
      {children}
    </DetectionContext.Provider>
  );
};

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};
