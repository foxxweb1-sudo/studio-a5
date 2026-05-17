"use client";

import { Student } from "@/lib/definitions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Printer } from 'lucide-react';
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // الحصول على محتوى الـ SVG الخاص بالـ QR
    const qrElement = document.getElementById('student-qr-code-svg');
    const qrSvg = qrElement ? qrElement.outerHTML : '';

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة كود الطالب - ${student.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0;
              background-color: white;
            }
            .ticket {
              border: 3px dashed #0A4A8C;
              padding: 40px;
              border-radius: 30px;
              text-align: center;
              width: 350px;
              background: white;
            }
            .header { color: #0A4A8C; margin-bottom: 20px; }
            h1 { font-size: 28px; margin: 0; font-weight: 900; }
            .grade { font-size: 18px; color: #666; margin: 10px 0 25px 0; font-weight: bold; }
            .qr-wrapper { 
              margin: 20px auto;
              padding: 15px;
              border: 1px solid #eee;
              display: inline-block;
              border-radius: 15px;
            }
            .code-text { 
              font-family: monospace; 
              font-size: 24px; 
              font-weight: bold; 
              letter-spacing: 4px; 
              color: #0A4A8C;
              margin-top: 20px;
              background: #f0f7ff;
              padding: 10px;
              border-radius: 10px;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #aaa; }
            @media print {
              .no-print { display: none; }
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>${student.name}</h1>
              <div class="grade">${student.grade}</div>
            </div>
            <div class="qr-wrapper">
              ${qrSvg}
            </div>
            <div class="code-text">${student.id}</div>
            <div class="footer">تطبيق الحضور الذكي - TECH TEAM</div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-0 shadow-2xl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-black">كود الطالب: {student.name}</DialogTitle>
          <DialogDescription className="font-bold">
            استخدم هذا الكود لتسجيل الحضور. يمكنك طباعته أو حفظه على الهاتف.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center gap-6">
          <div className="p-6 bg-white rounded-[2rem] shadow-inner border-2 border-slate-50 flex items-center justify-center">
             <QRCode 
               id="student-qr-code-svg"
               value={student.id} 
               size={200} 
               bgColor={"#ffffff"} 
               fgColor={"#0A4A8C"} 
               level={"L"} 
             />
          </div>
          
          <div className="w-full space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl w-full text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المعرف الرقمي</p>
                <code className="text-2xl font-black text-primary tracking-[0.3em] break-all">
                    {student.id}
                </code>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button onClick={handlePrint} variant="outline" className="h-14 rounded-2xl font-black gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                    <Printer className="h-5 w-5" />
                    طباعة الكود
                </Button>
                <Button onClick={handleCopy} className="h-14 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                    <Copy className="h-5 w-5" />
                    نسخ الكود
                </Button>
            </div>
          </div>
          
          <p className="text-[10px] text-muted-foreground font-bold italic opacity-60 text-center">
            * ملاحظة: يفضل الطباعة على ورق مقوى لضمان سهولة المسح بالكاميرا.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
