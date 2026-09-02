
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarX, BarChart3, WalletCards, AlertCircle } from "lucide-react";
import AbsenceReport from "./AbsenceReport";
import WeeklyOverview from "./WeeklyOverview";
import OutstandingPayments from "../payments/OutstandingPayments";

export default function ReportsDashboard() {
  return (
    <div className="max-w-6xl mx-auto w-full">
        <Tabs defaultValue="daily" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-2xl mb-8 w-full flex h-auto overflow-x-auto justify-start border">
                <TabsTrigger value="daily" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <CalendarX className="h-4 w-4" />
                    الغياب اليومي
                </TabsTrigger>
                <TabsTrigger value="arrears" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <WalletCards className="h-4 w-4" />
                    المتأخرات المالية
                </TabsTrigger>
                <TabsTrigger value="weekly" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <BarChart3 className="h-4 w-4" />
                    تحليلات الأداء
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily">
                <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="bg-rose-50/50 border-b p-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                                <CalendarX className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-rose-800">تقرير الغياب اليومي</CardTitle>
                                <CardDescription>قائمة الطلاب الذين لم يسجلوا حضورهم حتى اللحظة لهذا اليوم.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <AbsenceReport />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="arrears">
                <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="bg-amber-50/50 border-b p-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                                <WalletCards className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-amber-800">كشف المتأخرات الشامل</CardTitle>
                                <CardDescription>رصد الطلاب الذين لم يسددوا الرسوم بناءً على الفترات المحاسبية المعتمدة.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <OutstandingPayments />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="weekly">
                <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="bg-indigo-50/50 border-b p-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-indigo-800">إحصائيات الحضور الأسبوعية</CardTitle>
                                <CardDescription>تمثيل بياني يوضح معدلات انضباط الطلاب خلال آخر 7 أيام عمل.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <WeeklyOverview />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
