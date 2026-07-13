'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
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
  ListOrdered, Quote, Eraser, Type, Palette, Highlighter, Eye, Layout, Calendar, Share2,
  ChevronDown, Type as TypeIcon, Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Article, ArticleCategory } from '@/lib/definitions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppConfig } from '@/hooks/use-app-config';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const previewCover = useMemo(() => {
    if (formData.coverImage) return formData.coverImage;
    const imgMatch = formData.content.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : config.appLogo;
  }, [formData.coverImage, formData.content, config.appLogo]);

  useEffect(() => {
    if (isEditing && editorMode === 'compose' && editorRef.current && editorRef.current.innerHTML !== formData.content) {
      editorRef.current.innerHTML = formData.content;
    }
  }, [isEditing, editorMode]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, content: html }));
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
        // توليد رقم تعريفي تسلسلي للمقال (Numeric ID) للروابط القصيرة
        const snap = await getDocs(query(collection(firestore, 'articles'), orderBy('numericId', 'desc'), limit(1)));
        let nextId = 1000;
        if (!snap.empty) {
            nextId = (snap.docs[0].data().numericId || 1000) + 1;
        }
        
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
    if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        handleContentChange();
    }
  };

  const insertLink = () => {
    const url = prompt("أدخل الرابط:");
    if (url) {
        // إذا لم يكن هناك نص محدد، نستخدم الرابط كعنوان للنص
        const selection = window.getSelection();
        if (selection && selection.toString().length === 0) {
            execCommand('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
        } else {
            execCommand('createLink', url);
        }
    }
  };

  const insertImage = (urlOverride?: string) => {
    const url = urlOverride || prompt("أدخل رابط الصورة:");
    if (url) {
        const imgHtml = `<div style="text-align: center; margin: 1.5rem 0;"><img src="${url}" style="max-width: 100%; height: auto; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 4px solid white;" alt="Article Image" /></div><p><br></p>`;
        if (editorMode === 'compose') {
            execCommand('insertHTML', imgHtml);
        } else {
            setFormData(prev => ({ ...prev, content: prev.content + imgHtml }));
        }
    }
  };

  const insertVideo = () => {
    let url = prompt("أدخل رابط الفيديو (YouTube مثلاً):");
    if (url) {
        // تحويل روابط يوتيوب العادية إلى Embed
        if (url.includes('youtube.com/watch?v=')) {
            url = url.replace('watch?v=', 'embed/');
        } else if (url.includes('youtu.be/')) {
            url = url.replace('youtu.be/', 'youtube.com/embed/');
        }
        
        const videoHtml = `<div style="position: relative; padding-bottom: 56.25%; height: 0; margin: 1.5rem 0; border-radius: 1.5rem; overflow: hidden; shadow: 0 10px 15px -3px rgba(0,0,0,0.1);"><iframe src="${url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
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

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [articles, searchTerm]);

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-20 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">إدارة المحتوى</PageHeaderTitle>
          <PageHeaderDescription>أنشئ مقالاتك ونسقها بأسلوب احترافي مع روابط رقمية قصيرة.</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2">
           {!isEditing && (
             <Button onClick={() => setIsEditing(true)} className="rounded-xl font-black gap-2 h-12 px-6 bg-primary shadow-lg shadow-primary/20">
               <Plus className="h-5 w-5" /> مقال جديد
             </Button>
           )}
           <Button variant="outline" onClick={() => isEditing ? setIsEditing(false) : router.push('/')} className="rounded-xl h-12 font-bold px-4">
              <ArrowLeft className="h-5 w-5 ms-2" /> {isEditing ? 'الرجوع للقائمة' : 'الرئيسية'}
           </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6 md:p-8">
                    <Input 
                        value={formData.title} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        placeholder="عنوان المقال هنا..." 
                        className="text-2xl font-black h-auto py-2 border-0 bg-transparent focus-visible:ring-0 px-0 placeholder:opacity-30"
                    />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="bg-white dark:bg-slate-900 p-2 flex flex-wrap items-center gap-0.5 border-b sticky top-0 z-20 shadow-sm overflow-x-auto custom-scrollbar">
                        <Button variant="ghost" size="sm" onClick={() => setEditorMode(editorMode === 'compose' ? 'html' : 'compose')} className={cn("h-9 px-3 rounded-lg gap-2 text-xs font-bold", editorMode === 'html' ? "bg-primary text-white" : "text-slate-500")}>
                            {editorMode === 'compose' ? <><Code className="h-4 w-4" /> HTML</> : <><PenLine className="h-4 w-4" /> إنشاء</>}
                        </Button>
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        
                        <Button variant="ghost" size="icon" onClick={() => execCommand('undo')} title="تراجع" className="h-9 w-9 text-slate-500"><Undo2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('redo')} title="إعادة" className="h-9 w-9 text-slate-500"><Redo2 className="h-4 w-4" /></Button>
                        
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9"><TypeIcon className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="rounded-xl p-1">
                                <DropdownMenuItem onClick={() => execCommand('formatBlock', 'H1')} className="font-black text-xl">عنوان رئيسي 1</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => execCommand('formatBlock', 'H2')} className="font-black text-lg">عنوان فرعي 2</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => execCommand('formatBlock', 'H3')} className="font-bold">عنوان 3</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => execCommand('formatBlock', 'P')} className="font-medium">نص عادي</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="ghost" size="icon" onClick={() => execCommand('bold')} title="عريض" className="h-9 w-9 font-bold"><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('italic')} title="مائل" className="h-9 w-9 italic"><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('underline')} title="تسطير" className="h-9 w-9 underline"><Underline className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('strikeThrough')} title="شطب" className="h-9 w-9 line-through"><Strikethrough className="h-4 w-4" /></Button>
                        
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500"><Palette className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="grid grid-cols-5 gap-1 p-2 w-48">
                                {['#000000', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'].map(color => (
                                    <button key={color} onClick={() => execCommand('foreColor', color)} className="h-6 w-6 rounded-md" style={{ backgroundColor: color }} />
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-500"><Highlighter className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="grid grid-cols-5 gap-1 p-2 w-48">
                                {['#ffffff', '#fef9c3', '#fef3c7', '#dcfce7', '#d1fae5', '#ecfeff', '#e0f2fe', '#eef2ff', '#f5f3ff', '#fdf2f8'].map(color => (
                                    <button key={color} onClick={() => execCommand('hiliteColor', color)} className="h-6 w-6 rounded-md border" style={{ backgroundColor: color }} />
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        <Button variant="ghost" size="icon" onClick={() => execCommand('justifyRight')} title="يمين"><AlignRight className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('justifyCenter')} title="وسط"><AlignCenter className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('justifyLeft')} title="يسار"><AlignLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('justifyFull')} title="ضبط"><AlignJustify className="h-4 w-4" /></Button>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        <Button variant="ghost" size="icon" onClick={() => execCommand('insertUnorderedList')} title="قائمة نقطية"><List className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('insertOrderedList')} title="قائمة رقمية"><ListOrdered className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('formatBlock', 'BLOCKQUOTE')} title="اقتباس"><Quote className="h-4 w-4" /></Button>
                        
                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        <Button variant="ghost" size="icon" onClick={insertLink} title="رابط" className="text-blue-500"><LinkIcon className="h-4 w-4" /></Button>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading} title="رفع صورة" className="text-emerald-500">
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={insertVideo} title="إدراج فيديو" className="text-rose-600"><Video className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('removeFormat')} title="مسح التنسيق" className="text-slate-400"><Eraser className="h-4 w-4" /></Button>
                    </div>

                    <div className="relative">
                        {editorMode === 'compose' ? (
                            <div 
                                ref={editorRef}
                                contentEditable
                                onInput={handleContentChange}
                                onBlur={handleContentChange}
                                className="min-h-[600px] p-8 text-lg leading-relaxed focus:outline-none dark:text-slate-100 bg-slate-50/20 prose prose-slate dark:prose-invert max-w-none text-right"
                                placeholder="ابدأ الكتابة هنا..."
                            />
                        ) : (
                            <Textarea 
                                value={formData.content} 
                                onChange={(e) => setFormData({...formData, content: e.target.value})} 
                                className="min-h-[600px] border-0 rounded-none focus-visible:ring-0 p-8 font-mono text-sm leading-relaxed bg-slate-900 text-emerald-400 text-left ltr"
                                placeholder="كود HTML..."
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-0 shadow-lg rounded-[2rem] p-6 space-y-4">
                    <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">الإعدادات الأساسية</Label>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-[10px]">القسم</Label>
                            <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-0 font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="AI" className="font-bold">الذكاء الاصطناعي AI</SelectItem>
                                    <SelectItem value="الرقمية" className="font-bold">الحياة الرقمية</SelectItem>
                                    <SelectItem value="معلومات عامة" className="font-bold">معلومات عامة</SelectItem>
                                    <SelectItem value="عن المنصة" className="font-bold">عن المنصة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-[10px]">وصف البحث (SEO)</Label>
                            <Textarea value={formData.searchDescription} onChange={(e) => setFormData({...formData, searchDescription: e.target.value})} placeholder="وصف مختصر يظهر في محركات البحث..." className="h-20 rounded-xl bg-slate-50 border-0 text-xs font-bold" />
                        </div>
                    </div>
                </Card>

                <Card className="border-0 shadow-lg rounded-[2rem] p-6 space-y-4">
                    <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">خيارات النشر</Label>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                            <Label htmlFor="pin-switch" className="font-bold text-xs cursor-pointer">تثبيت المقال</Label>
                            <Switch id="pin-switch" checked={formData.isPinned} onCheckedChange={(v) => setFormData({...formData, isPinned: v})} />
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                            <Label htmlFor="comments-switch" className="font-bold text-xs cursor-pointer">السماح بالتعليقات</Label>
                            <Switch id="comments-switch" checked={formData.allowComments} onCheckedChange={(v) => setFormData({...formData, allowComments: v})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-[10px]">رابط الغلاف (اختياري)</Label>
                            <Input value={formData.coverImage} onChange={(e) => setFormData({...formData, coverImage: e.target.value})} placeholder="رابط خارجي للغلاف..." className="h-10 rounded-xl bg-slate-50 border-0 text-xs font-mono" />
                        </div>
                    </div>
                </Card>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full h-16 rounded-[2rem] font-black text-xl gap-2 shadow-2xl shadow-primary/30">
                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />} حفظ ونشر المقال الآن
            </Button>
          </div>

          <div className="lg:sticky lg:top-24 space-y-4 h-full overflow-hidden">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-primary">
                    <Eye className="h-5 w-5" />
                    <span className="font-black text-sm uppercase tracking-widest">المعاينه الحية</span>
                </div>
                <Badge variant="outline" className="rounded-full bg-white font-bold text-[9px] uppercase border-primary/20">Distinctive Layout</Badge>
             </div>
             
             <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border-t-8 border-t-primary">
                    <div className="p-6 md:p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-primary text-white px-3 py-1 rounded-full text-[9px] font-black">{formData.category}</span>
                                <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold"><Calendar className="h-3.5 w-3.5" /> {format(new Date(), 'd MMMM yyyy', { locale: ar })}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black leading-tight text-slate-800 dark:text-white text-right">
                                {formData.title || 'عنوان المقال المثير سيظهر هنا...'}
                            </h1>
                            {formData.searchDescription && <p className="text-sm font-bold text-slate-400 italic pr-4 border-r-4 border-slate-200">{formData.searchDescription}</p>}
                        </div>

                        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-lg border-4 border-slate-50 dark:border-slate-800">
                            <img 
                                src={previewCover} 
                                alt="Preview" 
                                className="object-cover w-full h-full" 
                            />
                        </div>

                        <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] p-6 md:p-8 min-h-[300px]">
                            <div 
                                className="prose prose-slate dark:prose-invert max-w-none text-right" 
                                dangerouslySetInnerHTML={{ __html: formData.content || '<p style="color: #94a3b8; font-style: italic; text-align: center;">ابدأ بالكتابة في المحرر لرؤية المحتوى هنا...</p>' }} 
                            />
                        </div>
                    </div>
                </Card>
             </div>
          </div>

        </div>
      ) : (
        <div className="space-y-6">
           <div className="relative w-full max-w-md mx-auto sm:mx-0">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <Input 
                placeholder="ابحث عن مقال..." 
                className="pr-10 rounded-2xl h-12 bg-white dark:bg-slate-900 shadow-sm border-slate-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
               />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
              {filteredArticles?.map((art) => (
                <Card key={art.id} className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 group hover:shadow-xl transition-all border-t-4 border-t-primary/10">
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                        <img 
                            src={art.coverImage || config.appLogo} 
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                            alt={art.title} 
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <span className="bg-white/90 text-primary backdrop-blur-md px-2.5 py-0.5 rounded-lg font-black text-[9px]">{art.category}</span>
                            {art.isPinned && <span className="bg-amber-400 text-white rounded-lg p-1 shadow-lg"><Star className="h-3 w-3 fill-current" /></span>}
                        </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-black text-lg leading-tight line-clamp-1 text-right">{art.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold line-clamp-2 min-h-[1.5rem] leading-relaxed">{art.searchDescription || 'لا يوجد وصف تعريفي للمقال.'}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-dashed">
                        <div className="flex gap-1.5">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-blue-500 border-blue-50 hover:bg-blue-50" onClick={() => { setCurrentId(art.id); setFormData(art); setIsEditing(true); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-rose-500 border-rose-50 hover:bg-rose-50" onClick={() => handleDelete(art.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-primary" onClick={() => window.open(`/art/${art.numericId}`, '_blank')}>
                                <Eye className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-primary"># {art.numericId}</span>
                            <span className="text-[8px] text-slate-300 font-bold uppercase">{art.views} views</span>
                        </div>
                      </div>
                  </CardContent>
                </Card>
              ))}
              {filteredArticles.length === 0 && !isLoading && (
                <div className="col-span-full py-20 text-center text-slate-400 font-black bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed">
                    لا توجد مقالات تطابق بحثك.
                </div>
              )}
           </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        [contenteditable]:empty:before {
            content: attr(placeholder);
            color: #94a3b8;
            font-style: italic;
        }
        .prose img {
            max-width: 100%;
            height: auto;
            border-radius: 1.5rem;
            margin: 1.5rem auto;
            display: block;
        }
        .ltr { direction: ltr; }
      `}</style>
    </div>
  );
}