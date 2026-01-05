'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CameraOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  className?: string;
}

export default function QRCodeScanner({ onScan, className }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(true);
  const lastScannedData = useRef<string | null>(null);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'الكاميرا غير متاحة',
          description: 'الرجاء السماح بالوصول إلى الكاميرا في إعدادات المتصفح.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if(scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
    };
  }, [toast]);
  
  const handleScan = useCallback((data: string) => {
    if (data && data !== lastScannedData.current) {
      lastScannedData.current = data;
      onScan(data);
      setIsScanning(false); // Pause scanning
      
      // Resume scanning after a delay
      scanTimeout.current = setTimeout(() => {
        setIsScanning(true);
        lastScannedData.current = null;
      }, 3000); // 3-second delay
    }
  }, [onScan]);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
       if (!isScanning) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code) {
               handleScan(code.data);
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (hasCameraPermission) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
       if(scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
    };
  }, [hasCameraPermission, handleScan, isScanning]);

  return (
    <div className={cn("relative flex flex-col items-center justify-center gap-4", className)}>
        <div className="relative w-full aspect-square max-w-[400px] overflow-hidden rounded-lg border-4 border-dashed border-primary/50">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted
            />
            <div className="absolute inset-0 bg-grid-pattern opacity-20"/>
             {!isScanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white text-xl font-bold">تم المسح!</p>
              </div>
            )}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-primary"/>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-primary"/>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-primary"/>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-primary"/>
        </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {hasCameraPermission === false && (
        <Alert variant="destructive">
          <CameraOff className="h-4 w-4" />
          <AlertTitle>الوصول إلى الكاميرا مطلوب</AlertTitle>
          <AlertDescription>
            يرجى السماح بالوصول إلى الكاميرا لاستخدام هذه الميزة.
          </AlertDescription>
        </Alert>
      )}

      {hasCameraPermission === null && (
         <div className="text-center text-muted-foreground">
            <p>جاري طلب إذن الوصول إلى الكاميرا...</p>
         </div>
      )}
       <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(rgba(var(--primary-rgb), 0.1) 1px, transparent 1px),
            linear-gradient(to right, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        :root {
            --primary-rgb: 211 88% 30%;
        }
      `}</style>
    </div>
  );
}
