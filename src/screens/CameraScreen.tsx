import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  // State untuk tombol agar tidak bisa dipencet 2x saat proses
  const [isCapturing, setIsCapturing] = useState(false);

  // Izin Kamera
  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={{color:'white', marginBottom: 10}}>Aplikasi butuh izin kamera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={{fontWeight: 'bold'}}>Izinkan Akses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Fungsi saat gambar didapatkan (dari kamera / galeri)
   * Kita langsung lempar ke ResultScreen. 
   * Biarkan ResultScreen yang menghubungi Server Python.
   */
  const handleImage = (uri: string) => {
    setIsCapturing(false);
    // Kita kirim parameter 'photoUri' sesuai yang diminta ResultScreen
    navigation.navigate('Result', { photoUri: uri });
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ 
          quality: 0.7, // Kualitas 70% agar upload ke server cepat
          base64: false 
        });
        
        if (photo?.uri) {
          handleImage(photo.uri);
        } else {
          setIsCapturing(false);
        }
      } catch (e) {
        Alert.alert("Error", "Gagal mengambil gambar.");
        setIsCapturing(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Update sintaks terbaru
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        handleImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Error", "Gagal membuka galeri.");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        
        {/* TOMBOL PROFIL */}
        <TouchableOpacity 
          style={styles.profileBtn} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={{fontSize: 24}}>👤</Text>
        </TouchableOpacity>

        {/* CONTROLS BAWAH */}
        <View style={styles.controls}>
          {/* Tombol Galeri */}
          <TouchableOpacity onPress={pickImage} style={styles.sideBtn}>
            <Text style={{fontSize:24}}>🖼️</Text>
          </TouchableOpacity>
          
          {/* Tombol Shutter */}
          <TouchableOpacity 
            onPress={takePicture} 
            disabled={isCapturing}
            style={[styles.captureBtn, isCapturing && {opacity: 0.5}]}
          >
            <View style={styles.innerCircle} />
          </TouchableOpacity>

          {/* Tombol History */}
          <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.sideBtn}>
            <Text style={{fontSize:24}}>📜</Text>
          </TouchableOpacity>
        </View>

      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  camera: { flex: 1 },
  
  profileBtn: {
    position: 'absolute',
    top: 50, 
    right: 20, 
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 20,
    zIndex: 10
  },

  controls: { 
    position: 'absolute', 
    bottom: 50, 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-around', 
    alignItems: 'center' 
  },
  
  captureBtn: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: 'rgba(255,255,255,0.3)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)'
  },
  innerCircle: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'white' 
  },
  
  sideBtn: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  btn: { 
    backgroundColor: 'white', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    marginTop: 10, 
    borderRadius: 5 
  }
});