
'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6 max-w-xs w-full text-center">
        {/* Logo Container with Animation */}
        <div className="relative w-32 h-32 mb-4 animate-bounce duration-[2000ms]">
          <Image
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiHaE3dKYhmGfFicg0_Wc4yKmAKiknwqbFwh4CaXUApy6y16_SgI-bDb77phbVKGS1IrV0vcYiWX_rSew-KHwSj4R12fnKgG536WQumeihlf752GG9CmFfXHvuRd1GLH_JcVNZ5Ly0vzkRTKFERkywLRImcZL4PsuXaLMG32V-9y-ZVQN2ASSktDxpz6I4/s256/150.png"
            alt="Logo"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter text-primary animate-in slide-in-from-bottom-4 duration-700">
            تطبيق الحضور
          </h1>
          <p className="text-muted-foreground animate-in slide-in-from-bottom-2 duration-1000 delay-200">
            نظام إدارة الطلاب والمدفوعات الذكي
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        </div>
      </div>

      {/* Footer Brand */}
      <div className="absolute bottom-12 flex flex-col items-center gap-1 opacity-60 animate-in fade-in duration-1000 delay-500">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Powered by
        </span>
        <span className="text-lg font-bold tracking-widest text-foreground">
          TECH
        </span>
      </div>
    </div>
  );
}
