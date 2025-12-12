import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { classifyImage } from '../services/aiService';
import { saveFoodToHistory } from '../services/firebaseService'; // Pastikan ini ada dari kode sebelumnya

export default function ResultScreen({ route, navigation }: any) {
  const { photoUri } = route.params; // Terima foto dari kamera
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    const apiResult = await classifyImage(photoUri);
    setResult(apiResult);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!result || !result.success) return;

    // Simpan data yang didapat dari server ke Firebase
    const success = await saveFoodToHistory({
      name: result.name,
      calories: result.nutrition.calories,
      protein: result.nutrition.protein,
      carbs: result.nutrition.carbs,
      fat: result.nutrition.fat,
      confidence: result.confidence
    });

    if (success) {
        Alert.alert("Berhasil", "Masuk ke Jurnal!");
        navigation.navigate("History"); // Pindah ke tab History
    } else {
        Alert.alert("Gagal", "Cek koneksi internet.");
    }
  };

  // 1. TAMPILAN LOADING
  if (loading) {
    return (
      <View style={styles.center}>
        <Image source={{ uri: photoUri }} style={styles.thumbnail} />
        <ActivityIndicator size="large" color="#4CAF50" style={{marginTop: 20}} />
        <Text style={styles.loadingText}>Mengirim ke Server AI...</Text>
      </View>
    );
  }

  // 2. TAMPILAN JIKA ERROR / GAGAL
  if (!result?.success) {
    return (
      <View style={styles.container}>
         <Image source={{ uri: photoUri }} style={styles.previewImage} />
         <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Gagal Mengenali</Text>
            <Text style={styles.errorText}>{result?.error || "Terjadi kesalahan"}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={runAnalysis}>
                <Text style={styles.btnText}>Coba Lagi</Text>
            </TouchableOpacity>
         </View>
      </View>
    );
  }

  // 3. TAMPILAN SUKSES (HASIL)
  const { nutrition } = result;
  
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.previewImage} />

      <View style={styles.resultCard}>
        {/* Judul Makanan */}
        <Text style={styles.label}>Terdeteksi Sebagai:</Text>
        <Text style={styles.foodName}>{result.name}</Text>
        <Text style={styles.confidence}>Akurasi: {(result.confidence * 100).toFixed(1)}%</Text>

        <View style={styles.divider} />

        {/* Informasi Nutrisi (Dari Server) */}
        <Text style={styles.sectionTitle}>Informasi Nutrisi</Text>
        <View style={styles.nutriRow}>
           <NutriBox label="Kalori" value={nutrition.calories} unit="kkal" />
           <NutriBox label="Protein" value={nutrition.protein} unit="g" />
           <NutriBox label="Karbo" value={nutrition.carbs} unit="g" />
           <NutriBox label="Lemak" value={nutrition.fat} unit="g" />
        </View>

        {/* Rekomendasi (Dari Server) */}
        <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Saran Kesehatan:</Text>
            <Text style={styles.tipText}>{result.recommendation}</Text>
        </View>

        {/* Tombol Aksi */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.btnText}>Simpan ke Jurnal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.goBack()}>
          <Text style={{color: '#666'}}>Scan Ulang</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Komponen Kecil untuk Kotak Nutrisi
const NutriBox = ({label, value, unit}: any) => (
    <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333'}}>{value}</Text>
        <Text style={{fontSize: 10, color: '#888'}}>{unit}</Text>
        <Text style={{fontSize: 12, color: '#555', marginTop: 2}}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  thumbnail: { width: 150, height: 150, borderRadius: 20, opacity: 0.8 },
  loadingText: { marginTop: 15, fontSize: 16, color: '#666' },
  
  previewImage: { width: '100%', height: 300, resizeMode: 'cover' },
  resultCard: { 
    backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    marginTop: -30, padding: 25, flex: 1, elevation: 10 
  },
  
  label: { textAlign: 'center', color: '#888', fontSize: 12, textTransform: 'uppercase' },
  foodName: { textAlign: 'center', fontSize: 28, fontWeight: 'bold', color: '#2d3436', marginVertical: 5 },
  confidence: { textAlign: 'center', color: '#4CAF50', fontSize: 12, marginBottom: 15 },
  
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  nutriRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
  
  tipBox: { backgroundColor: '#e3f2fd', padding: 15, borderRadius: 12, marginBottom: 20 },
  tipTitle: { color: '#1976D2', fontWeight: 'bold', marginBottom: 5 },
  tipText: { color: '#0D47A1', fontSize: 13, lineHeight: 18 },

  saveButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  outlineButton: { padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  errorCard: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', elevation: 5, marginTop: -50 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#e74c3c', marginBottom: 10 },
  errorText: { textAlign: 'center', color: '#555', marginBottom: 20 },
  retryButton: { backgroundColor: '#e74c3c', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 }
});