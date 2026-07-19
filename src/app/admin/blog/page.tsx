
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
  ArrowLeft, Bold, Italic, List, AlignLeft, 
  AlignCenter, AlignRight, Link as LinkIcon, UploadCloud,
  Code, PenLine, Undo2, Redo2, Underline, Strikethrough, AlignJustify,
  ListOrdered, Quote, Eraser, Palette, Highlighter, Eye, Calendar,
  Type as TypeIcon, Search, Star
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
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }
    
    setIsSaving(true);
    try {
      let finalCover = formData.coverImage;
      if (!finalCover) {
        const imgMatch = formData.content.match(/<img[^>]+src="([^">]+)"/);
        finalCover = imgMatch ? imgMatch[1] : ''; 
      }

      const submissionData = { ...formData, coverImage: finalCover };

      if (currentId) {
        await updateDoc(doc(firestore, 'articles', currentId), submissionData);
        toast({ title: "تم التعديل بنجاح" });
      } else {
        const snap = await getDocs(query(collection(firestore, 'articles'), orderBy('numericId', 'desc'), limit(1)));
        let nextId = 1000;
        if (!snap.empty) { nextId = (snap.docs[0].data().numericId || 1000) + 1; }
        
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
    if (!firestore || !confirm('هل أنت متأكد من الحذف؟')) return;
    await deleteDoc(doc(firestore, 'articles', id));
    toast({ title: "تم الحذف" });
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'AI', coverImage: '', isPinned: false, allowComments: true, searchDescription: '' });
    setCurrentId(null);
  };

  const execCommand = (command: string, value: string = '') => {
    if (editorMode === 'html') return;
    if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        handleContentChange();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const body = new FormData();
    body.append('image', file);
    try {
        const res = await fetch('https://api.imgbb.com/1/upload?key=d015dd34e005b5dd56d68d2fe147c267', { method: 'POST', body });
        const result = await res.json();
        if (result.success) {
            const url = result.data.url;
            const imgHtml = `<div style="text-align: center; margin: 1.5rem 0;"><img src="${url}" style="max-width: 100%; height: auto; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);" alt="Image" /></div><p><br></p>`;
            execCommand('insertHTML', imgHtml);
            toast({ title: "تم الرفع والإدراج" });
        }
    } catch (err) { toast({ variant: "destructive", title: "خطأ في الرفع" }); } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-20 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">إدارة المحتوى والمقالات</PageHeaderTitle>
          <PageHeaderDescription>أنشئ مقالاتك ونسقها بأسلوب WordPress مع روابط رقمية قصيرة.</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2">
           {!isEditing && <Button onClick={() => setIsEditing(true)} className="rounded-xl font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> مقال جديد</Button>}
           <Button variant="outline" onClick={() => isEditing ? setIsEditing(false) : router.back()} className="rounded-xl h-12 font-bold px-4"><ArrowLeft className="h-5 w-5 ms-2" /> {isEditing ? 'الرجوع للقائمة' : 'رجوع'}</Button>
        </div>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6">
                    <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="عنوان المقال..." className="text-2xl font-black h-auto py-2 border-0 bg-transparent focus-visible:ring-0 px-0" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="bg-white dark:bg-slate-900 p-2 flex flex-wrap items-center gap-0.5 border-b sticky top-0 z-20 shadow-sm overflow-x-auto">
                        <Button variant="ghost" size="sm" onClick={() => setEditorMode(editorMode === 'compose' ? 'html' : 'compose')} className={cn("h-9 px-3 rounded-lg gap-2 text-xs font-bold", editorMode === 'html' ? "bg-primary text-white" : "text-slate-500")}>
                            {editorMode === 'compose' ? <><Code className="h-4 w-4" /> HTML</> : <><PenLine className="h-4 w-4" /> إنشاء</>}
                        </Button>
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        <Button variant="ghost" size="icon" onClick={() => execCommand('undo')}><Undo2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('redo')}><Redo2 className="h-4 w-4" /></Button>
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        <Button variant="ghost" size="icon" onClick={() => execCommand('bold')} className="font-bold"><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('italic')} className="italic"><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('underline')} className="underline"><Underline className="h-4 w-4" /></Button>
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        <Button variant="ghost" size="icon" onClick={() => execCommand('justifyRight')}><AlignRight className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('justifyCenter')}><AlignCenter className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('justifyLeft')}><AlignLeft className="h-4 w-4" /></Button>
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-emerald-500">
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => execCommand('removeFormat')} className="text-slate-400"><Eraser className="h-4 w-4" /></Button>
                    </div>
                    <div className="relative">
                        {editorMode === 'compose' ? (
                            <div ref={editorRef} contentEditable onInput={handleContentChange} className="min-h-[600px] p-8 text-lg leading-relaxed focus:outline-none bg-slate-50/20 prose dark:prose-invert max-w-none text-right" placeholder="ابدأ الكتابة..." />
                        ) : (
                            <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="min-h-[600px] border-0 rounded-none focus-visible:ring-0 p-8 font-mono text-sm leading-relaxed bg-slate-900 text-emerald-400 text-left ltr" />
                        )}
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-0 shadow-lg rounded-[2rem] p-6 space-y-4">
                    <Label className="font-black text-xs text-slate-400">الإعدادات الأساسية</Label>
                    <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {['AI', 'الرقمية', 'معلومات عامة', 'عن المنصة'].map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Textarea value={formData.searchDescription} onChange={(e) => setFormData({...formData, searchDescription: e.target.value})} placeholder="وصف البحث (SEO)..." className="h-24 rounded-xl bg-slate-50" />
                </Card>
                <Card className="border-0 shadow-lg rounded-[2rem] p-6 space-y-4">
                    <Label className="font-black text-xs text-slate-400">خيارات النشر</Label>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <Label className="font-bold cursor-pointer">تثبيت المقال</Label>
                        <Switch checked={formData.isPinned} onCheckedChange={(v) => setFormData({...formData, isPinned: v})} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <Label className="font-bold cursor-pointer">السماح بالتعليقات</Label>
                        <Switch checked={formData.allowComments} onCheckedChange={(v) => setFormData({...formData, allowComments: v})} />
                    </div>
                </Card>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full h-16 rounded-[2rem] font-black text-xl gap-2 shadow-2xl shadow-primary/30">
                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />} حفظ ونشر المقال
            </Button>
          </div>
          <div className="lg:sticky lg:top-24 h-[calc(100vh-150px)] overflow-y-auto pr-2 custom-scrollbar">
             <div className="flex items-center gap-2 mb-4 text-primary font-black"><Eye className="h-5 w-5" /> معاينة حية ثابتة</div>
             <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border-t-8 border-t-primary p-6 md:p-10 space-y-6">
                <h1 className="text-3xl font-black">{formData.title || 'العنوان يظهر هنا...'}</h1>
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg bg-slate-100">
                    <img src={previewCover} className="object-cover w-full h-full" alt="Preview" />
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none text-right leading-relaxed" dangerouslySetInnerHTML={{ __html: formData.content || 'المحتوى سيظهر هنا...' }} />
             </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles?.map(art => (
                <Card key={art.id} className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white group hover:shadow-xl transition-all border-t-4 border-t-primary/10">
                    <div className="aspect-video relative overflow-hidden">
                        <img src={art.coverImage || config.appLogo} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt={art.title} />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <span className="bg-white/90 text-primary backdrop-blur-md px-3 py-1 rounded-xl font-black text-[9px]">{art.category}</span>
                            {art.isPinned && <span className="bg-amber-400 text-white rounded-xl p-1"><Star className="h-3 w-3 fill-current" /></span>}
                        </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <h4 className="font-black text-lg line-clamp-1">{art.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{art.searchDescription}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-dashed">
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="rounded-xl text-blue-500" onClick={() => { setCurrentId(art.id); setFormData(art); setIsEditing(true); }}><Edit className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="rounded-xl text-rose-500" onClick={() => handleDelete(art.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <span className="text-[10px] font-black text-primary"># {art.numericId}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        [contenteditable]:empty:before { content: attr(placeholder); color: #94a3b8; font-style: italic; }
        .ltr { direction: ltr; }
      `}</style>
    </div>
  );
}
