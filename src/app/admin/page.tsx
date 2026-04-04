'use client';

import { useUser, useFirestore } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
} from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Users, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_UID } from '@/lib/constants';

function AllStudentsList() {
  const firestore = useFirestore();
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStudents = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        let studentsList: any[] = [];
        for (const userDoc of usersSnapshot.docs) {
          const studentsQuery = query(
            collection(firestore, `users/${userDoc.id}/students`),
            orderBy('createdAt', 'asc')
          );
          const studentsSnapshot = await getDocs(studentsQuery);
          const studentsData = studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            owner: userDoc.data().email || userDoc.id,
          }));
          studentsList = [...studentsList, ...studentsData];
        }
        setAllStudents(studentsList);
      } catch (error) {
        console.error('Error fetching all students:', error);
      } finally {
        setLoading(false);
      }
    };

    if(firestore) {
      fetchAllStudents();
    }
  }, [firestore]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>جميع الطلاب المسجلين ({allStudents.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الفصل</TableHead>
                <TableHead>هاتف ولي الأمر</TableHead>
                <TableHead>المستخدم المالك</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStudents.length > 0 ? (
                allStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/students/${student.id}`}
                        className="hover:underline text-primary"
                      >
                        {student.name}
                      </Link>
                    </TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.parentPhone || 'لا يوجد'}</TableCell>
                    <TableCell>{student.owner}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    لم يتم العثور على طلاب.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


function ContactMessagesList() {
    const firestore = useFirestore();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const messagesQuery = query(collection(firestore, 'contactMessages'), orderBy('createdAt', 'desc'));
                const messagesSnapshot = await getDocs(messagesQuery);
                const messagesData = messagesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messagesData);
            } catch (error) {
                console.error("Error fetching contact messages:", error);
            } finally {
                setLoading(false);
            }
        };

        if(firestore) {
            fetchMessages();
        }

    }, [firestore]);
    
    if (loading) {
        return (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>الرسائل الواردة ({messages.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-[60vh] overflow-auto">
                    {messages.length > 0 ? (
                        <div className="space-y-4">
                            {messages.map(msg => (
                                <Card key={msg.id} className="bg-muted/50">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{msg.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{msg.email}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {msg.createdAt ? format(msg.createdAt.toDate(), 'd MMMM yyyy, hh:mm a', { locale: ar }) : ''}
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap">{msg.message}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                         <div className="h-24 text-center flex items-center justify-center">
                            <p className="text-muted-foreground">لا توجد رسائل واردة.</p>
                         </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, isUserLoading, isAdmin, router]);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ms-4">جاري التحقق من صلاحيات المشرف...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>لوحة تحكم المشرف</PageHeaderTitle>
          <PageHeaderDescription>
            إدارة الطلاب والرسائل الواردة في النظام.
          </PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>
       <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="students">
                    <Users className="ms-2 h-4 w-4" />
                    إدارة الطلاب
                </TabsTrigger>
                <TabsTrigger value="messages">
                    <Mail className="ms-2 h-4 w-4" />
                    الرسائل الواردة
                </TabsTrigger>
            </TabsList>
            <TabsContent value="students" className="mt-6">
                <AllStudentsList />
            </TabsContent>
            <TabsContent value="messages" className="mt-6">
                <ContactMessagesList />
            </TabsContent>
        </Tabs>
    </div>
  );
}
