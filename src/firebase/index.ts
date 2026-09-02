'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
} from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

/**
 * دالة تهيئة Firebase الأساسية
 * تضمن عدم تهيئة التطبيق أكثر من مرة وتوفر الخدمات المطلوبة
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    try {
      // محاولة التهيئة التلقائية أولاً
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      firebaseApp = getApp();
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  // استخدام getFirestore التقليدي لضمان الاستقرار ومنع خطأ "Already Initialized"
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const database = getDatabase(firebaseApp, "https://studio-6098024039-4334b-default-rtdb.firebaseio.com/");

  return {
    firebaseApp,
    auth,
    firestore,
    database,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
