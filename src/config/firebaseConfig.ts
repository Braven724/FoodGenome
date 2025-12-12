import { initializeApp, getApp, getApps } from "firebase/app";
// Kita import getReactNativePersistence secara manual lewat 'any' agar tidak merah
import { initializeAuth, getAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Data Asli Project "FoodGenome"
const firebaseConfig = {
  apiKey: "AIzaSyDYrGH58kHxwo1eH3CoTqh2ZgSjIr4N2rI",
  authDomain: "foodgenome-651ae.firebaseapp.com",
  projectId: "foodgenome-651ae",
  storageBucket: "foodgenome-651ae.firebasestorage.app",
  messagingSenderId: "159047483448",
  appId: "1:159047483448:web:7964a087308ebc588fe6cd",
  measurementId: "G-MCFQRTBT1C"
};

let app;
let auth: Auth;

// Cek apakah Firebase sudah jalan sebelumnya?
if (getApps().length === 0) {
  // Jika BELUM, kita nyalakan dari nol
  app = initializeApp(firebaseConfig);
  
  // Trik khusus agar VS Code tidak merah & Persistence jalan
  const authModule = require('firebase/auth');
  const getPersistence = authModule.getReactNativePersistence;

  auth = initializeAuth(app, {
    persistence: getPersistence(ReactNativeAsyncStorage)
  });
  console.log("🔥 Firebase Baru Dinyalakan!");
} else {
  // Jika SUDAH, kita pakai yang lama (Hot Reload aman)
  app = getApp();
  auth = getAuth(app);
  console.log("♻️ Firebase Menggunakan Instance Lama");
}

const db = getFirestore(app);

// Pastikan auth & db diexport agar bisa dipakai file lain
export { auth, db };