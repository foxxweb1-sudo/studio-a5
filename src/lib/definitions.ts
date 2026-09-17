
import { FieldValue } from "firebase/firestore";

export type UserProfile = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  paymentTiming?: 'start' | 'mid' | 'end';
  isBlocked?: boolean;
  isVerified?: boolean;
  isAssistant?: boolean;
  assignedTeacherId?: string;
  assistantEmail?: string;
  assistantPassword?: string;
  assistantExpiresAt?: any;
  lastLogin?: FieldValue;
};

export type PromoCode = {
  id: string;
  code: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: any;
  createdAt: FieldValue;
};

export type ScheduleSession = {
  id: string;
  name: string;
  grade: string;
  days: string[];
  startTime: string;
  endTime: string;
};

export type WorkingSchedule = {
  isActive: boolean;
  sessions: ScheduleSession[];
  updatedAt?: FieldValue;
};

export type GradePaymentPeriod = {
  id: string;
  startMonth: string;
  endMonth: string;
};

export type GradePaymentConfig = {
  periods: GradePaymentPeriod[];
};

export type PaymentConfig = {
  grades?: Record<string, GradePaymentConfig>;
  updatedAt?: FieldValue;
};

export type Student = {
  id: string;
  name: string;
  grade: string;
  groupId?: string;
  phone?: string;
  parentPhone?: string;
  createdAt: FieldValue;
  isArchived?: boolean;
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  groupId?: string;
  date: string;
  status: 'present' | 'absent';
  createdAt: FieldValue;
};

export type PaymentRecord = {
  id: string;
  studentId: string;
  amount: number;
  month: string;
  date: string;
  createdAt: FieldValue;
};

export type ExamResult = {
  id: string;
  studentId: string;
  score: number;
  totalScore: number;
  date: string;
  createdAt: FieldValue;
};

export type GlobalConfig = {
  id: string;
  appName?: string;
  appLogo?: string;
  appVersion?: string;
  loginBg?: string;
  signupBg?: string;
  contactPhone?: string;
  contactEmail?: string;
  supportUrl?: string;
  techStoreUrl?: string;
  apkDownloadUrl?: string;
  cookiePolicyUrl?: string;
  updatesUrl?: string;
};
