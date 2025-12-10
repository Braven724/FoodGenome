import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy';
// ✅ NEW IMPORT
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MODEL_URL = 'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json';

export const setupTensorFlow = async () => {
  await tf.ready();
  console.log("✅ TensorFlow Ready!");
};

export const loadModel = async () => {
  try {
    console.log("⏳ Downloading AI Model...");
    const model = await tf.loadGraphModel(MODEL_URL);
    console.log("✅ Model Loaded Successfully!");
    return model;
  } catch (error) {
    console.error("❌ Error loading model:", error);
    return null;
  }
};

export const classifyImage = async (model: tf.GraphModel, imageUri: string) => {
  try {
    console.log("🖼️ Processing Image...");

    // ✅ FIX: FORCE CONVERT TO JPEG & RESIZE NATIVELY
    // This fixes "Not a valid JPEG" error if user uploads PNG/HEIC
    const manipResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }], // Resize here is faster than TFJS
      { compress: 1, format: SaveFormat.JPEG }   // Force JPEG format
    );

    // 1. Read the NEW converted image
    const imgB64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    const imgBuffer = tf.util.encodeString(imgB64, 'base64');
    
    // 2. Preprocessing
    const imageTensor = decodeJpeg(imgBuffer); // Now safe because it's guaranteed JPEG
    
    // Since we resized in manipulateAsync, we just need to normalize
    const normalized = imageTensor.toFloat().div(127.5).sub(1).expandDims(0);

    // 3. Prediksi
    const result = await model.predict(normalized) as tf.Tensor;
    
    const softmaxResult = result.softmax(); 
    const data = await softmaxResult.data();

    // 4. Bersihkan Memori
    tf.dispose([imageTensor, normalized, result, softmaxResult]);

    // 5. Cari Hasil
    const predictionArray = Array.from(data);
    const maxVal = Math.max(...predictionArray);
    const maxIndex = predictionArray.indexOf(maxVal);

    console.log(`🎯 AI Prediction: ID ${maxIndex} (Confidence: ${(maxVal*100).toFixed(2)}%)`);

    return {
      index: maxIndex,
      confidence: maxVal
    };

  } catch (error) {
    console.error("❌ Prediction Error:", error);
    return null;
  }
};