import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SubjectWiseStats from "@/components/SubjectWiseStats";
import AttendanceDialog from "@/components/AttendanceDialog";
import { LogOut, User, CheckCircle2, XCircle, GraduationCap, BarChart3, Users } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  class: string;
  section: string;
  semester: string;
  attendance: Array<{
    date: string;
    status: 'present' | 'absent';
    subject: string;
  }>;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);

  const loadData = () => {
    try {
      // Initialize students array if it doesn't exist
      if (!localStorage.getItem("students")) {
        localStorage.setItem("students", JSON.stringify([]));
      }

      const loadedStudents = JSON.parse(localStorage.getItem("students") || "[]");
      setStudents(loadedStudents);

      const today = new Date().toISOString().split('T')[0];
      
      // Count students present in ANY subject today
      const presentToday = loadedStudents.filter((student: Student) => 
        student.attendance?.some(a => a.date === today && a.status === 'present')
      ).length;

      // Count students absent in ALL subjects today
      const absentToday = loadedStudents.filter((student: Student) => 
        student.attendance?.some(a => a.date === today && a.status === 'absent') &&
        !student.attendance?.some(a => a.date === today && a.status === 'present')
      ).length;

      // Calculate total attendance rate across all subjects
      const totalPresent = loadedStudents.reduce((sum: number, student: Student) => 
        sum + (student.attendance?.filter(a => a.status === 'present').length || 0), 0
      );

      const totalAttendance = loadedStudents.reduce((sum: number, student: Student) => 
        sum + (student.attendance?.length || 0), 0
      );

      setStats({
        totalStudents: loadedStudents.length,
        presentToday,
        absentToday,
        attendanceRate: totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    const teacherData = localStorage.getItem("currentTeacher");
    
    if (!teacherData) {
      navigate("/teacher/login");
      return;
    }

    try {
      const teacher = JSON.parse(teacherData);
      setTeacherName(teacher.name || "Teacher");
    } catch (error) {
      console.error("Error parsing teacher data:", error);
    }
    
    loadData();
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentTeacher");
    navigate("/teacher/login");
  };

  const handleAttendanceUpdate = () => {
    loadData(); // Reload data when attendance is updated
  };

  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0];

  // Filter students by today's attendance
  const presentStudents = students.filter(student => 
    student.attendance?.some(a => a.date === today && a.status === 'present')
  );

  const absentStudents = students.filter(student => 
    student.attendance?.some(a => a.date === today && a.status === 'absent') &&
    !student.attendance?.some(a => a.date === today && a.status === 'present')
  );

  // Calculate attendance percentage for each student
  const getStudentAttendance = (student: Student) => {
    const totalAttendance = student.attendance?.length || 0;
    const presentDays = student.attendance?.filter(a => a.status === 'present').length || 0;
    return totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {teacherName}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="text-gray-700">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Present Today</p>
                  <h3 className="text-2xl font-bold text-green-600">{stats.presentToday}</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absent Today</p>
                  <h3 className="text-2xl font-bold text-red-600">{stats.absentToday}</h3>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                  <h3 className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setIsAttendanceDialogOpen(true)} 
                  className="w-full bg-blue-600"
                >
                  <User className="h-4 w-4 mr-2" />
                  Take Attendance
                </Button>
              </CardContent>
            </Card>

            {/* Subject-wise Stats */}
            <SubjectWiseStats students={students} />

            {/* All Students List */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle>All Students</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.class} - Section {student.section}</p>
                        <p className="text-sm text-gray-600">Semester {student.semester}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStudentAttendance(student) >= 75 ? "success" : "destructive"}>
                          {getStudentAttendance(student)}% Attendance
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No students registered yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Present Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Present Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {presentStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.class} - Section {student.section}</p>
                      </div>
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    </div>
                  ))}
                  {presentStudents.length === 0 && (
                    <p className="text-center text-gray-500 py-2">No students marked present today</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Absent Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Absent Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {absentStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.class} - Section {student.section}</p>
                      </div>
                      <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                    </div>
                  ))}
                  {absentStudents.length === 0 && (
                    <p className="text-center text-gray-500 py-2">No students marked absent today</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Attendance Dialog */}
      <AttendanceDialog 
        open={isAttendanceDialogOpen} 
        onOpenChange={setIsAttendanceDialogOpen}
        students={students}
        onAttendanceUpdate={handleAttendanceUpdate}
      />
    </div>
  );
};

export default TeacherDashboard;