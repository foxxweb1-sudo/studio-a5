
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
  status: 'present';
  createdAt: FieldValue;
};

export type PaymentRecord = {
  id: string;
  studentId: string;
  amount: number;
  month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
  createdAt: FieldValue;
};

export type NewPayment = Omit<PaymentRecord, 'id' | 'createdAt' | 'date'>;

export type GlobalConfig = {
  id: string;
  appName?: string;
  appLogo?: string;
  loginBg?: string;
  signupBg?: string;
};
