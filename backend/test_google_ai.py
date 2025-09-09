#!/usr/bin/env python3
"""
Test Google AI face recognition directly
"""
import os
import sys
sys.path.append('.')

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from app.utils.google_face_recognition import google_face_recognizer
import base64
from PIL import Image
import io

def test_google_ai():
    print("🔍 Testing Google AI face recognition...")
    
    # Check if API key is loaded
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("❌ Google API key not found in environment")
        return
    
    print(f"✅ Google API key found: {api_key[:10]}...")
    
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    # Convert to base64
    img_base64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')
    
    try:
        print("🤖 Testing Google AI face verification...")
        result = google_face_recognizer.verify_faces(img_base64, img_base64)
        
        print("📊 Result:")
        print(f"  Success: {result.get('success')}")
        print(f"  Match Status: {result.get('match_status')}")
        print(f"  Similarity: {result.get('similarity_percentage')}%")
        print(f"  Model: {result.get('model_used')}")
        print(f"  Message: {result.get('message')}")
        
        if result.get('success'):
            print("✅ Google AI face recognition is working!")
        else:
            print(f"❌ Google AI failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Error testing Google AI: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_google_ai()
