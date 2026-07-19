
'use client';

import { Button } from '@/components/ui/button';
import {
  ChevronUp,
  LayoutGrid,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import AiAssistant from './AiAssistant';
import Link from 'next/link';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8">
      <div className="container max-w-screen-xl px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-1 space-y-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                          <LayoutGrid className="h-6 w-6" />
                      </div>
                      <span className="text-xl font-black tracking-tighter">المركز الذكي</span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">نظام متكامل لإدارة الحضور والمدفوعات والمحتوى التعليمي بأحدث تقنيات الويب.</p>
                  <div className="flex gap-2">
                      <AiAssistant />
                      <div className="flex flex-col justify-center">
                          <span className="text-[10px] text-slate-400 font-black uppercase">الذكاء الاصطناعي</span>
                          <span className="text-[11px] font-black text-primary">المساعد متاح 24/7</span>
                      </div>
                  </div>
              </div>

              <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white border-r-4 border-primary pr-3 leading-none">روابط سريعة</h4>
                  <ul className="space-y-2 pr-1">
                      <li><Link href="/" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">الرئيسية</Link></li>
                      <li><Link href="/attendance" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">تسجيل الحضور</Link></li>
                      <li><Link href="/payments" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">إدارة المدفوعات</Link></li>
                  </ul>
              </div>

              <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white border-r-4 border-indigo-400 pr-3 leading-none">القانونية والدعم</h4>
                  <ul className="space-y-2 pr-1">
                      <li><Link href="/privacy" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
                      <li><Link href="/terms" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">اتفاقية الاستخدام</Link></li>
                      <li><Link href="/about" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">من نحن</Link></li>
                      <li><Link href="/contact" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">تواصل مع TECH</Link></li>
                  </ul>
              </div>

              <div className="space-y-6">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 mb-3">
                          <ShieldCheck className="h-5 w-5 text-emerald-500" />
                          <span className="text-xs font-black">بياناتك في أمان</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium italic">يتم تشفير كافة البيانات وسجلات الحضور لضمان أعلى مستويات الخصوصية للمعلمين والطلاب.</p>
                  </div>
              </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Made with ❤️ by <span className="text-primary">TECH TEAM</span> © 2026
              </p>
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl">
                      <UserCheck className="h-3 w-3" />
                      نظام موثق
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-2xl h-12 w-12 bg-white dark:bg-slate-800 hover:bg-primary hover:text-white transition-all shadow-sm group"
                    onClick={scrollToTop}
                  >
                    <ChevronUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                  </Button>
              </div>
          </div>
      </div>
    </footer>
  );
}
