'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { assist } from '@/ai/flows/assistant-flow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await assist(input);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'لم يتمكن المساعد الذكي من الرد. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 bg-primary text-white shadow-[0_10px_40px_-5px_rgba(79,70,229,0.5)] hover:scale-110 transition-all duration-300 p-0 relative group"
          aria-label="مساعد الذكاء الاصطناعي"
        >
          <Bot className="h-7 w-7" />
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping group-hover:block hidden" />
        </Button>
        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full shadow-sm">AI Assistant</span>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md flex flex-col h-[75vh] rounded-[2.5rem] border-0 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-primary text-white space-y-1">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                    <Bot className="h-6 w-6" />
                </div>
                <div>
                    <DialogTitle className="text-xl font-black">المساعد الذكي</DialogTitle>
                    <DialogDescription className="text-white/70 text-xs font-bold">
                      أنا هنا لمساعدتك في إدارة شؤون طلابك.
                    </DialogDescription>
                </div>
            </div>
          </DialogHeader>

          <div className="flex-grow bg-slate-50 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 px-8">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <p className="text-sm font-bold text-slate-400">مرحباً بك! يمكنك سؤالي عن كيفية تسجيل الحضور، إضافة الطلاب، أو عرض التقارير.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                        <Bot size={16} />
                    </div>
                  )}
                   <div
                    className={`max-w-[85%] rounded-2xl p-3 text-sm font-bold shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                        <User size={16} />
                    </div>
                  )}
                </div>
              ))
            )}
             {isLoading && (
              <div className="flex items-start gap-2 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center animate-bounce">
                  <Bot size={16} />
                </div>
                <div className="rounded-2xl p-4 bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs font-bold text-slate-400">جاري التفكير...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="اكتب استفسارك هنا..."
                className="flex-1 h-12 rounded-xl bg-slate-50 border-0 focus-visible:ring-primary font-bold"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !input.trim()}
                className="h-12 w-12 rounded-xl shadow-lg shadow-primary/20"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
