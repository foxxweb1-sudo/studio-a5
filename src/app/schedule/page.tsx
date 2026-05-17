'use client';

import ScheduleSettings from "@/components/features/attendance/ScheduleSettings";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SchedulePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
               <Clock className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">مواعيد العمل</PageHeaderTitle>
          </div>
          <PageHeaderDescription>
            حدد أيام العمل وساعات الدوام لتنظيم عملية تسجيل الحضور والغياب.
          </PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all h-12 px-6 font-bold"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>
      
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ScheduleSettings />
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="p-2 bg-blue-500 rounded-xl text-white shrink-0">
            <Clock className="h-5 w-5" />
        </div>
        <div className="space-y-1">
            <h4 className="font-black text-blue-900 dark:text-blue-100 text-sm">لماذا تضبط مواعيد العمل؟</h4>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/60 leading-relaxed">
              تفعيل مواعيد العمل يساعدك على منع تسجيل حضور الطلاب خارج أوقات الدرس الرسمية، مما يحافظ على دقة تقاريرك الأسبوعية والشهرية ويمنع التلاعب بالبيانات.
            </p>
        </div>
      </div>
    </div>
  );
}
