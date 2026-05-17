
import { FieldValue } from "firebase/firestore";

export type UserProfile = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isBlocked?: boolean;
  lastLogin?: FieldValue;
};

export type ScheduleSession = {
  id: string;
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

export type DeletionRequest = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  requestedAt: any;
  reason: string;
  studentCount: number;
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: FieldValue | any;
};

export type Student = {
  id: string;
  name: string;
  grade: string;
  phone?: string;
  parentPhone?: string;
  createdAt: FieldValue;
};

export type NewStudent = Omit<Student, 'id' | 'createdAt'>;

export type AttendanceRecord = {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  createdAt: FieldValue;
};

export type NewPayment = Omit<PaymentRecord, 'id' | 'createdAt' | 'date'>;

export type PaymentRecord = {
  id: string;
  studentId: string;
  amount: number;
  month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
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
  whatsappChannel?: string;
  facebook?: string;
  twitter?: string;
  telegram?: string;
  techStoreUrl?: string;
  cookiePolicyUrl?: string;
  lastRulesUpdate?: FieldValue;
};
