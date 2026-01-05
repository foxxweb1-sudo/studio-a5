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
import { Bot, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = () => {
    // Placeholder for AI interaction logic
    toast({
      title: 'قريباً!',
      description: 'سيتم تفعيل المساعد الذكي في التحديثات القادمة.',
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 h-16 w-16 rounded-full shadow-lg z-50 bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center"
        size="icon"
        aria-label="مساعد الذكاء الاصطناعي"
      >
        <Bot className="h-8 w-8" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>مساعد الذكاء الاصطناعي</DialogTitle>
            <DialogDescription>
              أنا هنا لمساعدتك. كيف يمكنني خدمتك اليوم؟
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Chat history will go here */}
            <div className="h-48 bg-muted rounded-md p-2 overflow-y-auto">
              <p className="text-sm text-center text-muted-foreground p-4">لا توجد رسائل بعد. ابدأ محادثتك!</p>
            </div>
          </div>
          <DialogFooter>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="message"
                placeholder="اكتب رسالتك هنا..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button type="submit" size="icon" onClick={handleSendMessage}>
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
