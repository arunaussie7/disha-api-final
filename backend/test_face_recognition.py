#!/usr/bin/env python3
"""
Test script for face recognition API
"""
import requests
import base64
import json

def test_face_recognition():
    # Create a simple test image (1x1 pixel)
    from PIL import Image
    import io
    
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    # Convert to base64
    img_base64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')
    
    # Test the API
    url = "http://localhost:8000/face-verify/"
    
    data = {
        'reference_image': img_base64,
        'live_image': img_base64,
        'student_id': 1
    }
    
    try:
        print("🔍 Testing face recognition API...")
        response = requests.post(url, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API Response:")
            print(json.dumps(result, indent=2))
            
            if result.get('success'):
                print(f"🎯 Face recognition working! Model: {result.get('model_used')}")
                print(f"📊 Match status: {result.get('match_status')}")
                print(f"📈 Similarity: {result.get('similarity_percentage')}%")
            else:
                print(f"❌ Face recognition failed: {result.get('message')}")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    test_face_recognition()
