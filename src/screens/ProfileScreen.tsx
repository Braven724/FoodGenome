import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function ProfileScreen({ navigation }: any) {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // App.tsx akan otomatis mendeteksi logout dan melempar ke halaman Login
    } catch (error) {
      Alert.alert("Error", "Gagal keluar akun");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.status}>Member Aktif</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Akun Saya</Text>
        <Button title="Lihat History Makanan" onPress={() => navigation.navigate('History')} />
        <View style={{height: 10}} />
        <Button title="Keluar (Logout)" color="#FF3B30" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  avatar: { fontSize: 60, marginBottom: 10 },
  email: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  status: { color: '#4CAF50', fontWeight: 'bold', marginTop: 5 },
  section: { backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 16, color: '#666', marginBottom: 15, fontWeight: 'bold' }
});