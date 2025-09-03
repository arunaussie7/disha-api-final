import asyncio
import aiohttp
from typing import Tuple, Optional
import os
from base64 import b64encode
import json

class FaceAPI:
    def __init__(self):
        # You would typically get these from environment variables
        self.endpoint = os.getenv('AZURE_FACE_ENDPOINT', 'https://your-face-api-endpoint.cognitiveservices.azure.com/')
        self.key = os.getenv('AZURE_FACE_KEY', 'your-face-api-key')
        
        # API endpoints
        self.detect_url = f"{self.endpoint}/face/v1.0/detect"
        self.verify_url = f"{self.endpoint}/face/v1.0/verify"
        
        self.headers = {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': self.key
        }

    async def detect_face(self, image_data: bytes) -> Tuple[bool, Optional[str]]:
        """
        Detect face in image and return face ID
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.detect_url,
                    headers=self.headers,
                    data=image_data
                ) as response:
                    if response.status != 200:
                        return False, None
                    
                    result = await response.json()
                    if not result:
                        return False, None
                    
                    return True, result[0].get('faceId')
                    
        except Exception as e:
            print(f"Error detecting face: {str(e)}")
            return False, None

    async def verify_faces(self, face_id1: str, face_id2: str) -> Tuple[bool, float]:
        """
        Compare two faces and return match status and confidence
        """
        try:
            data = {
                "faceId1": face_id1,
                "faceId2": face_id2
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.verify_url,
                    headers={
                        'Content-Type': 'application/json',
                        'Ocp-Apim-Subscription-Key': self.key
                    },
                    json=data
                ) as response:
                    if response.status != 200:
                        return False, 0.0
                    
                    result = await response.json()
                    is_identical = result.get('isIdentical', False)
                    confidence = result.get('confidence', 0.0)
                    
                    return is_identical, confidence
                    
        except Exception as e:
            print(f"Error verifying faces: {str(e)}")
            return False, 0.0

    async def compare_face_images(self, image1_data: bytes, image2_data: bytes) -> dict:
        """
        Compare two face images and return result with confidence
        """
        # Detect faces in both images
        success1, face_id1 = await self.detect_face(image1_data)
        if not success1:
            return {
                "success": False,
                "message": "No face detected in first image",
                "confidence": 0.0
            }

        success2, face_id2 = await self.detect_face(image2_data)
        if not success2:
            return {
                "success": False,
                "message": "No face detected in second image",
                "confidence": 0.0
            }

        # Compare the faces
        is_match, confidence = await self.verify_faces(face_id1, face_id2)
        
        return {
            "success": is_match,
            "message": "Face matched" if is_match else "Faces do not match",
            "confidence": confidence
        }
