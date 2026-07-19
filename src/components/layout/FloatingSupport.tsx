'use client';

import Image from 'next/image';
import Link from 'next/link';

/**
 * FloatingSupport - A global floating button for customer service.
 * Positioned fixed at the bottom right with a pulsing indicator.
 */
export default function FloatingSupport() {
  return (
    <div className="fixed bottom-24 right-6 z-[100] group animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <Link
        href="https://tech-support-team.vercel.app/customer-service"
        target="_blank"
        rel="noopener noreferrer"
        className="block relative transition-all duration-300 active:scale-90 hover:-translate-y-1"
      >
        {/* Pulsing Badge */}
        <div className="absolute -top-1 -right-1 flex h-5 w-5 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
        </div>

        {/* Support Icon Container */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] border-4 border-white dark:border-slate-800 bg-white group-hover:shadow-primary/40 transition-all duration-500 ring-4 ring-primary/5">
          <Image
            src="https://i.ibb.co/CsTrp1m0/images-q-tbn-ANd9-Gc-Tvq-P9hv-OWt69-Swh-J4sq-RXXr-Epks-KPX6e-Of2-D5v-Yra-XD16hx-GO88ox9ia-W-s-10.jpg"
            alt="Customer Service"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            unoptimized
          />
        </div>

        {/* Label Tooltip (Hidden on small screens) */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none hidden md:block">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            تحدث مع خدمة العملاء
          </div>
        </div>
      </Link>
    </div>
  );
}
