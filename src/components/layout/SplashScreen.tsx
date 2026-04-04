
'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function SplashScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // تهيئة حجم الكانفاس ليملأ الشاشة
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    // إعدادات تأثير الماتريكس (الأرقام المتساقطة)
    const characters = "0123456789";
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      // رسم طبقة شفافة سوداء لخلق تأثير الذيل خلف الأرقام
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#22c55e"; // لون أخضر تقني (Tailwind green-500)
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // اختيار رقم عشوائي
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // رسم الرقم في موضعه الحالي
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // إعادة الرقم للأعلى بشكل عشوائي بعد وصوله للنهاية
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // تحريك الرقم للأسفل
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    window.addEventListener('resize', resizeCanvas);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden animate-in fade-in duration-500">
      {/* خلفية الأرقام المتساقطة (Matrix Rain) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
      />
      
      {/* حاوية المحتوى - طبقة فوق الخلفية */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-xs w-full text-center">
        {/* اللوجو داخل دائرة مع تأثير ظل مشع خلفي */}
        <div className="relative w-36 h-36 mb-4 animate-bounce duration-[2000ms] rounded-full p-1 bg-gradient-to-tr from-green-500/50 to-emerald-500/20 shadow-[0_0_30px_rgba(34,197,94,0.4)] border border-white/10 backdrop-blur-md overflow-hidden flex items-center justify-center">
          <div className="relative w-full h-full rounded-full bg-white/5 overflow-hidden p-4">
            <Image
              src="https://www.appcreator24.com/srv/imgs/gen/3816551_ico.png?v=19"
              alt="Logo"
              fill
              className="object-contain scale-90"
              priority
            />
          </div>
        </div>

        {/* اسم التطبيق والوصف مع لمسة تقنية */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tighter text-green-500 animate-in slide-in-from-bottom-4 duration-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            الحضور
          </h1>
          <p className="text-green-100/90 font-medium text-sm animate-in slide-in-from-bottom-2 duration-1000 delay-200">
            نظام إدارة الطلاب والمدفوعات الذكي
          </p>
        </div>

        {/* مؤشر التحميل */}
        <div className="mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-green-500/50" />
        </div>
      </div>

      {/* عبارة Powered by TECH */}
      <div className="absolute bottom-12 z-10 flex flex-col items-center gap-1 opacity-90 animate-in fade-in duration-1000 delay-500">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-green-500/70">
          Powered by
        </span>
        <span className="text-2xl font-black tracking-widest text-green-500 font-mono italic">
          TECH
        </span>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
