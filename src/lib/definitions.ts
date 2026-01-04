export type Student = {
  id: string;
  name: string;
  grade: string;
  phone: string;
  parentPhone: string;
  createdAt: string;
};

export type AttendanceRecord = {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present';
};

export type PaymentRecord = {
  id: string;
  studentId: string;
  amount: number;
  month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
};
