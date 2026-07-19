
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, History, TrendingUp } from 'lucide-react';
import ExamRecorder from "./ExamRecorder";
import ExamHistory from "./ExamHistory";

interface ExamDashboardProps {
  gradeFilter?: string;
}

export default function ExamDashboard({ gradeFilter }: ExamDashboardProps) {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="recorder" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-2xl mb-8 w-full flex h-auto overflow-x-auto justify-start border">
                <TabsTrigger value="recorder" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Award className="h-4 w-4" />
                    تسجيل درجات جديدة
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <History className="h-4 w-4" />
                    سجل نتائج الصف
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recorder">
                <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="bg-indigo-50/50 border-b p-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black">تسجيل نتيجة امتحان</CardTitle>
                                <CardDescription>أدخل بيانات الامتحان والدرجة المحققة لكل طالب.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <ExamRecorder gradeFilter={gradeFilter} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="history">
                <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                     <CardHeader className="bg-slate-50/50 border-b p-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-800">سجل النتائج الأكاديمية</CardTitle>
                                <CardDescription>استعرض كافة الدرجات المسجلة لطلاب هذا الصف.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ExamHistory gradeFilter={gradeFilter} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
