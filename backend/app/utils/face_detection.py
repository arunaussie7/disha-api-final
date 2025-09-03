from typing import Dict

def compare_image_names(photo1_filename: str, photo2_filename: str) -> Dict:
    """
    Compare two image names to check if they are exactly the same
    """
    try:
        # Compare the filenames directly
        is_match = photo1_filename == photo2_filename
        
        return {
            "success": is_match,
            "message": "Images match" if is_match else "Images don't match - Please mark as absent",
            "confidence": 1.0 if is_match else 0.0
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error processing image names: {str(e)}",
            "confidence": 0.0
        }