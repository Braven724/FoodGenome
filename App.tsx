import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { auth } from './src/config/firebaseConfig';

// Import Screens
// Pastikan file-file ini sudah Anda buat, jika belum, buat file dummy kosong dulu.
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CameraScreen from './src/screens/CameraScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen'; 

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listener Auth (Cek status login)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // 2. 🔥 AUTO-LOGIN UNTUK TESTING 🔥
    // Jika Anda belum login, kode ini akan otomatis melogin-kan Anda sebagai "Tamu".
    // Ini PENTING agar error "User belum login" saat simpan data HILANG.
    const autoLogin = async () => {
       if (!auth.currentUser) {
         try {
           console.log("🔄 Mencoba Auto-Login Tamu...");
           await signInAnonymously(auth);
           console.log("✅ Berhasil Login Tamu!");
         } catch (e) {
           console.error("Gagal Auto-Login:", e);
         }
       }
    };
    
    // Jalankan auto-login (bisa dihapus nanti jika Login Screen sudah jadi)
    autoLogin();

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{marginTop:10, color:'#888'}}>Menyiapkan Aplikasi...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // === JIKA SUDAH LOGIN (Main App) ===
          // User akan otomatis masuk ke sini karena Auto-Login di atas
          <>
            <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Hasil Analisa' }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Jurnal Makananku' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil User' }} />
          </>
        ) : (
          // === JIKA BELUM LOGIN (Auth Screens) ===
          // Area ini sementara tidak akan muncul karena kita memaksa Auto-Login
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Daftar Akun' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}