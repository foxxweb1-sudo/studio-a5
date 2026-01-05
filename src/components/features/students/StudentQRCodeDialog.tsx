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
const PlaceholderQRCode = ({ studentId }: { studentId: string }) => {
  // Simple hashing function to create a visually different pattern for each ID
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h;
  };
  const code = hash(studentId);
  const size = 45;
  const pixels = Array.from({ length: size * size }, (_, i) => {
    return (code >> (i % 31)) & 1;
  });

  return (
    <svg width="200" height="200" viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" className="mx-auto block shape-rendering-crispedges">
      <rect width={size} height={size} fill="white" />
      {pixels.map((p, i) => (
        p === 1 && <rect key={i} x={i % size} y={Math.floor(i / size)} width="1" height="1" fill="#0A4A8C" />
      ))}
       <g fill="#0A4A8C">
        <rect x="2" y="2" width="9" height="9" />
        <rect x={size-11} y="2" width="9" height="9" />
        <rect x="2" y={size-11} width="9" height="9" />
        <rect x="5" y="5" width="3" height="3" fill="white"/>
        <rect x={size-8} y="5" width="3" height="3" fill="white"/>
        <rect x="5" y={size-8} width="3" height="3" fill="white"/>
      </g>
    </svg>
  );
};


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
             <PlaceholderQRCode studentId={student.id} />
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
