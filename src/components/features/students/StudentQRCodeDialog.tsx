"use client";

import { Student } from "@/lib/definitions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from 'lucide-react';
import QRCode from "react-qr-code";

interface StudentQRCodeDialogProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudentQRCodeDialog({ student, open, onOpenChange }: StudentQRCodeDialogProps) {
  const { toast } = useToast();

  if (!student) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(student.id);
    toast({
      title: "تم النسخ",
      description: "تم نسخ كود الطالب بنجاح.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>كود الطالب: {student.name}</DialogTitle>
          <DialogDescription>
            استخدم هذا الكود لتسجيل الحضور. يمكنك طباعته أو حفظه على الهاتف.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-lg shadow-inner border">
             <QRCode value={student.id} size={200} bgColor={"#ffffff"} fgColor={"#0A4A8C"} level={"L"} />
          </div>
          <p className="text-muted-foreground text-sm">هذا الكود هو المعرف الرقمي للطالب</p>
          <div className="p-3 bg-muted rounded-md w-full text-center font-mono text-lg tracking-widest break-all">
            {student.id}
          </div>
          <Button onClick={handleCopy} className="w-full">
            <Copy className="ms-2 h-4 w-4" />
            نسخ الكود
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
