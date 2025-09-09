// DeepFace API integration for advanced face recognition
export interface FaceDetectionResult {
  matched: boolean;
  confidence: number;
  inconclusive: boolean;
  message: string;
  matchStatus: string;
  color: string;
  modelUsed: string;
  detectorUsed: string;
}

export const compareFaces = async (
  referenceImage: string,
  liveImage: string,
  studentId: number
): Promise<FaceDetectionResult> => {
  try {
    console.log('Starting DeepFace face comparison...');
    
    // Call the backend DeepFace API
    const formData = new FormData();
    formData.append('reference_image', referenceImage);
    formData.append('live_image', liveImage);
    formData.append('student_id', studentId.toString());
    
    const response = await fetch('http://localhost:8000/face-verify/', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('DeepFace API response:', result);
    
    if (!result.success) {
      return {
        matched: false,
        confidence: 0,
        inconclusive: false,
        message: result.message || 'Face verification failed',
        matchStatus: 'ERROR',
        color: 'red',
        modelUsed: 'DeepFace',
        detectorUsed: 'RetinaFace'
      };
    }
    
    // Map the API response to our interface
    const similarity = result.similarity_percentage || 0;
    const matchStatus = result.match_status || 'NO_MATCH';
    const isVerified = result.is_verified || false;
    
    // Determine if it's a match based on the API response
    const matched = matchStatus === 'MATCH' || (matchStatus === 'POSSIBLE_MATCH' && similarity >= 50);
    const inconclusive = matchStatus === 'POSSIBLE_MATCH' && similarity < 60;
    
    return {
      matched,
      confidence: similarity,
      inconclusive,
      message: result.message || `Face ${matchStatus.toLowerCase().replace('_', ' ')} with ${similarity.toFixed(1)}% similarity`,
      matchStatus,
      color: result.color || 'red',
      modelUsed: result.model_used || 'ArcFace',
      detectorUsed: result.detector_used || 'RetinaFace'
    };
  } catch (error) {
    console.error('DeepFace API error:', error);
    return {
      matched: false,
      confidence: 0,
      inconclusive: false,
      message: `Error connecting to face recognition service: ${error instanceof Error ? error.message : 'Unknown error'}`,
      matchStatus: 'ERROR',
      color: 'red',
      modelUsed: 'DeepFace',
      detectorUsed: 'RetinaFace'
    };
  }
};