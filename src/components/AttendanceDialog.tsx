import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, User, AlertCircle, Camera, Loader2, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Webcam from "react-webcam";
import { compareFaces } from "@/utils/faceDetection";

interface Student {
  id: number;
  name: string;
  class: string;
  section: string;
  attendance: Array<{
    date: string;
    status: 'present' | 'absent';
    subject: string;
  }>;
}

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  onAttendanceUpdate: () => void;
}

const SUBJECTS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "computer_science", label: "Computer Science" }
];

const AttendanceDialog = ({ open, onOpenChange, students, onAttendanceUpdate }: AttendanceDialogProps) => {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<{
    status: 'none' | 'matched' | 'not_matched' | 'inconclusive';
    message: string;
  }>({ status: 'none', message: '' });
  const [isComparing, setIsComparing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const webcamRef = useRef<Webcam>(null);

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowPhotoUpload(true);
    setVerificationStatus({ status: 'none', message: '' });
    setSelectedFile(null);
    setCapturedImage(null);
    setSelectedSubject("");
    setDebugInfo("");
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setVerificationStatus({ status: 'none', message: '' });
    setDebugInfo("");
    
    if (file) {
      setDebugInfo(`Reference photo: ${file.name}`);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setVerificationStatus({ status: 'none', message: '' });
      setDebugInfo(prev => prev + ` | Captured photo: webcam-capture.jpg`);
    }
  }, []);

  const analyzeFaces = async () => {
    if (!selectedFile || !capturedImage) {
      toast({
        title: "Error",
        description: "Please upload a reference photo and capture a photo first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsComparing(true);
      setVerificationStatus({ status: 'none', message: 'Analyzing faces with image comparison...' });
      setDebugInfo(prev => prev + ` | Starting analysis...`);

      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });

      console.log('Starting face analysis...');
      console.log('Reference file:', selectedFile.name);
      console.log('Captured image exists:', !!capturedImage);
      
      const result = await compareFaces(fileBase64, capturedImage);
      console.log('Face analysis result:', result);

      setDebugInfo(prev => prev + ` | Result: ${result.matched ? 'MATCHED' : 'NOT MATCHED'} (${result.confidence.toFixed(1)}%)`);

      if (result.confidence > 60) {
        setVerificationStatus({
          status: 'matched',
          message: `✅ Face matched with ${result.confidence.toFixed(1)}% confidence! You can mark the student as present.`
        });
      } else if (result.confidence < 50) {
        setVerificationStatus({
          status: 'not_matched',
          message: `❌ Face did not match (${result.confidence.toFixed(1)}% confidence). Please mark as absent.`
        });
      } else {
        setVerificationStatus({
          status: 'inconclusive',
          message: `⚠️ Inconclusive result (${result.confidence.toFixed(1)}% confidence). You can choose to mark present or absent.`
        });
      }
    } catch (error) {
      console.error('Error analyzing faces:', error);
      setDebugInfo(prev => prev + ` | Error: ${error}`);
      setVerificationStatus({
        status: 'not_matched',
        message: '⚠️ Error analyzing faces. Please try again or mark as absent.'
      });
    } finally {
      setIsComparing(false);
    }
  };

  const handleAttendanceSubmit = async (status: "present" | "absent") => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSubject) {
      toast({
        title: "Error",
        description: "Please select a subject before marking attendance",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile || !capturedImage) {
      toast({
        title: "Error",
        description: "Please upload an image and capture a photo before marking attendance",
        variant: "destructive",
      });
      return;
    }

    if (status === "present" && verificationStatus.status === "not_matched") {
      toast({
        title: "Error",
        description: "Cannot mark present when confidence is below 50%",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get all students
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const studentIndex = allStudents.findIndex((s: Student) => s.id === selectedStudent.id);

      if (studentIndex !== -1) {
        // Initialize attendance array if it doesn't exist
        if (!allStudents[studentIndex].attendance) {
          allStudents[studentIndex].attendance = [];
        }

        const today = new Date().toISOString().split('T')[0];

        // Remove any existing attendance for today and this subject
        allStudents[studentIndex].attendance = allStudents[studentIndex].attendance.filter(
          (a: any) => !(a.date === today && a.subject === selectedSubject)
        );

        // Add new attendance record
        allStudents[studentIndex].attendance.push({
          date: today,
          status: status,
          subject: selectedSubject
        });

        // Save back to localStorage
        localStorage.setItem("students", JSON.stringify(allStudents));

        // Show success message
        toast({
          title: "Success",
          description: `${selectedStudent.name} marked as ${status} for ${
            SUBJECTS.find(s => s.value === selectedSubject)?.label
          }`,
          variant: status === "present" ? "default" : "destructive",
        });

        // Update dashboard
        onAttendanceUpdate();

        // Reset state
        setSelectedStudent(null);
        setShowPhotoUpload(false);
        setSelectedFile(null);
        setCapturedImage(null);
        setVerificationStatus({ status: 'none', message: '' });
        setSelectedSubject("");
        setDebugInfo("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setShowPhotoUpload(false);
    setSelectedStudent(null);
    setSelectedFile(null);
    setCapturedImage(null);
    setVerificationStatus({ status: 'none', message: '' });
    setSelectedSubject("");
    setDebugInfo("");
  };

  // Get today's date for checking attendance
  const today = new Date().toISOString().split('T')[0];

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {showPhotoUpload ? `Take Attendance - ${selectedStudent?.name}` : "Select Student"}
          </DialogTitle>
        </DialogHeader>

        {!showPhotoUpload ? (
          <div className="space-y-4">
            {students.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No students registered yet</p>
            ) : (
              <div className="grid gap-4">
                {students.map((student) => {
                  const todayAttendance = student.attendance?.filter(a => a.date === today);
                  const allSubjectsMarked = SUBJECTS.every(
                    subject => todayAttendance?.some(a => a.subject === subject.value)
                  );

                  return (
                    <Card
                      key={student.id}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => !allSubjectsMarked && handleStudentClick(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-600">{student.class} - Section {student.section}</p>
                          </div>
                        </div>
                        {allSubjectsMarked ? (
                          <div className="text-sm text-gray-500">
                            All subjects marked for today
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm">Take Attendance</Button>
                        )}
                      </div>
                      {todayAttendance && todayAttendance.length > 0 && (
                        <div className="mt-2 pl-12">
                          <p className="text-sm text-gray-600 mb-1">Today's attendance:</p>
                          <div className="flex flex-wrap gap-2">
                            {todayAttendance.map((record, index) => (
                              <span
                                key={index}
                                className={`text-xs px-2 py-1 rounded ${
                                  record.status === 'present'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {SUBJECTS.find(s => s.value === record.subject)?.label}: {record.status}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Button variant="outline" onClick={handleBack} className="mb-4">
              Back to Student List
            </Button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Photo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {selectedFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Live Camera</label>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: "320px" }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full rounded-lg"
                  />
                  <Button 
                    onClick={capture}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600"
                    disabled={isComparing}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Photo
                  </Button>
                </div>
                {capturedImage && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">Photo captured successfully!</p>
                    <img 
                      src={capturedImage} 
                      alt="Captured" 
                      className="mt-2 rounded-lg border border-gray-200"
                      style={{ maxHeight: "100px" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Debug Info */}
            {debugInfo && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Debug Info:</strong> {debugInfo}
                </p>
              </div>
            )}

            {/* Analyze Button */}
            {selectedFile && capturedImage && (
              <div className="flex justify-center">
                <Button 
                  onClick={analyzeFaces}
                  disabled={isComparing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isComparing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Faces
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Verification Status Alert */}
            {verificationStatus.status !== 'none' && (
              <Alert variant={verificationStatus.status === 'matched' ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {verificationStatus.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              {verificationStatus.status === 'matched' && (
                <Button
                  onClick={() => handleAttendanceSubmit("present")}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!selectedSubject || isComparing}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Present
                </Button>
              )}
              
              {verificationStatus.status === 'not_matched' && (
                <Button
                  onClick={() => handleAttendanceSubmit("absent")}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!selectedSubject || isComparing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark Absent
                </Button>
              )}
              
              {verificationStatus.status === 'inconclusive' && (
                <>
                  <Button
                    onClick={() => handleAttendanceSubmit("present")}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!selectedSubject || isComparing}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Present
                  </Button>
                  <Button
                    onClick={() => handleAttendanceSubmit("absent")}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={!selectedSubject || isComparing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark Absent
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDialog;