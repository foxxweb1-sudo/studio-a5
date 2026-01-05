"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, AlertCircle } from 'lucide-react';
import PaymentTracker from "./PaymentTracker";
import OutstandingPayments from "./OutstandingPayments";

interface PaymentsDashboardProps {
  gradeFilter?: string;
}

export default function PaymentsDashboard({ gradeFilter }: PaymentsDashboardProps) {
  return (
    <Tabs defaultValue="tracker" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tracker">
          <CreditCard className="ms-2 h-4 w-4" />
          تتبع المدفوعات
        </TabsTrigger>
        <TabsTrigger value="outstanding">
          <AlertCircle className="ms-2 h-4 w-4" />
          المدفوعات المستحقة
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tracker">
        <Card>
          <CardContent className="pt-6">
            <PaymentTracker gradeFilter={gradeFilter} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="outstanding">
        <Card>
          <CardContent className="pt-6">
            <OutstandingPayments gradeFilter={gradeFilter} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
