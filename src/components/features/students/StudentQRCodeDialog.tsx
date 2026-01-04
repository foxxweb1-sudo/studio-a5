"use client";

import { Student } from "@/lib/definitions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from 'lucide-react';

interface StudentQRCodeDialogProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// A placeholder SVG that looks like a QR code
const PlaceholderQRCode = () => (
    <svg width="200" height="200" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" className="mx-auto block">
      <defs>
        <pattern id="p" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M0 0h5v5H0z" fill="#0A4A8C" fillOpacity="0.2"/>
          <path d="M0,0L5,5M5,0L0,5" stroke="#F0F4F8" strokeWidth="1"/>
        </pattern>
        <rect id="frame" x="2.5" y="2.5" width="40" height="40" rx="2" stroke="#0A4A8C" strokeWidth="2" fill="none"/>
      </defs>
      <rect width="45" height="45" fill="url(#p)"/>
      <use href="#frame"/>
      <g fill="#0A4A8C">
        <rect x="7" y="7" width="9" height="9" rx="1"/>
        <rect x="29" y="7" width="9" height="9" rx="1"/>
        <rect x="7" y="29" width="9" height="9" rx="1"/>
        <rect x="10" y="10" width="3" height="3" fill="#F0F4F8"/>
        <rect x="32" y="10" width="3" height="3" fill="#F0F4F8"/>
        <rect x="10" y="32" width="3" height="3" fill="#F0F4F8"/>
        <rect x="29" y="29" width="4" height="4" rx="1"/>
      </g>
    </svg>
);


export default function StudentQRCodeDialog({ student, open, onOpenChange }: StudentQRCodeDialogProps) {
  const { toast } = useToast();

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
          <div className="p-4 bg-white rounded-lg shadow-inner">
            <PlaceholderQRCode />
          </div>
          <p className="text-muted-foreground text-sm">هذا الكود هو المعرف الفريد للطالب</p>
          <div className="p-3 bg-muted rounded-md w-full text-center font-mono text-xs break-all">
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
