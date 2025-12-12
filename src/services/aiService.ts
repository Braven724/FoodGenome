import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { API_URL, API_CONFIG } from '../config/apiConfig';

export const classifyImage = async (imageUri: string) => {
  try {
    console.log("📤 Mengirim gambar ke Backend:", API_URL);

    // 1. KOMPRES GAMBAR 
    // Backend kamu ada limit 5MB (MAX_FILE_SIZE), jadi kita kecilkan dulu biar aman & cepat.
    const manipResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: 640 } }], // Lebar 640px sudah cukup untuk AI mendeteksi
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    // 2. BUNGKUS DATA (FormData)
    // PENTING: nama 'image' ini harus SAMA PERSIS dengan backend (request.files['image'])
    const formData = new FormData();
    formData.append('image', {
      uri: manipResult.uri,
      name: 'food_upload.jpg',
      type: 'image/jpeg',
    } as any);

    // 3. KIRIM KE SERVER (Fetch)
    const uploadPromise = fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Timeout logic biar gak loading selamanya kalau server mati
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout - Server tidak merespon")), API_CONFIG.TIMEOUT)
    );

    const response: any = await Promise.race([uploadPromise, timeoutPromise]);
    const result = await response.json();

    console.log("✅ Respon Server:", result);

    if (!result.success) {
      throw new Error(result.error || "Gagal mengenali makanan");
    }

    // 4. FORMAT DATA UNTUK UI
    // Mapping data dari JSON Backend (predict_utils.py) ke Frontend
    return {
      success: true,
      name: result.food,             // Backend kirim key "food"
      confidence: result.confidence, // Backend kirim key "confidence"
      nutrition: result.nutrition,   // Backend kirim "nutrition": {calories, protein...}
      recommendation: result.recommendation // Backend kirim "recommendation"
    };

  } catch (error: any) {
    console.error("❌ Error aiService:", error.message);
    return { 
      success: false, 
      error: error.message.includes("Network request failed") 
        ? "Gagal konek. Cek IP Laptop & WiFi!" 
        : error.message 
    };
  }
};