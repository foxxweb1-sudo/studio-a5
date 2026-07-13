
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Edit, Save, Image as ImageIcon, Video, BookOpen, Star, MessageCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Article, ArticleCategory } from '@/lib/definitions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AdminBlogPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'AI' as ArticleCategory,
    coverImage: '',
    isPinned: false,
    allowComments: true,
    searchDescription: '',
  });

  const artsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'articles'), orderBy('createdAt', 'desc')) : null,
  [firestore]);
  const { data: articles, isLoading } = useCollection<Article>(artsQuery);

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  const handleSave = async () => {
    if (!firestore || !formData.title || !formData.content) return;
    setIsSaving(true);
    try {
      if (currentId) {
        await updateDoc(doc(firestore, 'articles', currentId), formData);
        toast({ title: "تم التعديل" });
      } else {
        // حساب الرقم التعريفي التسلسلي
        const snap = await getDocs(collection(firestore, 'articles'));
        const nextId = snap.size + 1;
        
        await addDoc(collection(firestore, 'articles'), {
          ...formData,
          numericId: nextId,
          views: 0,
          createdAt: serverTimestamp(),
        });
        toast({ title: "تم النشر بنجاح" });
      }
      setIsEditing(false);
      resetForm();
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    await deleteDoc(doc(firestore, 'articles', id));
    toast({ title: "تم الحذف" });
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'AI', coverImage: '', isPinned: false, allowComments: true, searchDescription: '' });
    setCurrentId(null);
  };

  const insertMedia = (type: 'image' | 'video') => {
    const url = prompt(`أدخل رابط الـ ${type === 'image' ? 'صورة' : 'فيديو'}:`);
    if (!url) return;
    if (type === 'image') {
      setFormData({ ...formData, content: formData.content + `\n<img src="${url}" class="rounded-2xl shadow-lg my-6 w-full" />\n` });
    } else {
      setFormData({ ...formData, content: formData.content + `\n<iframe src="${url}" class="w-full aspect-video rounded-2xl my-6" frameborder="0"></iframe>\n` });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <PageHeader className="border-0">
          <PageHeaderTitle className="text-3xl font-black">إدارة المدونة</PageHeaderTitle>
          <PageHeaderDescription>أضف وحرر المقالات التقنية للمنصة</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2">
           {!isEditing && (
             <Button onClick={() => setIsEditing(true)} className="rounded-xl font-bold gap-2">
               <Plus className="h-4 w-4" /> مقال جديد
             </Button>
           )}
           <Button variant="outline" onClick={() => router.push('/')} className="rounded-xl"><ArrowLeft className="h-4 w-4" /></Button>
        </div>
      </div>

      {isEditing ? (
        <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>{currentId ? 'تعديل المقال' : 'كتابة مقال جديد'}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label className="font-bold">عنوان المقال</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="اكتب العنوان هنا..." className="h-12 rounded-xl" />
               </div>
               <div className="space-y-2">
                  <Label className="font-bold">القسم</Label>
                  <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI">الذكاء الاصطناعي AI</SelectItem>
                      <SelectItem value="الرقمية">الحياة الرقمية</SelectItem>
                      <SelectItem value="معلومات عامة">معلومات عامة</SelectItem>
                      <SelectItem value="عن المنصة">عن المنصة</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="space-y-2">
               <Label className="font-bold">صورة الغلاف (رابط)</Label>
               <Input value={formData.coverImage} onChange={(e) => setFormData({...formData, coverImage: e.target.value})} placeholder="https://..." className="h-12 rounded-xl font-mono text-xs" />
            </div>

            <div className="space-y-2">
               <div className="flex items-center justify-between">
                  <Label className="font-bold">محتوى المقال (يدعم HTML)</Label>
                  <div className="flex gap-2">
                     <Button size="sm" variant="outline" onClick={() => insertMedia('image')}><ImageIcon className="h-4 w-4 ms-1" /> صورة</Button>
                     <Button size="sm" variant="outline" onClick={() => insertMedia('video')}><Video className="h-4 w-4 ms-1" /> فيديو</Button>
                  </div>
               </div>
               <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="اكتب نص المقال..." className="min-h-[400px] rounded-2xl bg-slate-50 font-medium" />
            </div>

            <div className="space-y-2">
               <Label className="font-bold">وصف محركات البحث (SEO)</Label>
               <Textarea value={formData.searchDescription} onChange={(e) => setFormData({...formData, searchDescription: e.target.value})} placeholder="وصف قصير للمقال..." className="rounded-xl h-20" />
            </div>

            <div className="flex flex-wrap gap-8 p-6 bg-slate-50 rounded-3xl">
               <div className="flex items-center gap-3">
                  <Switch checked={formData.isPinned} onCheckedChange={(v) => setFormData({...formData, isPinned: v})} />
                  <Label className="font-bold">تثبيت المقال (Pin)</Label>
               </div>
               <div className="flex items-center gap-3">
                  <Switch checked={formData.allowComments} onCheckedChange={(v) => setFormData({...formData, allowComments: v})} />
                  <Label className="font-bold">السماح بالتعليقات</Label>
               </div>
            </div>

            <div className="flex gap-4">
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-14 rounded-2xl font-black text-lg gap-2">
                 {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} حفظ ونشر
               </Button>
               <Button variant="ghost" onClick={() => { setIsEditing(false); resetForm(); }} className="h-14 rounded-2xl px-10">إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           {articles?.map((art) => (
             <Card key={art.id} className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all">
               <CardContent className="p-6 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden relative">
                        {art.coverImage ? <img src={art.coverImage} className="object-cover w-full h-full" /> : <BookOpen className="w-8 h-8 m-4 text-slate-300" />}
                     </div>
                     <div>
                        <h4 className="font-black text-lg">{art.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold mt-1">
                           <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{art.category}</span>
                           <span>ID: {art.numericId}</span>
                           <span className="flex items-center gap-1"><Star className={`h-3 w-3 ${art.isPinned ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} /> {art.isPinned ? 'مثبت' : 'عادي'}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="icon" className="rounded-xl text-blue-500" onClick={() => { setCurrentId(art.id); setFormData(art); setIsEditing(true); }}>
                        <Edit className="h-5 w-5" />
                     </Button>
                     <Button variant="ghost" size="icon" className="rounded-xl text-rose-500" onClick={() => handleDelete(art.id)}>
                        <Trash2 className="h-5 w-5" />
                     </Button>
                  </div>
               </CardContent>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
}
