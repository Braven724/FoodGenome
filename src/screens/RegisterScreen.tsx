import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Sukses", "Akun berhasil dibuat!");
      // Otomatis login setelah register
    } catch (error: any) {
      Alert.alert("Registrasi Gagal", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buat Akun Baru</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (Min. 6 karakter)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Daftar Sekarang" onPress={handleRegister} color="#2196F3" />
      
      <View style={{marginTop: 15}}>
        <Button title="Kembali ke Login" onPress={() => navigation.goBack()} color="#888" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15 },
});