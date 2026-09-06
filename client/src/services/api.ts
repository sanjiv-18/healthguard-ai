import axios from 'axios';
import type {
  User,
  VitalReading,
  EnvironmentReading,
  RiskAssessment,
  HealthBaseline,
  Alert,
  Notification,
  Device,
  EmergencyEvent,
  DoctorAccess,
  AccessAuditLog,
  ClinicalNote,
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('healthguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('healthguard_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; name: string; role?: string; dob?: string; gender?: string; height?: number; weight?: number }) =>
    api.post<{ user: User; token: string }>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  getMe: () => api.get<{ user: User }>('/auth/me'),
};

export const healthAPI = {
  getCurrent: () => api.get<{ reading: VitalReading }>('/health/current'),
  getHistory: (params?: { from?: string; to?: string; limit?: number }) =>
    api.get<{ readings: VitalReading[] }>('/health/history', { params }),
  createReading: (data: Partial<VitalReading>) =>
    api.post<{ reading: VitalReading }>('/health/readings', data),
};

export const environmentAPI = {
  getCurrent: () => api.get<{ reading: EnvironmentReading }>('/environment/current'),
  getHistory: (params?: { from?: string; to?: string; limit?: number }) =>
    api.get<{ readings: EnvironmentReading[] }>('/environment/history', { params }),
};

export const aiAPI = {
  getRisk: () => api.get<{ risk: RiskAssessment }>('/ai/risk'),
  analyze: () => api.post<{ risk: RiskAssessment }>('/ai/analyze'),
};

export const baselineAPI = {
  get: () => api.get<{ baseline: HealthBaseline }>('/baseline'),
  recalculate: () => api.post<{ baseline: HealthBaseline }>('/baseline/recalculate'),
};

export const alertsAPI = {
  getAll: (params?: { status?: string; category?: string }) =>
    api.get<{ alerts: Alert[] }>('/alerts', { params }),
  acknowledge: (id: string) => api.post<{ alert: Alert }>(`/alerts/${id}/acknowledge`),
  resolve: (id: string) => api.post<{ alert: Alert }>(`/alerts/${id}/resolve`),
};

export const notificationsAPI = {
  getAll: () => api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications'),
  markRead: (id: string) => api.post<{ notification: Notification }>(`/notifications/${id}/read`),
};

export const devicesAPI = {
  getAll: () => api.get<{ devices: Device[] }>('/devices'),
  create: (data: { name: string; type: string }) =>
    api.post<{ device: Device }>('/devices', data),
  addReadings: (id: string, data: Partial<VitalReading>[]) =>
    api.post<{ message: string }>(`/devices/${id}/readings`, { readings: data }),
};

export const emergencyAPI = {
  triggerSOS: () => api.post<{ event: EmergencyEvent }>('/emergency/sos'),
  triggerFall: () => api.post<{ event: EmergencyEvent }>('/emergency/fall'),
  getEvents: () => api.get<{ events: EmergencyEvent[] }>('/emergency/events'),
};

export const accessAPI = {
  grantDoctor: (data: { doctorEmail: string; scopes: string[]; expiresInDays?: number }) =>
    api.post<{ access: DoctorAccess }>('/access/doctor', data),
  listAccess: () => api.get<{ accesses: DoctorAccess[] }>('/access/doctor'),
  viewAccess: (id: string) => api.get<{ access: DoctorAccess }>(`/access/doctor/${id}`),
  updateAccess: (id: string, data: { scopes?: string[]; expiresAt?: string }) =>
    api.patch<{ access: DoctorAccess }>(`/access/doctor/${id}`, data),
  revokeAccess: (id: string) => api.post<{ access: DoctorAccess }>(`/access/doctor/${id}/revoke`),
  getAuditLog: () => api.get<{ logs: AccessAuditLog[] }>('/access/audit-log'),
};

export const doctorAPI = {
  getDashboard: () => api.get<{ stats: any; patients: any[] }>('/doctor/dashboard'),
  getPatients: () => api.get<{ patients: any[] }>('/doctor/patients'),
  getPatient: (id: string) => api.get<{ patient: any; access: any }>(`/doctor/patients/${id}`),
  getPatientVitals: (id: string, params?: { from?: string; to?: string; limit?: number }) =>
    api.get<{ vitals: VitalReading[] }>(`/doctor/patients/${id}/vitals`, { params }),
  getPatientRisk: (id: string) =>
    api.get<{ risks: RiskAssessment[] }>(`/doctor/patients/${id}/risk`),
  getPatientAnalytics: (id: string) =>
    api.get<{ summary: any; dailyAverages: any[] }>(`/doctor/patients/${id}/analytics`),
  createNote: (patientId: string, data: { observation: string; assessment: string; followUp?: string }) =>
    api.post<{ note: ClinicalNote }>(`/doctor/patients/${patientId}/notes`, data),
};

export const privacyAPI = {
  getAccessLog: () => api.get<{ logs: AccessAuditLog[] }>('/privacy/access-log'),
  getSharing: () => api.get<{ sharing: DoctorAccess[] }>('/privacy/sharing'),
};

export const simulationAPI = {
  trigger: (scenarioType: string) =>
    api.post<{ 
      scenario: string;
      vitalReading: VitalReading;
      envReading?: EnvironmentReading;
      riskAssessment: RiskAssessment;
      alert: Alert | null;
      notification: Notification;
      recommendations: any[];
      systemEvent: any;
    }>(`/simulation/${scenarioType}`),
  reset: () => api.post<{ message: string; vitals: any; risk: any }>('/simulation/reset'),
};

export default api;
