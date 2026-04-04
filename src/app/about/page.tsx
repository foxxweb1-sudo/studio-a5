
'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>من نحن</PageHeaderTitle>
          <PageHeaderDescription>تعرف على الفريق المطور لتطبيق الحضور.</PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 text-center">
        <CardContent className="p-10 space-y-8">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-primary/20">
            <Image 
              src="https://www.appcreator24.com/srv/imgs/gen/3816551_ico.png?v=19"
              alt="TECH Logo"
              fill
              className="object-contain p-4"
            />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-primary">فريق TECH</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              نحن فريق متخصص في تقديم الحلول البرمجية الذكية التي تهدف إلى تبسيط العملية التعليمية والإدارية. نؤمن بأن التكنولوجيا يجب أن تكون في خدمة المعلم والمربي لتوفير الوقت والجهد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
              <div className="flex items-center gap-3 mb-2 text-primary">
                <Users className="h-5 w-5" />
                <span className="font-bold">رؤيتنا</span>
              </div>
              <p className="text-sm">أن نكون الخيار الأول للمعلمين في العالم العربي لإدارة فصولهم الدراسية بأحدث التقنيات.</p>
            </div>
            <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
              <div className="flex items-center gap-3 mb-2 text-emerald-600">
                <Heart className="h-5 w-5" />
                <span className="font-bold">قيمنا</span>
              </div>
              <p className="text-sm">الابتكار، البساطة، وأمن المعلومات هي الركائز الأساسية التي نبني عليها كافة مشاريعنا.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
