#!/usr/bin/env python3
"""
Test simple face recognition directly
"""
import os
import sys
sys.path.append('.')

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from app.utils.simple_face_recognition import simple_face_recognizer
import base64
from PIL import Image
import io

def test_simple_face():
    print("🔍 Testing simple face recognition...")
    
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    # Convert to base64
    img_base64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')
    
    try:
        print("🤖 Testing simple face verification...")
        result = simple_face_recognizer.verify_faces(img_base64, img_base64)
        
        print("📊 Result:")
        print(f"  Success: {result.get('success')}")
        print(f"  Match Status: {result.get('match_status')}")
        print(f"  Similarity: {result.get('similarity_percentage')}%")
        print(f"  Model: {result.get('model_used')}")
        print(f"  Message: {result.get('message')}")
        
        if result.get('success'):
            print("✅ Simple face recognition is working!")
        else:
            print(f"❌ Simple face recognition failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Error testing simple face recognition: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_face()
