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
  lastLogin?: FieldValue;
};

export type ScheduleSession = {
  id: string;
  name: string; // اسم المجموعة (مثلاً: مجموعة السبت صباحاً)
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
  groupId?: string; // المعرف الفريد للمجموعة التي ينتمي إليها الطالب
  phone?: string;
  parentPhone?: string;
  createdAt: FieldValue;
  isArchived?: boolean;
};

export type NewStudent = Omit<Student, 'id' | 'createdAt'>;

export type AttendanceRecord = {
  id: string;
  studentId: string;
  groupId?: string; // تسجيل المجموعة وقت الحضور للتوثيق
  date: string;
  status: 'present' | 'absent';
  createdAt: FieldValue;
};

export type NewPayment = Omit<PaymentRecord, 'id' | 'createdAt' | 'date'>;

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

export type NewExamResult = Omit<ExamResult, 'id' | 'createdAt'>;

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
  apkDownloadUrl?: string;
  cookiePolicyUrl?: string;
  updatesUrl?: string;
  
  // نظام الإعلانات المطور
  nativeAdCode?: string;
  popunderAdCode?: string;
  socialBarCode?: string;
  smartlinkCode?: string;
  banner728x90Code?: string;
  banner320x50Code?: string;
  banner160x300Code?: string;
  banner468x60Code?: string;
  banner300x250Code?: string;
  banner160x600Code?: string;
  
  // جوجل أدسنس
  adsenseClientCode?: string; // كود التفعيل العام (Header)
  adsenseInArticleCode?: string;
  adsenseResponsiveCode?: string;
  
  lastRulesUpdate?: FieldValue;
};
