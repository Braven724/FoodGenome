import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { classifyImage } from '../services/aiService';
// Asumsi: file firebaseService.ts kamu masih ada dan berfungsi untuk simpan database
import { saveFoodToHistory } from '../services/firebaseService'; 

export default function ResultScreen({ route, navigation }: any) {
  const { photoUri } = route.params; 
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    // Panggil fungsi yang nyambung ke Python tadi
    const apiResult = await classifyImage(photoUri);
    setResult(apiResult);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!result || !result.success) return;

    // Simpan ke Firebase (History)
    const success = await saveFoodToHistory({
      name: result.name,
      calories: result.nutrition.calories,
      protein: result.nutrition.protein,
      carbs: result.nutrition.carbs,
      fat: result.nutrition.fat,
      confidence: result.confidence
    });

    if (success) {
        Alert.alert("Berhasil", "Data tersimpan di Jurnal!");
        navigation.navigate("History"); 
    } else {
        Alert.alert("Gagal", "Cek koneksi internet.");
    }
  };

  // --- TAMPILAN LOADING ---
  if (loading) {
    return (
      <View style={styles.center}>
        <Image source={{ uri: photoUri }} style={styles.thumbnail} />
        <ActivityIndicator size="large" color="#4CAF50" style={{marginTop: 20}} />
        <Text style={styles.textGray}>Sedang tanya ke Server Python...</Text>
      </View>
    );
  }

  // --- TAMPILAN ERROR ---
  if (!result?.success) {
    return (
      <View style={styles.container}>
         <Image source={{ uri: photoUri }} style={styles.previewImage} />
         <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Gagal Deteksi</Text>
            <Text style={styles.errorText}>{result?.error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={runAnalysis}>
                <Text style={styles.btnText}>Coba Lagi</Text>
            </TouchableOpacity>
         </View>
      </View>
    );
  }

  // --- TAMPILAN HASIL (SUKSES) ---
  const { nutrition } = result;
  
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.previewImage} />

      <View style={styles.resultCard}>
        {/* Nama Makanan */}
        <Text style={styles.label}>Hasil Deteksi:</Text>
        <Text style={styles.foodName}>{result.name}</Text>
        <Text style={styles.confidence}>Yakin: {(result.confidence * 100).toFixed(1)}%</Text>

        <View style={styles.divider} />

        {/* Kotak Nutrisi */}
        <Text style={styles.sectionTitle}>Kandungan Gizi</Text>
        <View style={styles.nutriRow}>
           <NutriBox label="Kalori" value={nutrition.calories} unit="kkal" />
           <NutriBox label="Protein" value={nutrition.protein} unit="g" />
           <NutriBox label="Karbo" value={nutrition.carbs} unit="g" />
           <NutriBox label="Lemak" value={nutrition.fat} unit="g" />
        </View>

        {/* Rekomendasi dari Backend */}
        <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Saran:</Text>
            <Text style={styles.tipText}>{result.recommendation}</Text>
        </View>

        {/* Tombol Simpan */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.btnText}>Simpan ke Jurnal</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

// Komponen Kecil Kotak Nutrisi
const NutriBox = ({label, value, unit}: any) => (
    <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 18, fontWeight: 'bold'}}>{value}</Text>
        <Text style={{fontSize: 10, color: '#888'}}>{unit}</Text>
        <Text style={{fontSize: 12, color: '#555'}}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textGray: { marginTop: 15, color: '#666' },
  thumbnail: { width: 100, height: 100, borderRadius: 15 },
  
  previewImage: { width: '100%', height: 300, resizeMode: 'cover' },
  resultCard: { 
    backgroundColor: 'white', marginTop: -30, padding: 25, 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 10, flex: 1 
  },
  
  label: { textAlign: 'center', color: '#888', fontSize: 12 },
  foodName: { textAlign: 'center', fontSize: 28, fontWeight: 'bold', marginVertical: 5 },
  confidence: { textAlign: 'center', color: '#4CAF50', fontSize: 12, marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  nutriRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  
  tipBox: { backgroundColor: '#e3f2fd', padding: 15, borderRadius: 12, marginBottom: 20 },
  tipTitle: { color: '#1976D2', fontWeight: 'bold', marginBottom: 5 },
  tipText: { color: '#0D47A1', fontSize: 13 },

  saveBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  errorCard: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', elevation: 5, marginTop: -50 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#e74c3c' },
  errorText: { textAlign: 'center', color: '#555', marginVertical: 10 },
  retryBtn: { backgroundColor: '#e74c3c', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }
});