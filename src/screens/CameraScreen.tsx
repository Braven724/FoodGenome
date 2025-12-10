import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { setupTensorFlow, loadModel, classifyImage } from '../services/aiService';

export default function CameraScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [isModelReady, setIsModelReady] = useState(false);

  // 1. Load Model saat aplikasi dibuka
  useEffect(() => {
    (async () => {
      await setupTensorFlow();
      const loadedModel = await loadModel();
      setModel(loadedModel);
      setIsModelReady(true);
    })();
  }, []);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={{color:'white'}}>Butuh izin kamera.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}><Text>Izinkan</Text></TouchableOpacity>
      </View>
    );
  }

  const processImage = async (uri: string) => {
    if (!model) {
      Alert.alert("Tunggu sebentar", "Model AI sedang disiapkan...");
      return;
    }
    
    setIsProcessing(true);
    
    // Panggil AI Service
    const result = await classifyImage(model, uri);
    
    setIsProcessing(false);
    
    // Kirim hasil ke Result Screen
    navigation.navigate('Result', { 
      imageUri: uri, 
      prediction: result // Berisi { index: 123, confidence: 0.98 }
    });
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (photo?.uri) processImage(photo.uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) processImage(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        
        {/* ✅ TAMBAHAN: TOMBOL PROFIL (POJOK KANAN ATAS) */}
        <TouchableOpacity 
          style={styles.profileBtn} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={{fontSize: 24}}>👤</Text>
        </TouchableOpacity>
        {/* -------------------------------------------------- */}

        {/* Indikator Loading */}
        {(!isModelReady || isProcessing) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>
              {!isModelReady ? "Memuat Model AI..." : "Menganalisa Makanan..."}
            </Text>
          </View>
        )}

        {/* Controls Bawah */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={pickImage} style={styles.sideBtn}><Text style={{fontSize:24}}>🖼️</Text></TouchableOpacity>
          
          <TouchableOpacity 
            onPress={takePicture} 
            disabled={!isModelReady || isProcessing} // Disable kalau model belum siap
            style={[styles.captureBtn, (!isModelReady || isProcessing) && {opacity: 0.5}]}
          >
            <View style={styles.innerCircle} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.sideBtn}><Text style={{fontSize:24}}>📜</Text></TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1 },
  loadingOverlay: { 
    position: 'absolute', top: 100, alignSelf: 'center', 
    backgroundColor: 'rgba(0,0,0,0.7)', padding: 20, borderRadius: 10, alignItems: 'center', zIndex: 20 
  },
  loadingText: { color: 'white', marginTop: 10, fontWeight: 'bold' },
  
  // ✅ TAMBAHAN STYLE UNTUK TOMBOL PROFIL
  profileBtn: {
    position: 'absolute',
    top: 50, // Jarak dari atas (SafeArea)
    right: 20, // Pojok kanan
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 20,
    zIndex: 10 // Pastikan di atas layer kamera
  },

  controls: { position: 'absolute', bottom: 40, flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  innerCircle: { width: 65, height: 65, borderRadius: 32, backgroundColor: 'white' },
  sideBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  btn: { backgroundColor: 'white', padding: 10, marginTop: 10, borderRadius: 5 }
});