import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
// ✅ PERBAIKAN FATAL: Import dari firebaseConfig, BUKAN apiConfig
import { db, auth } from '../config/firebaseConfig'; 

// Nama koleksi di database Firestore
const COLLECTION_NAME = 'food_history';

// 1. Fungsi SIMPAN Makanan (Dipakai di ResultScreen)
export const saveFoodToHistory = async (foodData: any) => {
  try {
    // Cek keamanan ganda: Pastikan auth object ada dulu
    if (!auth) {
      console.error("❌ SISTEM ERROR: Variable 'auth' tidak ditemukan. Cek firebaseConfig.");
      return false;
    }

    const user = auth.currentUser;
    
    if (!user) {
      console.error("⚠️ User belum login, data tidak bisa disimpan.");
      return false;
    }

    // Path: users -> [UID] -> food_history -> [Data]
    // Ini struktur yang BAGUS (Nested Collection), data user terpisah rapi.
    const docRef = await addDoc(collection(db, 'users', user.uid, COLLECTION_NAME), {
      ...foodData,
      timestamp: new Date().toISOString() // Simpan waktu scan
    });

    console.log("✅ Data berhasil disimpan! ID:", docRef.id);
    return true;

  } catch (e) {
    console.error("❌ Error adding document: ", e);
    return false;
  }
};

// 2. Fungsi AMBIL History (Dipakai di HistoryScreen)
export const getFoodHistory = async () => {
  try {
    // Cek keamanan
    if (!auth) return [];
    
    const user = auth.currentUser;

    if (!user) {
        console.log("User belum login, history kosong.");
        return [];
    }

    // Ambil data dari path user yang login, urutkan dari yang terbaru
    const q = query(
      collection(db, 'users', user.uid, COLLECTION_NAME), 
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (e) {
    console.error("❌ Error getting documents: ", e);
    return [];
  }
};