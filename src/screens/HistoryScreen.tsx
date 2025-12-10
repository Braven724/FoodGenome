import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 
import { getFoodHistory } from '../services/firebaseService';

export default function HistoryScreen() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi ambil data
  const loadData = async () => {
    setLoading(true);
    // Ambil data dari Firebase
    const data = await getFoodHistory();
    setHistoryData(data);
    setLoading(false);
  };

  // ✅ SOLUSI UTAMA: useFocusEffect
  // Ini memaksa aplikasi mengambil data baru setiap kali Anda membuka layar ini
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.foodName}>{item.name || 'Makanan Tanpa Nama'}</Text>
        <Text style={styles.date}>
          {item.timestamp ? new Date(item.timestamp).toLocaleDateString('id-ID') : '-'}
        </Text>
      </View>
      
      {/* Tampilkan Akurasi AI jika ada */}
      {item.confidence && (
        <Text style={styles.confidence}>
          Akurasi AI: {(item.confidence * 100).toFixed(0)}%
        </Text>
      )}

      <View style={styles.divider} />

      <View style={styles.nutriRow}>
         <View style={styles.nutriItem}>
            <Text style={styles.emoji}>🔥</Text>
            <Text style={styles.nutriVal}>{item.calories || 0}</Text>
            <Text style={styles.nutriLabel}>Kalori</Text>
         </View>
         <View style={styles.nutriItem}>
            <Text style={styles.emoji}>🥩</Text>
            <Text style={styles.nutriVal}>{item.protein || 0}g</Text>
            <Text style={styles.nutriLabel}>Protein</Text>
         </View>
         <View style={styles.nutriItem}>
            <Text style={styles.emoji}>🍞</Text>
            <Text style={styles.nutriVal}>{item.carbs || 0}g</Text>
            <Text style={styles.nutriLabel}>Karbo</Text>
         </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{marginTop: 10, color: '#666'}}>Memuat Jurnal...</Text>
        </View>
      ) : (
        <FlatList
          data={historyData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
          // Fitur Tarik untuk Refresh (Manual)
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }
          // Tampilan jika kosong
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 50, marginBottom: 20 }}>🍽️</Text>
              <Text style={styles.emptyText}>Belum ada riwayat makan.</Text>
              <Text style={{color: '#aaa', textAlign: 'center', paddingHorizontal: 40}}>
                Data Anda kosong atau Anda belum Login. Yuk scan makanan pertamamu!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  
  card: { 
    backgroundColor: 'white', 
    padding: 15, 
    marginBottom: 15, 
    borderRadius: 12, 
    elevation: 3, // Shadow Android
    shadowColor: '#000', // Shadow iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  foodName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  date: { color: '#999', fontSize: 12 },
  confidence: { fontSize: 10, color: '#4CAF50', marginBottom: 5 },
  
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  
  nutriRow: { flexDirection: 'row', justifyContent: 'space-around' },
  nutriItem: { alignItems: 'center' },
  emoji: { fontSize: 18, marginBottom: 2 },
  nutriVal: { fontWeight: 'bold', color: '#555' },
  nutriLabel: { fontSize: 10, color: '#999' },
  
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#ccc', marginBottom: 5 }
});