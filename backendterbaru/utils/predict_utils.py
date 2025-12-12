import os
import numpy as np
import tensorflow as tf
from PIL import Image
import json

class FoodPredictor:
    def __init__(self, model_path='model/fruit_classifier.tflite'):
        """
        Initialize food predictor with TFLite model
        """
        self.model_path = model_path
        self.class_names = []
        self.nutrition_db = {}
        self.interpreter = None
        
        # Load resources
        self._load_class_names()
        self._load_nutrition_db()
        self._load_model()
        
        print(f"✅ FoodPredictor initialized with {len(self.class_names)} classes")
        print(f"📊 Nutrition database loaded: {len(self.nutrition_db)} items")
    
    def _load_class_names(self):
        """Load class names from text file"""
        try:
            class_names_path = 'model/class_names.txt'
            with open(class_names_path, 'r') as f:
                self.class_names = [line.strip() for line in f.readlines() if line.strip()]
            print(f"📋 Loaded {len(self.class_names)} class names")
        except Exception as e:
            print(f"⚠️ Error loading class names: {e}")
            self.class_names = ["Unknown"]
    
    def _load_nutrition_db(self):
        """Load nutrition database"""
        try:
            # Import from the provided nutrition_lookup.py
            import sys
            sys.path.insert(0, 'model')
            
            # Create a temporary nutrition module if needed
            nutrition_data = {
                "Apple": {"calories": 52, "protein": 0.3, "fat": 0.2, "carbs": 14},
                "Avocado": {"calories": 160, "protein": 2, "fat": 15, "carbs": 9},
                "Ayam Goreng": {"calories": 260, "protein": 25, "fat": 15, "carbs": 8},
                "Banana": {"calories": 89, "protein": 1.1, "fat": 0.3, "carbs": 23},
                "Blackberry": {"calories": 43, "protein": 1.4, "fat": 0.5, "carbs": 10},
                "Burger": {"calories": 295, "protein": 17, "fat": 12, "carbs": 30},
                "Cherry": {"calories": 50, "protein": 1, "fat": 0.3, "carbs": 12},
                "French Fries": {"calories": 312, "protein": 3.4, "fat": 15, "carbs": 41},
                "Gado-Gado": {"calories": 350, "protein": 15, "fat": 22, "carbs": 25},
                "Grape": {"calories": 69, "protein": 0.7, "fat": 0.2, "carbs": 18},
                "Ikan Goreng": {"calories": 240, "protein": 22, "fat": 14, "carbs": 5},
                "Mango": {"calories": 60, "protein": 0.8, "fat": 0.4, "carbs": 15},
                "Mie Goreng": {"calories": 380, "protein": 12, "fat": 14, "carbs": 50},
                "Nasi Goreng": {"calories": 320, "protein": 8, "fat": 12, "carbs": 45},
                "Nasi Padang": {"calories": 600, "protein": 25, "fat": 35, "carbs": 45},
                "Peach": {"calories": 39, "protein": 0.9, "fat": 0.3, "carbs": 10},
                "Pear": {"calories": 57, "protein": 0.4, "fat": 0.1, "carbs": 15},
                "Pizza": {"calories": 266, "protein": 11, "fat": 10, "carbs": 33},
                "Rawon": {"calories": 450, "protein": 24, "fat": 28, "carbs": 28},
                "Rendang": {"calories": 480, "protein": 27, "fat": 34, "carbs": 6},
                "Sate": {"calories": 300, "protein": 25, "fat": 20, "carbs": 8},
                "Soto": {"calories": 150, "protein": 12, "fat": 7, "carbs": 10},
                "Tomato": {"calories": 18, "protein": 0.9, "fat": 0.2, "carbs": 3.9}
            }
            
            self.nutrition_db = nutrition_data
            print(f"📊 Nutrition database loaded with {len(self.nutrition_db)} items")
            
        except Exception as e:
            print(f"⚠️ Error loading nutrition DB: {e}")
            self.nutrition_db = {}
    
    def _load_model(self):
        """Load TFLite model"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            # Load TFLite model
            self.interpreter = tf.lite.Interpreter(model_path=self.model_path)
            self.interpreter.allocate_tensors()
            
            # Get input details
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            
            # Get input shape
            self.input_shape = self.input_details[0]['shape']
            self.height, self.width = self.input_shape[1], self.input_shape[2]
            
            print(f"✅ Model loaded successfully")
            print(f"📐 Input shape: {self.input_shape}")
            print(f"🎯 Input size: {self.height}x{self.width}")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    
    def preprocess_image(self, image):
        """
        Preprocess image for model input
        """
        # Resize image
        image = image.resize((self.width, self.height))
        
        # Convert to numpy array
        image_array = np.array(image, dtype=np.float32)
        
        # Normalize if needed (check model requirements)
        # Usually TFLite models expect values in [0, 1] or [-1, 1]
        image_array = image_array / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    
    def predict_from_path(self, image_path):
        """
        Predict food from image file path
        """
        try:
            # Load image
            image = Image.open(image_path).convert('RGB')
            
            # Preprocess
            input_array = self.preprocess_image(image)
            
            # Set input tensor
            self.interpreter.set_tensor(self.input_details[0]['index'], input_array)
            
            # Run inference
            self.interpreter.invoke()
            
            # Get output
            output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
            predictions = output_data[0]
            
            # Get top prediction
            predicted_class_idx = np.argmax(predictions)
            confidence = float(predictions[predicted_class_idx])
            
            # Get class name
            if predicted_class_idx < len(self.class_names):
                predicted_class = self.class_names[predicted_class_idx]
            else:
                predicted_class = f"Class_{predicted_class_idx}"
            
            # Get nutrition info
            nutrition = self.nutrition_db.get(predicted_class, {
                "calories": 0,
                "protein": 0,
                "fat": 0,
                "carbs": 0
            })
            
            # Generate recommendation
            recommendation = self._generate_recommendation(predicted_class, nutrition)
            
            # Get top 3 predictions
            top_indices = np.argsort(predictions)[-3:][::-1]
            top_predictions = []
            for idx in top_indices:
                if idx < len(self.class_names):
                    class_name = self.class_names[idx]
                    conf = float(predictions[idx])
                    top_predictions.append({
                        "food": class_name,
                        "confidence": round(conf, 3)
                    })
            
            result = {
                "food": predicted_class,
                "confidence": round(confidence, 3),
                "nutrition": nutrition,
                "recommendation": recommendation,
                "top_predictions": top_predictions,
                "processing_time": "real-time"
            }
            
            return result
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            raise
    
    def predict_from_bytes(self, image_bytes):
        """
        Predict food from image bytes
        """
        try:
            # Convert bytes to image
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Save temporarily and predict
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                image.save(tmp.name, 'JPEG')
                result = self.predict_from_path(tmp.name)
            
            # Clean up
            os.unlink(tmp.name)
            
            return result
            
        except Exception as e:
            raise Exception(f"Error predicting from bytes: {e}")
    
    def _generate_recommendation(self, food_name, nutrition):
        """
        Generate simple health recommendation
        """
        calories = nutrition.get("calories", 0)
        protein = nutrition.get("protein", 0)
        fat = nutrition.get("fat", 0)
        
        recommendations = []
        
        if calories > 400:
            recommendations.append("Tinggi kalori, batasi konsumsi")
        elif calories < 100:
            recommendations.append("Rendah kalori, baik untuk diet")
        
        if protein > 20:
            recommendations.append("Sumber protein yang sangat baik")
        elif protein > 10:
            recommendations.append("Cukup protein")
        
        if fat > 20:
            recommendations.append("Tinggi lemak, konsumsi secukupnya")
        
        # Specific food recommendations
        food_recs = {
            "Nasi Goreng": "Kurangi minyak, tambahkan sayuran",
            "Ayam Goreng": "Lebih sehat jika dipanggang atau direbus",
            "Gado-Gado": "Pilihan sehat, pertahankan!",
            "Burger": "Pilih roti gandum, tambahkan salad",
            "French Fries": "Ganti dengan kentang panggang lebih sehat",
            "Pizza": "Pilih topping sayuran, kurangi keju",
            "Sate": "Kurangi saus kacang jika diet",
            "Rendang": "Santan tinggi lemak, konsumsi moderat"
        }
        
        if food_name in food_recs:
            recommendations.append(food_recs[food_name])
        
        if not recommendations:
            recommendations.append("Makanan seimbang, nikmati!")
        
        return " | ".join(recommendations)
    
    def get_available_foods(self):
        """
        Get list of all foods in database
        """
        return list(self.nutrition_db.keys())
    
    def check_model(self):
        """
        Check if model is loaded properly
        """
        return self.interpreter is not None and len(self.class_names) > 0