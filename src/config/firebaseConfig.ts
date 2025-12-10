import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Config dari Firebase Console Anda (Saya sudah masukkan data Anda yang tadi)
const firebaseConfig = {
  apiKey: "AIzaSyDYrGH58kHxwo1eH3CoTqh2ZgSjIr4N2rI",
  authDomain: "foodgenome-651ae.firebaseapp.com",
  projectId: "foodgenome-651ae",
  storageBucket: "foodgenome-651ae.firebasestorage.app",
  messagingSenderId: "159047483448",
  appId: "1:159047483448:web:7964a087308ebc588fe6cd",
  measurementId: "G-MCFQRTBT1C"
};

// 1. Inisialisasi App
const app = initializeApp(firebaseConfig);

// 2. Inisialisasi Database
export const db = getFirestore(app);

// 3. Inisialisasi Auth (Cara Standar)
// Ini jauh lebih stabil dan jarang error
export const auth = getAuth(app);