'use client';

import { useContext } from 'react';
import { AdContext } from '@/context/AdProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import { Button } from '../ui/button';

export default function InterstitialAd() {
  const adContext = useContext(AdContext);

  if (!adContext) {
    return null;
  }

  const { showAd, closeAd } = adContext;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeAd();
    }
  };

  return (
    <Dialog open={showAd} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-4 border-b">
          <DialogTitle>مساحة إعلانية</DialogTitle>
          <DialogDescription>شكرًا لدعمكم لنا!</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video">
           <Image 
                src="https://picsum.photos/seed/interstitial1/600/400"
                alt="Advertisement"
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint="advertisement modal"
            />
        </div>
         <div className="p-4 flex justify-end">
            <Button onClick={closeAd}>إغلاق الإعلان</Button>
         </div>
      </DialogContent>
    </Dialog>
  );
}
