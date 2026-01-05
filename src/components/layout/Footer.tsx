'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Folder,
  User,
  Mail,
  MessageSquare,
  Bookmark,
  ChevronUp,
} from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-card text-card-foreground border-t mt-12 py-12">
      <div className="container max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact Form Side */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-white">
                    <Phone />
                  </div>
                </div>
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center w-full">
                    <div className="w-full h-0.5 bg-gradient-to-r from-red-500 to-purple-600"></div>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 -top-4">
                    <div className="bg-gradient-to-r from-red-500 to-purple-600 text-white px-4 py-1 rounded-md text-sm font-semibold flex items-center gap-2">
                      <Bookmark className="w-4 h-4 transform -rotate-90" />
                      نموذج الاتصال
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="بريد إلكتروني"
                  className="pl-12"
                />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="الاسم" className="pl-12" />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-5 h-5 w-5 text-muted-foreground" />
                <Textarea
                  placeholder="وو رسالة"
                  className="pl-12 min-h-[100px]"
                />
              </div>
            </form>
          </div>

          {/* Translation Side */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-white">
                  <Folder />
                </div>
              </div>
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center w-full">
                  <div className="w-full h-0.5 bg-gradient-to-r from-red-500 to-purple-600"></div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -top-4">
                  <div className="bg-gradient-to-r from-red-500 to-purple-600 text-white px-4 py-1 rounded-md text-sm font-semibold flex items-center gap-2">
                    <Bookmark className="w-4 h-4 transform -rotate-90" />
                    ترجمة
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-8">
              <Select dir="ltr">
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground gap-1">
                <span>Powered by</span>
                <span className="font-bold text-blue-600">G</span>
                <span className="font-bold text-red-600">o</span>
                <span className="font-bold text-yellow-500">o</span>
                <span className="font-bold text-blue-600">g</span>
                <span className="font-bold text-green-600">l</span>
                <span className="font-bold text-red-600">e</span>
                <span>Translate</span>
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
