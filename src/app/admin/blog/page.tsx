
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Plus, Trash2, Edit, Save, Image as ImageIcon, Video, 
  BookOpen, Star, ArrowLeft, Bold, Italic, List, AlignLeft, 
  AlignCenter, AlignRight, Link as LinkIcon, UploadCloud, Globe 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Article, ArticleCategory } from '@/lib/definitions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppConfig } from '@/hooks/use-app-config';

export default function AdminBlogPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { config } = useAppConfig();

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
    if (!firestore || !formData.title || !formData.content) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى كتابة العنوان والمحتوى على الأقل." });
      return;
    }
    
    setIsSaving(true);
    try {
      // منطق الصورة الافتراضية الذكي
      let finalCover = formData.coverImage;
      if (!finalCover) {
        const imgMatch = formData.content.match(/<img[^>]+src="([^">]+)"/);
        finalCover = imgMatch ? imgMatch[1] : ''; 
      }

      const submissionData = {
        ...formData,
        coverImage: finalCover,
      };

      if (currentId) {
        await updateDoc(doc(firestore, 'articles', currentId), submissionData);
        toast({ title: "تم التعديل بنجاح" });
      } else {
        const snap = await getDocs(collection(firestore, 'articles'));
        const nextId = snap.size + 1;
        
        await addDoc(collection(firestore, 'articles'), {
          ...submissionData,
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
    if (!firestore || !confirm('هل أنت متأكد من حذف هذا المقال نهائياً؟')) return;
    await deleteDoc(doc(firestore, 'articles', id));
    toast({ title: "تم الحذف" });
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'AI', coverImage: '', isPinned: false, allowComments: true, searchDescription: '' });
    setCurrentId(null);
  };

  const insertTag = (tag: string, endTag: string = '') => {
    const textarea = document.getElementById('article-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    let newContent = '';
    if (tag === 'img' || tag === 'iframe') {
        const url = prompt(`أدخل رابط ${tag === 'img' ? 'الصورة' : 'الفيديو'}:`);
        if (!url) return;
        newContent = tag === 'img' 
            ? `${before}<img src="${url}" class="rounded-2xl shadow-lg my-6 w-full" />${after}`
            : `${before}<iframe src="${url}" class="w-full aspect-video rounded-2xl my-6" frameborder="0"></iframe>${after}`;
    } else {
        newContent = `${before}${tag}${selectedText}${endTag}${after}`;
    }

    setFormData({ ...formData, content: newContent });
    textarea.focus();
  };

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">إدارة المحتوى</PageHeaderTitle>
          <PageHeaderDescription>أنشئ مقالاتك ونسقها بأسلوب احترافي.</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2">
           {!isEditing && (
             <Button onClick={() => setIsEditing(true)} className="rounded-xl font-black gap-2 h-12 px-6 bg-primary shadow-lg shadow-primary/20">
               <Plus className="h-5 w-5" /> مقال جديد
             </Button>
           )}
           <Button variant="outline" onClick={() => router.push('/')} className="rounded-xl h-12 w-12 p-0"><ArrowLeft className="h-5 w-5" /></Button>
        </div>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="xl:col-span-3 space-y-6">
            <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-8">
                    <div className="space-y-4">
                        <Input 
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            placeholder="عنوان المقال المثير..." 
                            className="text-2xl md:text-4xl font-black h-auto py-4 border-0 bg-transparent focus-visible:ring-0 px-0 placeholder:opacity-30"
                        />
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> الرابط: {currentId ? `/art/${formData.numericId}` : '/art/[ID]'}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* شريط أدوات التحرير */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 flex flex-wrap gap-1 border-b sticky top-0 z-20">
                        <Button variant="ghost" size="sm" onClick={() => insertTag('<b>', '</b>')} className="h-9 w-9 p-0 rounded-lg" title="عريض"><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => insertTag('<i>', '</i>')} className="h-9 w-9 p-0 rounded-lg" title="مائل"><Italic className="h-4 w-4" /></Button>
                        <div className="w-[1px] h-6 bg-slate-300 mx-1 my-auto" />
                        <Button variant="ghost" size="sm" onClick={() => insertTag('<div class="text-right">', '</div>')} className="h-9 w-9 p-0 rounded-lg" title="محاذاة يمين"><AlignRight className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => insertTag('<div class="text-center">', '</div>')} className="h-9 w-9 p-0 rounded-lg" title="توسيط"><AlignCenter className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => insertTag('<div class="text-left">', '</div>')} className="h-9 w-9 p-0 rounded-lg" title="محاذاة يسار"><AlignLeft className="h-4 w-4" /></Button>
                        <div className="w-[1px] h-6 bg-slate-300 mx-1 my-auto" />
                        <Button variant="ghost" size="sm" onClick={() => insertTag('<ul class="list-disc list-inside"><li>', '</li></ul>')} className="h-9 w-9 p-0 rounded-lg" title="قائمة"><List className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => insertTag('<a href="#" class="text-primary underline">', '</a>')} className="h-9 w-9 p-0 rounded-lg" title="رابط"><LinkIcon className="h-4 w-4" /></Button>
                        <div className="w-[1px] h-6 bg-slate-300 mx-1 my-auto" />
                        <Button variant="secondary" size="sm" onClick={() => insertTag('img')} className="h-9 px-3 rounded-lg gap-2 text-[10px] font-bold"><ImageIcon className="h-3.5 w-3.5" /> إدراج صورة</Button>
                        <Button variant="secondary" size="sm" onClick={() => insertTag('iframe')} className="h-9 px-3 rounded-lg gap-2 text-[10px] font-bold"><Video className="h-3.5 w-3.5" /> فيديو</Button>
                        <Button variant="outline" asChild size="sm" className="h-9 px-3 rounded-lg gap-2 text-[10px] font-black border-primary/20 text-primary hover:bg-primary/10">
                            <a href="https://top4top.io/" target="_blank" rel="noopener noreferrer">
                                <UploadCloud className="h-3.5 w-3.5" /> رفع صور (Top4Top)
                            </a>
                        </Button>
                    </div>
                    <Textarea 
                        id="article-editor"
                        value={formData.content} 
                        onChange={(e) => setFormData({...formData, content: e.target.value})} 
                        placeholder="ابدأ بكتابة قصة نجاحك هنا... (يدعم HTML)" 
                        className="min-h-[600px] border-0 rounded-none focus-visible:ring-0 p-8 text-lg leading-relaxed font-medium bg-slate-50/30" 
                    />
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-lg">إعدادات محركات البحث (SEO)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        value={formData.searchDescription} 
                        onChange={(e) => setFormData({...formData, searchDescription: e.target.value})} 
                        placeholder="اكتب وصفاً مختصراً يظهر في جوجل..." 
                        className="rounded-2xl h-24 bg-slate-50 border-slate-100" 
                    />
                </CardContent>
            </Card>
          </div>

          <aside className="xl:col-span-1 space-y-6">
             <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">نشر المقال</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs">القسم</Label>
                        <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                            <SelectTrigger className="h-11 rounded-xl bg-slate-50 font-bold border-slate-100"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="AI" className="font-bold">الذكاء الاصطناعي AI</SelectItem>
                                <SelectItem value="الرقمية" className="font-bold">الحياة الرقمية</SelectItem>
                                <SelectItem value="معلومات عامة" className="font-bold">معلومات عامة</SelectItem>
                                <SelectItem value="عن المنصة" className="font-bold">عن المنصة</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold text-xs">رابط صورة الغلاف</Label>
                        <div className="flex flex-col gap-2">
                            <Input 
                                value={formData.coverImage} 
                                onChange={(e) => setFormData({...formData, coverImage: e.target.value})} 
                                placeholder="اتركها فارغة لاستخدام أول صورة بالمقال" 
                                className="h-11 rounded-xl bg-slate-50 font-mono text-[10px] border-slate-100" 
                            />
                            {formData.coverImage && (
                                <div className="relative aspect-video rounded-2xl overflow-hidden border">
                                    <img src={formData.coverImage} className="object-cover w-full h-full" alt="Cover Preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-dashed">
                        <div className="flex items-center justify-between">
                            <Label className="font-bold text-xs cursor-pointer" htmlFor="pin-switch">تثبيت في القسم (Pin)</Label>
                            <Switch id="pin-switch" checked={formData.isPinned} onCheckedChange={(v) => setFormData({...formData, isPinned: v})} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="font-bold text-xs cursor-pointer" htmlFor="comments-switch">السماح بالتعليقات</Label>
                            <Switch id="comments-switch" checked={formData.allowComments} onCheckedChange={(v) => setFormData({...formData, allowComments: v})} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                        <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20">
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} حفظ ونشر المقال
                        </Button>
                        <Button variant="ghost" onClick={() => { setIsEditing(false); resetForm(); }} className="h-12 rounded-xl text-slate-400 font-bold">إلغاء المسودة</Button>
                    </div>
                </CardContent>
             </Card>
          </aside>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
           {articles?.map((art) => (
             <Card key={art.id} className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 group hover:shadow-xl transition-all border-t-4 border-t-primary/10">
               <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img 
                        src={art.coverImage || config.appLogo} 
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                        alt={art.title} 
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Badge className="bg-white/90 text-primary backdrop-blur-md border-0 rounded-lg font-black text-[9px]">{art.category}</Badge>
                        {art.isPinned && <Badge className="bg-amber-400 text-white rounded-lg p-1 border-0"><Star className="h-3 w-3 fill-current" /></Badge>}
                    </div>
               </div>
               <CardContent className="p-6 space-y-4">
                  <h4 className="font-black text-lg leading-tight line-clamp-2 min-h-[3.5rem]">{art.title}</h4>
                  <div className="flex items-center justify-between pt-4 border-t border-dashed">
                     <div className="flex gap-1.5">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-blue-500 border-blue-50 hover:bg-blue-50" onClick={() => { setCurrentId(art.id); setFormData(art); setIsEditing(true); }}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-rose-500 border-rose-50 hover:bg-rose-50" onClick={() => handleDelete(art.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                     <span className="text-[10px] font-bold text-slate-400">ID: {art.numericId}</span>
                  </div>
               </CardContent>
             </Card>
           ))}
           {(!articles || articles.length === 0) && !isLoading && (
               <div className="col-span-full py-32 text-center space-y-4 bg-slate-50 rounded-[3rem] border-2 border-dashed">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                       <BookOpen className="h-8 w-8 text-slate-200" />
                   </div>
                   <p className="font-black text-slate-300">لا توجد مقالات منشورة حالياً.</p>
               </div>
           )}
        </div>
      )}
    </div>
  );
}
