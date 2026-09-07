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
  bodyTemperature: number;
  hydration: number;
  hrv?: number;
  sleepMinutes?: number;
  steps: number;
  stressPercent?: number;
  respiratoryRate?: number;
  calories?: number;
  timestamp: string;
  source: string;
  deviceId?: string;
}

export interface EnvironmentReading {
  id?: string;
  environmentalTemperature: number;
  humidity: number;
  aqi: number;
  uvIndex: number;
  heatIndex: number;
  windSpeed?: number;
  weatherCondition?: string;
  timestamp: string;
}

export interface HealthBaseline {
  id: string;
  userId: string;
  heartRateMin: number;
  heartRateMax: number;
  spo2Min: number;
  temperatureMin: number;
  temperatureMax: number;
  hydrationMin: number;
  hydrationMax: number;
  hrvMin: number;
  hrvMax: number;
  sleepMinMinutes: number;
  sleepMaxMinutes: number;
  stepsMin: number;
  stepsMax: number;
  calculatedAt: string;
}

export interface HealthScore {
  score: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  components: {
    heartRate: number;
    spo2: number;
    temperature: number;
    hydration: number;
    sleep: number;
    activity: number;
    stress: number;
    respiratory: number;
    environment: number;
  };
  reasons: string[];
  dataQuality: 'GOOD' | 'LIMITED' | 'STALE';
  timestamp?: string;
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
  manufacturer?: string;
  model?: string;
  provider: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING' | 'ERROR';
  battery: number;
  lastSync?: string;
  connectedAt?: string;
  disconnectedAt?: string;
  isSimulation: boolean;
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

export interface SimulationResult {
  scenario: string;
  vitalReading: VitalReading;
  envReading?: EnvironmentReading;
  riskAssessment: RiskAssessment;
  healthScore: HealthScore;
  alert: Alert | null;
  notification: Notification;
  recommendations: any[];
  systemEvent: SystemEvent;
  emergencyEvent?: EmergencyEvent;
  message?: string;
}

export function formatSleepDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function formatSteps(steps: number): string {
  return steps.toLocaleString();
}

export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}
