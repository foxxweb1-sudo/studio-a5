'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Phone,
  User,
  MessageSquare,
  ChevronUp,
  Share2,
  Globe,
  Send,
  Loader2,
} from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaTumblr, FaTwitter, FaPinterest } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

// A simple SVG icon for Telegram if react-icons is not preferred.
const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
);


export default function Footer() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) {
      toast({
        variant: 'destructive',
        title: 'حقول فارغة',
        description: 'الرجاء ملء جميع الحقول قبل الإرسال.',
      });
      return;
    }
    
    setIsSubmitting(true);

    const whatsappNumber = "201121473424"; // EGY country code + number
    const composedMessage = `رسالة من: ${contactForm.name}\n\n${contactForm.message}`;
    const encodedMessage = encodeURIComponent(composedMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Open WhatsApp link in a new tab
    window.open(whatsappUrl, '_blank');
    
    toast({
        title: 'جاهز للإرسال!',
        description: 'تم تجهيز رسالتك في واتساب. اضغط إرسال هناك.',
    });
    setContactForm({ name: '', message: '' });
    
    setIsSubmitting(false);
  };


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
     { name: 'واتساب', icon: FaWhatsapp, href: 'https://whatsapp.com/channel/0029Vb6jCdZHLHQVARrm8n3e' },
     { name: 'فيسبوك', icon: FaFacebook, href: 'https://www.facebook.com/s1h2i3m4' },
     { name: 'تليجرام', icon: TelegramIcon, href: 'https://t.me/qwr01_bo' },
     { name: 'X', icon: FaTwitter, href: 'https://x.com/tqnyt170296' },
     { name: 'بنترست', icon: FaPinterest, href: 'https://www.pinterest.com/7oud3/' },
     { name: 'تمبلر', icon: FaTumblr, href: 'https://www.tumblr.com/blog/mahmoudmostafa2009' },
     { name: 'الموقع الإلكتروني', icon: Globe, href: 'https://tech-p1.blogspot.com' },
  ]
  
  const socialLinksRow1 = socialLinks.slice(0, 4);
  const socialLinksRow2 = socialLinks.slice(4);

  return (
    <footer className="bg-card text-card-foreground border-t mt-12">
      <div className="container max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact Form Side */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-white">
                <FaWhatsapp />
              </div>
               <h3 className="text-xl font-bold">تواصل معنا عبر واتساب</h3>
            </div>


            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  name="name"
                  placeholder="الاسم"
                  className="pl-12"
                  value={contactForm.name}
                  onChange={handleInputChange}
                   disabled={isSubmitting}
                />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-5 h-5 w-5 text-muted-foreground" />
                <Textarea
                  name="message"
                  placeholder="اكتب رسالتك مع إضافات البريد أو رقم واتساب"
                  className="pl-12 min-h-[100px]"
                  value={contactForm.message}
                  onChange={handleInputChange}
                   disabled={isSubmitting}
                />
              </div>
               <Button type="submit" className="w-full bg-gradient-to-r from-red-500 to-purple-600 text-white hover:opacity-90 transition-opacity" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Send className="ms-2 h-4 w-4" />}
                إرسال عبر واتساب
              </Button>
            </form>
          </div>

          {/* Social Media Side */}
          <div className="space-y-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-white">
                  <Share2 />
                </div>
               <h3 className="text-xl font-bold">تابعنا</h3>
            </div>
            
            <div className="pt-8 flex flex-col items-center justify-center gap-4">
                <p className="text-center text-muted-foreground">تابعنا على منصات التواصل الاجتماعي.</p>
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {socialLinksRow1.map((social) => (
                            <a 
                                key={social.name} 
                                href={social.href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label={social.name}
                            >
                                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 hover:bg-primary/10 hover:text-primary transition-colors">
                                    <social.icon className="h-6 w-6" />
                                </Button>
                            </a>
                        ))}
                    </div>
                     <div className="flex items-center justify-center gap-2 flex-wrap">
                        {socialLinksRow2.map((social) => (
                            <a 
                                key={social.name} 
                                href={social.href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label={social.name}
                            >
                                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 hover:bg-primary/10 hover:text-primary transition-colors">
                                    <social.icon className="h-6 w-6" />
                                </Button>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 py-6">
        <p className="text-center text-xs text-muted-foreground">
          جميع الحقوق محفوظة © تقنيات 2026
        </p>
      </div>
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          size="icon"
          className="rounded-md bg-red-600 hover:bg-red-700 text-white"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      </div>
    </footer>
  );
}
