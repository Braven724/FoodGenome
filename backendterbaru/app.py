import os
import uuid
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import io

# Import custom modules
from utils.predict_utils import FoodPredictor

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'temp_images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize predictor
predictor = FoodPredictor()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return jsonify({
        "message": "Food Genome Backend API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "predict": "POST /predict - Upload image for food recognition"
        }
    })

@app.route('/predict', methods=['POST'])
def predict_food():
    """
    Endpoint untuk memprediksi makanan dari gambar
    """
    # Check if image file is present
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "error": "No image file provided. Please upload an image with 'image' key."
        }), 400
    
    file = request.files['image']
    
    # Check filename
    if file.filename == '':
        return jsonify({
            "success": False,
            "error": "No selected file"
        }), 400
    
    # Check file extension
    if not allowed_file(file.filename):
        return jsonify({
            "success": False,
            "error": f"File type not allowed. Allowed types: {ALLOWED_EXTENSIONS}"
        }), 400
    
    try:
        # Read image file
        image_bytes = file.read()
        
        # Check file size
        if len(image_bytes) > MAX_FILE_SIZE:
            return jsonify({
                "success": False,
                "error": f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB"
            }), 400
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.jpg"
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save temporarily (optional, bisa langsung process dari memory)
        with open(temp_path, 'wb') as f:
            f.write(image_bytes)
        
        # Predict food
        result = predictor.predict_from_path(temp_path)
        
        # Add timestamp and success flag
        result["success"] = True
        result["timestamp"] = datetime.now().isoformat()
        result["image_id"] = filename
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return jsonify(result)
        
    except Exception as e:
        # Clean up on error
        temp_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.jpg")
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/predict/from_url', methods=['POST'])
def predict_from_url():
    """
    Endpoint untuk prediksi dari URL gambar
    """
    try:
        data = request.get_json()
        if not data or 'image_url' not in data:
            return jsonify({
                "success": False,
                "error": "No image_url provided"
            }), 400
        
        # Download image from URL
        import urllib.request
        import tempfile
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
            urllib.request.urlretrieve(data['image_url'], tmp_file.name)
            temp_path = tmp_file.name
        
        # Predict
        result = predictor.predict_from_path(temp_path)
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        result["success"] = True
        result["timestamp"] = datetime.now().isoformat()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/foods', methods=['GET'])
def get_all_foods():
    """
    Get all available foods in database
    """
    try:
        foods = predictor.get_available_foods()
        return jsonify({
            "success": True,
            "count": len(foods),
            "foods": foods,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    try:
        # Check if model is loaded
        model_status = predictor.check_model()
        
        return jsonify({
            "success": True,
            "status": "healthy",
            "model_loaded": model_status,
            "timestamp": datetime.now().isoformat(),
            "server_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Print startup info
    print("=" * 50)
    print("🚀 Food Genome Backend Starting...")
    print(f"📁 Model directory: {os.path.abspath('model')}")
    print(f"📁 Temp directory: {os.path.abspath(UPLOAD_FOLDER)}")
    print("=" * 50)
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)