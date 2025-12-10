import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
// ✅ Keep imports at the top
import { db, auth } from '../config/firebaseConfig'; 

// Nama koleksi di database Firestore
const COLLECTION_NAME = 'food_history';

// 1. Fungsi SIMPAN Makanan (Dipakai di ResultScreen)
export const saveFoodToHistory = async (foodData: any) => {
  try {
    // ✅ Correct usage for Web SDK: auth.currentUser (no parentheses)
    const user = auth.currentUser;
    
    if (!user) {
      console.error("User belum login, tidak bisa simpan data.");
      return false;
    }

    // Path: users -> [UID] -> food_history -> [Data]
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
    // ✅ Correct usage for Web SDK
    const user = auth.currentUser;

    if (!user) {
        console.log("No user logged in");
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