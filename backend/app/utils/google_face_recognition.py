import os
import base64
import tempfile
from typing import Dict, Any
import google.generativeai as genai
from PIL import Image
import io

class GoogleFaceRecognition:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
    
    def base64_to_image(self, base64_string: str) -> Image.Image:
        """Convert base64 string to PIL Image"""
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
            
            return pil_image
        except Exception as e:
            raise ValueError(f"Error converting base64 to image: {str(e)}")
    
    def verify_faces(self, reference_image_base64: str, live_image_base64: str) -> Dict[str, Any]:
        """
        Compare two faces using Google Generative AI
        
        Args:
            reference_image_base64: Base64 encoded reference image
            live_image_base64: Base64 encoded live captured image
            
        Returns:
            Dict containing match result, confidence, and details
        """
        try:
            if not self.model:
                return {
                    "success": False,
                    "error": "Google API key not configured",
                    "match_status": "ERROR",
                    "similarity_percentage": 0,
                    "message": "Google API key not found. Please set GOOGLE_API_KEY environment variable."
                }
            
            # Convert base64 strings to images
            reference_img = self.base64_to_image(reference_image_base64)
            live_img = self.base64_to_image(live_image_base64)
            
            # Create a prompt for face comparison
            prompt = """
            Please analyze these two images and determine if they show the same person.
            
            Image 1: Reference photo
            Image 2: Live captured photo
            
            Please provide:
            1. Are these the same person? (YES/NO/UNCERTAIN)
            2. Confidence level (0-100%)
            3. Brief explanation of your analysis
            
            Focus on facial features, structure, and characteristics.
            """
            
            # Prepare images for the model
            images = [reference_img, live_img]
            
            # Generate response
            response = self.model.generate_content([prompt] + images)
            
            # Parse the response
            response_text = response.text.lower()
            
            # Extract match status
            if 'yes' in response_text and 'same person' in response_text:
                match_status = "MATCH"
                is_verified = True
            elif 'no' in response_text and 'same person' in response_text:
                match_status = "NO_MATCH"
                is_verified = False
            else:
                match_status = "POSSIBLE_MATCH"
                is_verified = False
            
            # Extract confidence percentage
            import re
            confidence_match = re.search(r'(\d+)%', response_text)
            if confidence_match:
                similarity_percentage = float(confidence_match.group(1))
            else:
                # Default confidence based on match status
                if match_status == "MATCH":
                    similarity_percentage = 85.0
                elif match_status == "NO_MATCH":
                    similarity_percentage = 15.0
                else:
                    similarity_percentage = 50.0
            
            # Determine color and confidence level
            if match_status == "MATCH" and similarity_percentage >= 70:
                color = "green"
                confidence_level = "HIGH"
            elif match_status == "POSSIBLE_MATCH" or (match_status == "MATCH" and similarity_percentage < 70):
                color = "orange"
                confidence_level = "MEDIUM"
            else:
                color = "red"
                confidence_level = "LOW"
            
            return {
                "success": True,
                "match_status": match_status,
                "is_verified": is_verified,
                "similarity_percentage": round(similarity_percentage, 2),
                "confidence_level": confidence_level,
                "color": color,
                "model_used": "Google Gemini 1.5 Flash",
                "detector_used": "Google Vision AI",
                "message": f"Face {match_status.lower().replace('_', ' ')} with {similarity_percentage:.1f}% confidence (Google AI)",
                "raw_response": response_text
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "match_status": "ERROR",
                "similarity_percentage": 0,
                "message": f"Error during Google AI face verification: {str(e)}"
            }

# Create a global instance
google_face_recognizer = GoogleFaceRecognition()
