import axios from 'axios';
import {
  DashboardStats,
  BatchDetectionResponse,
  Finding,
  ModelComparisonData,
  NetworkAnalysis,
  ApiSecurityAnalysis,
  SecurityReport,
  SystemInfo,
  SystemStatus,
  User
} from '../types';

const API_BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cybersentinel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('cybersentinel_token', res.data.access_token);
      localStorage.setItem('cybersentinel_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('cybersentinel_token');
    localStorage.removeItem('cybersentinel_user');
  },
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('cybersentinel_user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch (e) { return null; }
    }
    return { id: 1, email: 'admin@cybersentinel.ai', full_name: 'Lead Security Analyst', role: 'Admin' };
  }
};

export const dashboardService = {
  getOverview: async (): Promise<DashboardStats> => {
    const res = await apiClient.get('/dashboard/overview');
    return res.data;
  }
};

export const detectionService = {
  validateLogFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/detection/validate-log', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  analyzeBatch: async (events: any[], modelName: string = 'ANN / MLP', endpoint: string = '/api/v1/network'): Promise<BatchDetectionResponse> => {
    const res = await apiClient.post('/detection/analyze-batch', {
      model_name: modelName,
      asset_endpoint: endpoint,
      events
    });
    return res.data;
  }
};

export const findingsService = {
  getFindings: async (category?: string, severity?: string, status?: string, search?: string): Promise<Finding[]> => {
    const params: any = {};
    if (category) params.category = category;
    if (severity) params.severity = severity;
    if (status) params.status = status;
    if (search) params.search = search;
    const res = await apiClient.get('/findings', { params });
    return res.data;
  },
  updateStatus: async (findingId: number, status: string, assignedAnalyst?: string): Promise<Finding> => {
    const res = await apiClient.patch(`/findings/${findingId}/status`, {
      status,
      assigned_analyst: assignedAnalyst
    });
    return res.data;
  },
  addNote: async (findingId: number, text: string): Promise<Finding> => {
    const res = await apiClient.post(`/findings/${findingId}/notes`, { text });
    return res.data;
  }
};

export const modelsService = {
  getComparison: async (): Promise<ModelComparisonData> => {
    const res = await apiClient.get('/models/comparison');
    return res.data;
  },
  setProductionModel: async (modelId: number) => {
    const res = await apiClient.post(`/models/set-production/${modelId}`);
    return res.data;
  }
};

export const networkService = {
  getOverview: async (): Promise<NetworkAnalysis> => {
    const res = await apiClient.get('/network/overview');
    return res.data;
  }
};

export const apiSecurityService = {
  getOverview: async (): Promise<ApiSecurityAnalysis> => {
    const res = await apiClient.get('/api-security/overview');
    return res.data;
  }
};

export const reportsService = {
  listReports: async (): Promise<SecurityReport[]> => {
    const res = await apiClient.get('/reports');
    return res.data;
  },
  generateReport: async (title: string, format: string = 'PDF'): Promise<SecurityReport> => {
    const res = await apiClient.post('/reports/generate', { title, format });
    return res.data;
  },
  getDownloadUrl: (reportId: number) => `/api/v1/reports/${reportId}/download`
};

export const settingsService = {
  getStatus: async (): Promise<SystemStatus> => {
    const res = await apiClient.get('/settings/status');
    return res.data;
  },
  getInfo: async (): Promise<SystemInfo> => {
    const res = await apiClient.get('/info');
    return res.data;
  }
};
