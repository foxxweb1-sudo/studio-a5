'use client';

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function AdBanner() {
    return (
        <div className="w-full">
            <Link href="#" target="_blank">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                        <div className="relative aspect-[3/1] w-full">
                             <Image 
                                src="https://picsum.photos/seed/adbanner1/1200/400"
                                alt="Advertisement"
                                fill
                                style={{ objectFit: 'cover' }}
                                data-ai-hint="advertisement banner"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                             <div className="absolute bottom-4 right-4 text-white">
                                <h3 className="font-bold text-lg">مساحة إعلانية</h3>
                                <p className="text-sm">هذا إعلان تجريبي. اضغط لمعرفة المزيد.</p>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
