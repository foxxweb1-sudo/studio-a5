"use client";

import { useAttendance } from "@/hooks/use-app-data";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function WeeklyOverview() {
  const { attendance } = useAttendance();

  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const data = last7Days.map((date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const dayName = format(date, "eeee", { locale: ar });
    const count = attendance.filter((a) => a.date === formattedDate).length;
    return { name: dayName, total: count };
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            direction: "rtl",
          }}
          labelStyle={{ fontWeight: "bold" }}
          formatter={(value, name) => [`${value} طالب`, "الحضور"]}
        />
        <Bar
          dataKey="total"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
