
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
  AlignCenter, AlignRight, Link as LinkIcon, UploadCloud, Globe,
  Code, PenLine, Undo2, Redo2, Underline, Strikethrough, AlignJustify,
  ListOrdered, Quote, Eraser, Type, Palette, Highlighter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Article, ArticleCategory } from '@/lib/definitions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppConfig } from '@/hooks/use-app-config';
import { cn } from '@/lib/utils';

export default function AdminBlogPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { config } = useAppConfig();

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editorMode, setEditorMode] = useState<'compose' | 'html'>('compose');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

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

  // تحديث المحتوى المرئي عند تغيير formData.content (فقط في وضع الإنشاء)
  useEffect(() => {
    if (isEditing && editorMode === 'compose' && editorRef.current && editorRef.current.innerHTML !== formData.content) {
      editorRef.current.innerHTML = formData.content;
    }
  }, [isEditing, editorMode, formData.content]);

  const handleContentChange = () => {
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, content: editorRef.current!.innerHTML }));
    }
  };

  const handleSave = async () => {
    if (!firestore || !formData.title || !formData.content) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى كتابة العنوان والمحتوى على الأقل." });
      return;
    }
    
    setIsSaving(true);
    try {
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
    setEditorMode('compose');
  };

  const execCommand = (command: string, value: string = '') => {
    if (editorMode === 'html') {
        toast({ title: "تنبيه", description: "يرجى التبديل لوضع الإنشاء لاستخدام الأدوات." });
        return;
    }
    document.execCommand(command, false, value);
    handleContentChange();
    if (editorRef.current) editorRef.current.focus();
  };

  const insertLink = () => {
    const url = prompt("أدخل الرابط:");
    if (url) execCommand('createLink', url);
  };

  const insertImage = (urlOverride?: string) => {
    const url = urlOverride || prompt("أدخل رابط الصورة:");
    if (url) {
        const imgHtml = `<img src="${url}" style="max-width: 100%; border-radius: 1rem; margin: 1rem 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />`;
        if (editorMode === 'compose') {
            execCommand('insertHTML', imgHtml);
        } else {
            setFormData(prev => ({ ...prev, content: prev.content + imgHtml }));
        }
    }
  };

  const insertVideo = () => {
    const url = prompt("أدخل رابط الفيديو (YouTube/Embed):");
    if (url) {
        const videoHtml = `<div style="position: relative; padding-bottom: 56.25%; height: 0; margin: 1rem 0;"><iframe src="${url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 1rem;" frameborder="0" allowfullscreen></iframe></div>`;
        if (editorMode === 'compose') {
            execCommand('insertHTML', videoHtml);
        } else {
            setFormData(prev => ({ ...prev, content: prev.content + videoHtml }));
        }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('image', file);

    try {
        const res = await fetch('https://api.imgbb.com/1/upload?key=d015dd34e005b5dd56d68d2fe147c267', {
            method: 'POST',
            body
        });
        const result = await res.json();
        if (result.success) {
            const url = result.data.url;
            insertImage(url);
            toast({ title: "تم الرفع بنجاح" });
        } else {
            toast({ variant: "destructive", title: "فشل الرفع" });
        }
    } catch (err) {
        toast({ variant: "destructive", title: "خطأ في الاتصال بخادم الرفع" });
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6 md:p-8">
                    <Input 
                        value={formData.title} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        placeholder="عنوان المقال المثير..." 
                        className="text-2xl md:text-4xl font-black h-auto py-4 border-0 bg-transparent focus-visible:ring-0 px-0 placeholder:opacity-30"
                    />
                </CardHeader>
                <CardContent className="p-0">
                    {/* شريط أدوات التحرير المطور */}
                    <div className="bg-white dark:bg-slate-900 p-2 flex flex-wrap items-center gap-0.5 border-b sticky top-0 z-20 shadow-sm overflow-x-auto">
                        
                        <div className="flex items-center gap-1 border-l pl-2 ml-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditorMode(editorMode === 'compose' ? 'html' : 'compose')} className={cn("h-9 px-3 rounded-lg gap-2 text-xs font-bold", editorMode === 'html' ? "bg-primary text-white" : "text-slate-500")}>
                                {editorMode === 'compose' ? <><Code className="h-4 w-4" /> HTML</> : <><PenLine className="h-4 w-4" /> إنشاء</>}
                            </Button>
                        </div>

                        <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
                            <Button variant="ghost" size="icon" onClick={() => execCommand('undo')} className="h-9 w-9 text-slate-500"><Undo2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('redo')} className="h-9 w-9 text-slate-500"><Redo2 className="h-4 w-4" /></Button>
                        </div>

                        <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
                            <Button variant="ghost" size="icon" onClick={() => execCommand('bold')} className="h-9 w-9 text-slate-700 font-bold"><Bold className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('italic')} className="h-9 w-9 text-slate-700 italic"><Italic className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('underline')} className="h-9 w-9 text-slate-700 underline"><Underline className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('strikeThrough')} className="h-9 w-9 text-slate-700 line-through"><Strikethrough className="h-4 w-4" /></Button>
                        </div>

                        <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
                            <Button variant="ghost" size="icon" onClick={() => {
                                const color = prompt("أدخل كود اللون (مثل #ff0000):");
                                if (color) execCommand('foreColor', color);
                            }} className="h-9 w-9 text-rose-500"><Palette className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                                const color = prompt("أدخل لون التظليل (مثل yellow):");
                                if (color) execCommand('hiliteColor', color);
                            }} className="h-9 w-9 text-amber-500"><Highlighter className="h-4 w-4" /></Button>
                        </div>

                        <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
                            <Button variant="ghost" size="icon" onClick={() => insertLink()} className="h-9 w-9 text-blue-500"><LinkIcon className="h-4 w-4" /></Button>
                            
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => fileInputRef.current?.click()} 
                                disabled={isUploading}
                                className="h-9 w-9 text-emerald-500"
                            >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            </Button>
                            
                            <Button variant="ghost" size="icon" onClick={() => insertVideo()} className="h-9 w-9 text-rose-600"><Video className="h-4 w-4" /></Button>
                        </div>

                        <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
                            <Button variant="ghost" size="icon" onClick={() => execCommand('justifyRight')} className="h-9 w-9"><AlignRight className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('justifyCenter')} className="h-9 w-9"><AlignCenter className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('justifyLeft')} className="h-9 w-9"><AlignLeft className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('justifyFull')} className="h-9 w-9"><AlignJustify className="h-4 w-4" /></Button>
                        </div>

                        <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" onClick={() => execCommand('insertUnorderedList')} className="h-9 w-9"><List className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('insertOrderedList')} className="h-9 w-9"><ListOrdered className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('formatBlock', 'blockquote')} className="h-9 w-9"><Quote className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => execCommand('removeFormat')} className="h-9 w-9 text-rose-400"><Eraser className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    <div className="relative">
                        {editorMode === 'compose' ? (
                            <div 
                                ref={editorRef}
                                contentEditable
                                onInput={handleContentChange}
                                className="min-h-[600px] p-8 text-lg leading-relaxed focus:outline-none dark:text-slate-100 bg-slate-50/20"
                                placeholder="ابدأ الكتابة هنا..."
                            />
                        ) : (
                            <Textarea 
                                value={formData.content} 
                                onChange={(e) => setFormData({...formData, content: e.target.value})} 
                                className="min-h-[600px] border-0 rounded-none focus-visible:ring-0 p-8 font-mono text-sm leading-relaxed bg-slate-900 text-emerald-400"
                                placeholder="اكتب كود HTML هنا..."
                            />
                        )}
                    </div>
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
                                placeholder="اتركها فارغة لاستخدام أول صورة" 
                                className="h-11 rounded-xl bg-slate-50 font-mono text-[10px] border-slate-100" 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-dashed">
                        <div className="flex items-center justify-between">
                            <Label className="font-bold text-xs cursor-pointer" htmlFor="pin-switch">تثبيت المقال (Max 5)</Label>
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
                        <Button variant="ghost" onClick={() => { setIsEditing(false); resetForm(); }} className="h-12 rounded-xl text-slate-400 font-bold">إلغاء</Button>
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
                        <span className="bg-white/90 text-primary backdrop-blur-md px-2.5 py-0.5 rounded-lg font-black text-[9px]">{art.category}</span>
                        {art.isPinned && <span className="bg-amber-400 text-white rounded-lg p-1"><Star className="h-3 w-3 fill-current" /></span>}
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
        </div>
      )}
    </div>
  );
}
