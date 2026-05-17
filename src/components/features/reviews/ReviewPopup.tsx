
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, SendHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function ReviewPopup() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const permRef = useMemoFirebase(() => user ? doc(firestore, 'reviewPermissions', user.uid) : null, [user, firestore]);
  const { data: permission } = useDoc<any>(permRef);

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (permission?.canReview) {
      setIsOpen(true);
    }
  }, [permission]);

  const handleSubmitReview = () => {
    if (!user || !firestore || !comment.trim()) return;

    const reviewData = {
        userId: user.uid,
        userName: user.displayName || 'مستخدم مجهول',
        userPhoto: user.photoURL || '',
        rating,
        comment,
        createdAt: serverTimestamp()
    };

    // 1. إضافة التقييم (غير بانتظار)
    addDocumentNonBlocking(collection(firestore, 'reviews'), reviewData);
    
    // 2. مسح الإذن (غير بانتظار)
    deleteDocumentNonBlocking(doc(firestore, 'reviewPermissions', user.uid));
    
    // 3. تحديث الواجهة فوراً
    setIsOpen(false);
    toast({ 
        title: "تم استلام تقييمك", 
        description: "شكراً لك! رأيك يساعدنا على التطور المستمر." 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl overflow-hidden">
        <DialogHeader className="text-right">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
             <div className="p-2 bg-amber-500/20 rounded-xl">
                <Star className="h-6 w-6 fill-current" />
             </div>
             <div>
               <DialogTitle className="text-xl font-black">تقييم التطبيق</DialogTitle>
               <DialogDescription className="font-bold">يسعدنا سماع رأيك لتحسين التجربة.</DialogDescription>
             </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
             {[1, 2, 3, 4, 5].map((s) => (
               <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-125 hover:scale-110 focus:outline-none">
                  <Star className={`h-12 w-12 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
               </button>
             ))}
          </div>
          <Textarea 
            placeholder="أخبرنا عن تجربتك مع التطبيق..." 
            className="rounded-2xl min-h-[120px] bg-slate-50 border-amber-100 focus-visible:ring-amber-500 text-right font-medium"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button 
            onClick={handleSubmitReview} 
            disabled={!comment.trim()}
            className="w-full h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 font-black gap-2 text-lg shadow-lg shadow-amber-500/20"
          >
            <SendHorizontal className="h-5 w-5" />
            إرسال التقييم الآن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
