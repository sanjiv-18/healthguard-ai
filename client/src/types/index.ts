export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'DOCTOR';
  dob?: string;
  gender?: string;
  height?: number;
  weight?: number;
  specialty?: string;
  licenseNumber?: string;
  hospital?: string;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  user: User;
  emergencyContacts: EmergencyContact[];
  devices: Device[];
  baseline?: HealthBaseline;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  user: User;
  specialty: string;
  licenseNumber: string;
  hospital?: string;
}

export interface VitalReading {
  id?: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  hydration: number;
  hrv?: number;
  sleep?: number;
  activity?: number;
  timestamp: string;
  source: string;
}

export interface EnvironmentReading {
  id?: string;
  temperature: number;
  humidity: number;
  aqi: number;
  uvIndex: number;
  heatIndex: number;
  windSpeed?: number;
  timestamp: string;
}

export interface HealthBaseline {
  id: string;
  userId: string;
  avgHeartRate: number;
  avgSpo2: number;
  avgTemperature: number;
  avgHydration: number;
  avgHrv?: number;
  avgSleep?: number;
  avgActivity?: number;
  calculatedAt: string;
}

export interface RiskAssessment {
  overallRisk: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  heatStress: number;
  dehydration: number;
  respiratory: number;
  cardiacStrain: number;
  fatigue: number;
  explanation: string;
  recommendations: string[];
  confidence: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  category: string;
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  factors?: string[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync?: string;
  isSimulation?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface EmergencyEvent {
  id: string;
  type: 'sos' | 'fall';
  status: 'triggered' | 'responded' | 'resolved' | 'cancelled';
  timestamp: string;
  responseTime?: string;
  notes?: string;
}

export interface AccessScope {
  id: string;
  permission: string;
}

export interface DoctorAccess {
  id: string;
  userId: string;
  doctorId: string;
  doctor?: User;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  scopes: AccessScope[];
}

export interface AccessAuditLog {
  id: string;
  actorId: string;
  actor?: User;
  action: string;
  targetUserId?: string;
  details?: string;
  timestamp: string;
}

export interface ClinicalNote {
  id: string;
  doctorId: string;
  patientId: string;
  patient?: User;
  doctor?: User;
  observation: string;
  assessment: string;
  followUp?: string;
  createdAt: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SystemEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}
