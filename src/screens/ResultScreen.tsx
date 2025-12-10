import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { getFoodData } from '../services/foodDataService'; // Import database kita

export default function ResultScreen({ route, navigation }: any) {
  const { imageUri, prediction } = route.params;
  const [foodInfo, setFoodInfo] = useState<any>(null);

  useEffect(() => {
    if (prediction) {
      // Ambil data berdasarkan ID dari AI
      const data = getFoodData(prediction.index);
      setFoodInfo(data);
    }
  }, [prediction]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Gambar Hasil Jepretan */}
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.card}>
        {foodInfo ? (
          <>
            {/* Header Nama Makanan */}
            <Text style={styles.categoryLabel}>TERDETEKSI SEBAGAI:</Text>
            <Text style={styles.foodName}>{foodInfo.name}</Text>
            
            {/* Tampilkan ID & Akurasi (Untuk Debugging) */}
            <Text style={styles.debugInfo}>
              AI Class ID: {prediction.index} | Confidence: {(prediction.confidence * 100).toFixed(1)}%
            </Text>

            <View style={styles.divider} />

            {/* Tabel Nutrisi */}
            <Text style={styles.sectionTitle}>Informasi Nutrisi (Per Porsi)</Text>
            
            <View style={styles.nutritionRow}>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientVal}>{foodInfo.calories}</Text>
                <Text style={styles.nutrientLabel}>Kalori</Text>
              </View>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientVal}>{foodInfo.protein}</Text>
                <Text style={styles.nutrientLabel}>Protein</Text>
              </View>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientVal}>{foodInfo.carbs}</Text>
                <Text style={styles.nutrientLabel}>Karbo</Text>
              </View>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientVal}>{foodInfo.fat}</Text>
                <Text style={styles.nutrientLabel}>Lemak</Text>
              </View>
            </View>

            {/* Peringatan jika barang tidak dikenal */}
            {foodInfo.isUnknown && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Benda ini tidak ada di database demo kami. Coba scan Pisang (ID 954) atau Apel (ID 948).
                </Text>
              </View>
            )}
          </>
        ) : (
          <ActivityIndicator size="large" color="#4CAF50" />
        )}
      </View>

      <View style={styles.buttonGroup}>
        <Button title="Simpan ke Jurnal" color="#4CAF50" onPress={() => navigation.navigate('History')} />
        <View style={{height: 10}} />
        <Button title="Scan Lagi" color="#666" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: '#f5f5f5', flexGrow: 1 },
  image: { width: '100%', height: 250, borderRadius: 15, marginBottom: 20, resizeMode: 'cover' },
  card: { width: '100%', backgroundColor: 'white', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 4 },
  
  categoryLabel: { fontSize: 12, color: '#888', letterSpacing: 1, fontWeight: 'bold' },
  foodName: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginVertical: 5 },
  debugInfo: { fontSize: 12, color: '#aaa', marginBottom: 15 },
  
  divider: { height: 1, width: '100%', backgroundColor: '#eee', marginVertical: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 15 },
  
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  nutrientItem: { alignItems: 'center', flex: 1 },
  nutrientVal: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  nutrientLabel: { fontSize: 12, color: '#666', marginTop: 2 },

  warningBox: { marginTop: 15, padding: 10, backgroundColor: '#FFF3E0', borderRadius: 8, width: '100%' },
  warningText: { color: '#E65100', fontSize: 12, textAlign: 'center' },
  
  buttonGroup: { width: '100%', marginBottom: 20 }
});