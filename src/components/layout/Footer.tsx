'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Phone,
  User,
  Mail,
  MessageSquare,
  Bookmark,
  ChevronUp,
  Share2,
  Globe,
  Send,
} from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaTelegram, FaPinterest, FaTumblr } from 'react-icons/fa';
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
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        variant: 'destructive',
        title: 'حقول فارغة',
        description: 'الرجاء ملء جميع الحقول قبل الإرسال.',
      });
      return;
    }

    const subject = encodeURIComponent(`رسالة من ${contactForm.name} عبر الموقع`);
    const body = encodeURIComponent(`الاسم: ${contactForm.name}\nالبريد الإلكتروني: ${contactForm.email}\n\nالرسالة:\n${contactForm.message}`);
    
    window.location.href = `mailto:x7oud3@gmail.com?subject=${subject}&body=${body}`;

    setContactForm({ name: '', email: '', message: '' });
  };


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
     { name: 'واتساب', icon: FaWhatsapp, href: 'https://whatsapp.com/channel/0029Vb6jCdZHLHQVARrm8n3e' },
     { name: 'فيسبوك', icon: FaFacebook, href: 'https://facebook.com/YOUR_PAGE' },
     { name: 'تليجرام', icon: TelegramIcon, href: 'https://t.me/YOUR_CHANNEL' },
     { name: 'بنترست', icon: FaPinterest, href: 'https://pinterest.com/YOUR_PROFILE' },
     { name: 'تمبلر', icon: FaTumblr, href: 'https://www.tumblr.com/YOUR_BLOG' },
     { name: 'الموقع الإلكتروني', icon: Globe, href: 'https://your-website.com' },
  ]
  
  const socialLinksRow1 = socialLinks.slice(0, 4);
  const socialLinksRow2 = socialLinks.slice(4);

  return (
    <footer className="bg-card text-card-foreground border-t mt-12 py-12">
      <div className="container max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact Form Side */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-white">
                <Phone />
              </div>
            </div>


            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  placeholder="بريد إلكتروني"
                  className="pl-12"
                  value={contactForm.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  name="name"
                  placeholder="الاسم"
                  className="pl-12"
                  value={contactForm.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-5 h-5 w-5 text-muted-foreground" />
                <Textarea
                  name="message"
                  placeholder="رسالتك"
                  className="pl-12 min-h-[100px]"
                  value={contactForm.message}
                  onChange={handleInputChange}
                />
              </div>
               <Button type="submit" className="w-full bg-gradient-to-r from-red-500 to-purple-600 text-white hover:opacity-90 transition-opacity">
                <Send className="ms-2 h-4 w-4" />
                إرسال الرسالة
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
