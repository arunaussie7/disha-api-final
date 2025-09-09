import os
import base64
import tempfile
from typing import Dict, Any
import cv2
import numpy as np
from PIL import Image
import io

class SimpleFaceRecognition:
    def __init__(self):
        self.threshold = 0.6  # Similarity threshold
    
    def base64_to_image(self, base64_string: str) -> np.ndarray:
        """Convert base64 string to OpenCV image array"""
        try:
            # Remove data URL prefix if present
            if base64_string.startswith('data:image'):
                base64_string = base64_string.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_string)
            
            # Convert to PIL Image
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Convert to OpenCV format
            opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            return opencv_image
        except Exception as e:
            raise ValueError(f"Error converting base64 to image: {str(e)}")
    
    def calculate_image_similarity(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calculate similarity between two images using pixel comparison"""
        try:
            # Resize images to same size for comparison
            height, width = 100, 100
            img1_resized = cv2.resize(img1, (width, height))
            img2_resized = cv2.resize(img2, (width, height))
            
            # Convert to grayscale for comparison
            gray1 = cv2.cvtColor(img1_resized, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(img2_resized, cv2.COLOR_BGR2GRAY)
            
            # Calculate structural similarity
            diff = cv2.absdiff(gray1, gray2)
            similarity = 1.0 - (np.mean(diff) / 255.0)
            
            return max(0.0, min(1.0, similarity))
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0
    
    def verify_faces(self, reference_image_base64: str, live_image_base64: str) -> Dict[str, Any]:
        """
        Compare two faces using simple image similarity
        
        Args:
            reference_image_base64: Base64 encoded reference image
            live_image_base64: Base64 encoded live captured image
            
        Returns:
            Dict containing match result, confidence, and details
        """
        try:
            # Convert base64 strings to images
            reference_img = self.base64_to_image(reference_image_base64)
            live_img = self.base64_to_image(live_image_base64)
            
            # Calculate similarity
            similarity = self.calculate_image_similarity(reference_img, live_img)
            similarity_percentage = similarity * 100
            
            # Determine match status based on similarity
            if similarity_percentage >= 70:
                match_status = "MATCH"
                is_verified = True
                color = "green"
                confidence_level = "HIGH"
            elif similarity_percentage >= 40:
                match_status = "POSSIBLE_MATCH"
                is_verified = False
                color = "orange"
                confidence_level = "MEDIUM"
            else:
                match_status = "NO_MATCH"
                is_verified = False
                color = "red"
                confidence_level = "LOW"
            
            return {
                "success": True,
                "match_status": match_status,
                "is_verified": is_verified,
                "similarity_percentage": round(similarity_percentage, 2),
                "confidence_level": confidence_level,
                "color": color,
                "model_used": "Simple Image Comparison",
                "detector_used": "OpenCV",
                "message": f"Face {match_status.lower().replace('_', ' ')} with {similarity_percentage:.1f}% similarity"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "match_status": "ERROR",
                "similarity_percentage": 0,
                "message": f"Error during face verification: {str(e)}"
            }

# Create a global instance
simple_face_recognizer = SimpleFaceRecognition()
