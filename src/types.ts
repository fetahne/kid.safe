export type UserRole = 'ADMIN' | 'PARENT' | 'CHILD';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  status: 'ACTIVE' | 'SUSPENDED';
  childrenCount: number;
}

export type UnlockMethod = 'PIN' | 'SECURITY_QUESTION' | 'FACE_RECOGNITION';

export interface AllowedApp {
  id: string;
  name: string;
  category: 'EDUCATIONAL' | 'GAMES' | 'VIDEO' | 'READING' | 'CREATIVE';
  iconName: string;
  description: string;
  url?: string;
  isCustom?: boolean;
  minAge?: number;
  timeLimitMinutes?: number; // Optional app-specific cap
}

export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  age: number;
  avatar: string;
  deviceName: string;
  dailyTimeLimitMinutes: number;
  usedTodayMinutes: number;
  unlockMethod: UnlockMethod;
  parentPin: string;
  securityQuestion: {
    question: string;
    answer: string;
  };
  allowedApps: string[]; // AllowedApp IDs
  notifyOnSessionStart: boolean;
  notifyOnSessionEnd: boolean;
  notificationChannel: 'EMAIL' | 'SMS' | 'BOTH';
  parentEmail: string;
  parentPhone: string;
  isLocked: boolean;
  lastActiveSession?: {
    startTime: string;
    durationMinutes: number;
    remainingSeconds: number;
    activeAppId?: string;
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId?: string;
  childId?: string;
  childName?: string;
  actionType: 
    | 'LOGIN' 
    | 'LOGOUT' 
    | 'SESSION_START' 
    | 'SESSION_END' 
    | 'APP_LAUNCH' 
    | 'UNAUTHORIZED_ATTEMPT' 
    | 'TIME_EXTENDED' 
    | 'REMOTE_LOCK' 
    | 'PIN_VERIFIED' 
    | 'FACE_VERIFIED'
    | 'SETTINGS_CHANGED';
  details: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  ipAddress: string;
  deviceInfo: string;
}

export interface ParentNotification {
  id: string;
  childId: string;
  childName: string;
  type: 'SESSION_START' | 'SESSION_END' | 'WARNING_10M' | 'WARNING_5M' | 'TIME_EXPIRED' | 'UNAUTHORIZED_ACCESS';
  title: string;
  message: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH';
  recipient: string;
  timestamp: string;
  isRead: boolean;
}

export interface AgePreset {
  ageGroup: string;
  recommendedMinutes: number;
  description: string;
  recommendedApps: string[];
}
