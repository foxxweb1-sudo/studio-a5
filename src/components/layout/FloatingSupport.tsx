'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * FloatingSupport - A global floating button for customer service.
 * Now positioned at bottom-left, smaller, and dismissible.
 */
export default function FloatingSupport() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] group animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="relative">
        {/* Dismiss Button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-[110] shadow-md border opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-rose-50 hover:text-rose-500"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-3 w-3" />
        </Button>

        <Link
          href="https://tech-support-team.vercel.app/customer-service"
          target="_blank"
          rel="noopener noreferrer"
          className="block relative transition-all duration-300 active:scale-90 hover:-translate-y-1"
        >
          {/* Pulsing Badge */}
          <div className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
          </div>

          {/* Support Icon Container - Resized to be smaller */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] border-2 border-white dark:border-slate-800 bg-white group-hover:shadow-primary/40 transition-all duration-500 ring-4 ring-primary/5">
            <Image
              src="https://i.ibb.co/CsTrp1m0/images-q-tbn-ANd9-Gc-Tvq-P9hv-OWt69-Swh-J4sq-RXXr-Epks-KPX6e-Of2-D5v-Yra-XD16hx-GO88ox9ia-W-s-10.jpg"
              alt="Customer Service"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              unoptimized
            />
          </div>

          {/* Label Tooltip - Positioned to the right of the button */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[9px] font-black shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none hidden md:block">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              خدمة العملاء
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
