
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, AlertCircle } from 'lucide-react';
import PaymentTracker from "./PaymentTracker";
import OutstandingPayments from "./OutstandingPayments";

interface PaymentsDashboardProps {
  gradeFilter?: string;
}

export default function PaymentsDashboard({ gradeFilter }: PaymentsDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
        <Tabs defaultValue="tracker" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-2xl mb-6 w-full flex h-auto overflow-x-auto justify-start">
                <TabsTrigger value="tracker" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap">
                <CreditCard className="h-4 w-4" />
                تسجيل دفعة
                </TabsTrigger>
                <TabsTrigger value="outstanding" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap">
                <AlertCircle className="h-4 w-4" />
                المتأخرات
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracker">
                <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b">
                        <CardTitle className="text-xl">تسجيل استلام مبلغ</CardTitle>
                        <CardDescription>اختر الطالب والشهر المستحق لتسجيل السداد.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <PaymentTracker gradeFilter={gradeFilter} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="outstanding">
                <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden">
                     <CardHeader className="bg-rose-50/50 border-b">
                        <CardTitle className="text-xl flex items-center gap-2 text-rose-700">
                            <AlertCircle className="h-5 w-5" />
                            كشف المتأخرات المالية الذكي
                        </CardTitle>
                        <CardDescription>عرض الطلاب الذين لم يسددوا الرسوم ضمن الفترة المحددة فقط.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <OutstandingPayments gradeFilter={gradeFilter} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
