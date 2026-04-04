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
import { Bot, Send, Loader2, User } from 'lucide-react';
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
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="rounded-full h-10 w-10 border border-primary/30 text-primary shadow-sm hover:bg-primary/10 p-0"
        aria-label="مساعد الذكاء الاصطناعي"
      >
        <Bot className="h-5 w-5" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md flex flex-col h-[70vh]">
          <DialogHeader>
            <DialogTitle>مساعد الذكاء الاصطناعي</DialogTitle>
            <DialogDescription>
              أنا هنا لمساعدتك. كيف يمكنني خدمتك اليوم؟
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow bg-muted rounded-md p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground p-4">لا توجد رسائل بعد. ابدأ محادثتك!</p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Bot size={20} />
                    </div>
                  )}
                   <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted-foreground text-muted flex items-center justify-center">
                        <User size={20} />
                    </div>
                  )}
                </div>
              ))
            )}
             {isLoading && (
              <div className="flex items-start gap-2 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div className="rounded-lg p-3 bg-background flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="message"
                placeholder="اكتب رسالتك هنا..."
                className="flex-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" onClick={handleSendMessage} disabled={isLoading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">إرسال</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
