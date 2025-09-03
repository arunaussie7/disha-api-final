import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LogOut, User, Mail, GraduationCap, BarChart3, BookOpen, Trophy, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import AttendanceTrendsChart from "@/components/AttendanceTrendsChart";
import SubjectAttendanceTable from "@/components/SubjectAttendanceTable";

// Motivational quotes array
const motivationalQuotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "The only way to do great work is to love what you do.",
  "Your time is limited, don't waste it living someone else's life."
];

const SUBJECTS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "computer_science", label: "Computer Science" }
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    total: 0,
    percentage: 0,
    rank: 1,
    totalSubjects: SUBJECTS.length,
    totalClasses: 0
  });

  // Get random motivational quote
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    const currentStudent = localStorage.getItem("currentStudent");
    if (!currentStudent) {
      navigate("/student/login");
      return;
    }

    const studentData = JSON.parse(currentStudent);
    setStudent(studentData);

    // Calculate attendance statistics
    const attendance = studentData.attendance || [];
    
    // Calculate total classes and present/absent counts
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalClasses = 0;

    // Count classes for each subject
    SUBJECTS.forEach(subject => {
      const subjectAttendance = attendance.filter((a: any) => a.subject === subject.value);
      const presentInSubject = subjectAttendance.filter((a: any) => a.status === "present").length;
      const absentInSubject = subjectAttendance.filter((a: any) => a.status === "absent").length;
      
      totalPresent += presentInSubject;
      totalAbsent += absentInSubject;
      totalClasses += subjectAttendance.length;
    });

    const percentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    // Calculate rank
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    const attendanceRates = allStudents.map((s: any) => {
      const studentAttendance = s.attendance || [];
      let studentPresent = 0;
      let studentTotal = 0;

      SUBJECTS.forEach(subject => {
        const subjectAttendance = studentAttendance.filter((a: any) => a.subject === subject.value);
        studentPresent += subjectAttendance.filter((a: any) => a.status === "present").length;
        studentTotal += subjectAttendance.length;
      });

      return studentTotal > 0 ? (studentPresent / studentTotal) * 100 : 0;
    });

    const sortedRates = [...new Set(attendanceRates)].sort((a, b) => b - a);
    const rank = sortedRates.indexOf(percentage) + 1;

    setAttendanceStats({
      present: totalPresent,
      absent: totalAbsent,
      total: totalClasses,
      percentage,
      rank,
      totalSubjects: SUBJECTS.length,
      totalClasses
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentStudent");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {getGreeting()}, {student.name}!
                </h1>
                <p className="text-blue-100 mb-4">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
                <p className="text-blue-50 italic">{getRandomQuote()}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" className="text-white border-white hover:bg-blue-700">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Subjects</p>
                  <h3 className="text-2xl font-bold text-gray-900">{attendanceStats.totalSubjects}</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Classes</p>
                  <h3 className="text-2xl font-bold text-gray-900">{attendanceStats.totalClasses}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Class Rank</p>
                  <h3 className="text-2xl font-bold text-gray-900">#{attendanceStats.rank}</h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Attendance</p>
                  <h3 className="text-2xl font-bold text-blue-600">{attendanceStats.percentage}%</h3>
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
          {/* Attendance Trends Chart */}
          <div className="md:col-span-2">
            <AttendanceTrendsChart attendance={student.attendance || []} />
          </div>

          {/* Student Profile */}
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Student Profile</CardTitle>
              </div>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-muted-foreground">Full Name</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{student.email}</div>
                  <div className="text-sm text-muted-foreground">Email Address</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{student.class} - Section {student.section}</div>
                  <div className="text-sm text-muted-foreground">Semester {student.semester}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Attendance Table */}
        <div className="mt-6">
          <SubjectAttendanceTable attendance={student.attendance || []} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;