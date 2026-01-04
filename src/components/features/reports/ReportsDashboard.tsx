"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarX, BarChart3 } from "lucide-react";
import AbsenceReport from "./AbsenceReport";
import WeeklyOverview from "./WeeklyOverview";

export default function ReportsDashboard() {
  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="daily">
          <CalendarX className="ms-2 h-4 w-4" />
          تقرير الغياب اليومي
        </TabsTrigger>
        <TabsTrigger value="weekly">
          <BarChart3 className="ms-2 h-4 w-4" />
          نظرة عامة أسبوعية
        </TabsTrigger>
      </TabsList>
      <TabsContent value="daily">
        <Card>
          <CardContent className="pt-6">
            <AbsenceReport />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="weekly">
        <Card>
           <CardContent className="pt-6">
            <WeeklyOverview />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}


function AbsenceReport() {
    // Placeholder until the real component is built
    return (
        <div className="text-center text-muted-foreground p-8">
            سيتم هنا عرض تقرير الغياب اليومي.
        </div>
    )
}

function WeeklyOverview() {
    // Placeholder until the real component is built
    return (
        <div className="text-center text-muted-foreground p-8">
            سيتم هنا عرض نظرة عامة على الحضور الأسبوعي.
        </div>
    )
}
