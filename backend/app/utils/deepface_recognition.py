import os
import base64
import tempfile
from typing import Dict, Any
from deepface import DeepFace
import cv2
import numpy as np
from PIL import Image
import io

class DeepFaceRecognition:
    def __init__(self):
        self.model_name = "ArcFace"
        self.detector_backend = "retinaface"
        self.distance_metric = "cosine"
        self.threshold = 0.6  # Similarity threshold (0.6 = 60% similarity)
    
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
    
    def verify_faces(self, reference_image_base64: str, live_image_base64: str) -> Dict[str, Any]:
        """
        Compare two faces using DeepFace with ArcFace model
        
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
            
            # Save images to temporary files for DeepFace
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as ref_file:
                cv2.imwrite(ref_file.name, reference_img)
                ref_path = ref_file.name
            
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as live_file:
                cv2.imwrite(live_file.name, live_img)
                live_path = live_file.name
            
            try:
                # Use DeepFace to verify faces
                result = DeepFace.verify(
                    img1_path=ref_path,
                    img2_path=live_path,
                    model_name=self.model_name,
                    detector_backend=self.detector_backend,
                    distance_metric=self.distance_metric
                )
                
                # Extract results
                is_verified = result['verified']
                distance = result['distance']
                threshold = result['threshold']
                
                # Calculate similarity percentage (inverse of distance)
                # Cosine distance: 0 = identical, 1 = completely different
                # Convert to similarity percentage: (1 - distance) * 100
                similarity_percentage = max(0, (1 - distance) * 100)
                
                # Determine match status based on verification and similarity
                if is_verified and similarity_percentage >= 60:
                    match_status = "MATCH"
                    confidence_level = "HIGH"
                    color = "green"
                elif similarity_percentage >= 40:
                    match_status = "POSSIBLE_MATCH"
                    confidence_level = "MEDIUM"
                    color = "orange"
                else:
                    match_status = "NO_MATCH"
                    confidence_level = "LOW"
                    color = "red"
                
                return {
                    "success": True,
                    "match_status": match_status,
                    "is_verified": is_verified,
                    "similarity_percentage": round(similarity_percentage, 2),
                    "distance": round(distance, 4),
                    "threshold": round(threshold, 4),
                    "confidence_level": confidence_level,
                    "color": color,
                    "model_used": self.model_name,
                    "detector_used": self.detector_backend,
                    "message": f"Face {match_status.lower().replace('_', ' ')} with {similarity_percentage:.1f}% similarity"
                }
                
            finally:
                # Clean up temporary files
                try:
                    os.unlink(ref_path)
                    os.unlink(live_path)
                except:
                    pass
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "match_status": "ERROR",
                "similarity_percentage": 0,
                "message": f"Error during face verification: {str(e)}"
            }
    
    def extract_face_embedding(self, image_base64: str) -> Dict[str, Any]:
        """
        Extract face embedding from a single image
        
        Args:
            image_base64: Base64 encoded image
            
        Returns:
            Dict containing embedding and face detection info
        """
        try:
            # Convert base64 to image
            img = self.base64_to_image(image_base64)
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                cv2.imwrite(temp_file.name, img)
                temp_path = temp_file.name
            
            try:
                # Extract embedding using DeepFace
                embedding = DeepFace.represent(
                    img_path=temp_path,
                    model_name=self.model_name,
                    detector_backend=self.detector_backend
                )
                
                return {
                    "success": True,
                    "embedding": embedding[0]["embedding"],
                    "face_region": embedding[0].get("region", {}),
                    "model_used": self.model_name
                }
                
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_path)
                except:
                    pass
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Error extracting face embedding: {str(e)}"
            }

# Create a global instance
deepface_recognizer = DeepFaceRecognition()
