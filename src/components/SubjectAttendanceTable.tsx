import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SubjectAttendance {
  subject: string;
  present: number;
  absent: number;
  total: number;
}

interface SubjectAttendanceTableProps {
  attendance: Array<{
    date: string;
    status: 'present' | 'absent';
    subject: string;
  }>;
}

const SUBJECTS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "computer_science", label: "Computer Science" }
];

const SubjectAttendanceTable = ({ attendance }: SubjectAttendanceTableProps) => {
  // Process attendance data by subject
  const subjectAttendance: SubjectAttendance[] = SUBJECTS.map(({ value, label }) => {
    const subjectData = attendance.filter(a => a.subject === value);
    const present = subjectData.filter(a => a.status === 'present').length;
    const absent = subjectData.filter(a => a.status === 'absent').length;
    const total = present + absent;
    return {
      subject: label,
      present,
      absent,
      total
    };
  });

  // Calculate overall attendance
  const totalPresent = subjectAttendance.reduce((sum, subject) => sum + subject.present, 0);
  const totalAbsent = subjectAttendance.reduce((sum, subject) => sum + subject.absent, 0);
  const totalClasses = totalPresent + totalAbsent;
  const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Subject</th>
                  <th className="text-center py-3 px-4">Present</th>
                  <th className="text-center py-3 px-4">Absent</th>
                  <th className="text-center py-3 px-4">Total</th>
                  <th className="text-center py-3 px-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {subjectAttendance.map((subject) => {
                  const percentage = subject.total > 0
                    ? Math.round((subject.present / subject.total) * 100)
                    : 0;
                  
                  return (
                    <tr key={subject.subject} className="border-b">
                      <td className="py-3 px-4 font-medium">{subject.subject}</td>
                      <td className="text-center py-3 px-4 text-green-600">{subject.present}</td>
                      <td className="text-center py-3 px-4 text-red-600">{subject.absent}</td>
                      <td className="text-center py-3 px-4">{subject.total}</td>
                      <td className="text-center py-3 px-4">
                        <Badge variant={percentage >= 75 ? "success" : "destructive"}>
                          {percentage}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Overall Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Classes Attended</p>
                <p className="text-2xl font-bold text-green-600">{totalPresent} Present</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Classes Missed</p>
                <p className="text-2xl font-bold text-red-600">{totalAbsent} Absent</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Overall Attendance Rate</p>
                <p className="text-sm font-medium">{overallPercentage}%</p>
              </div>
              <Progress value={overallPercentage} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">
                {overallPercentage >= 75 
                  ? "Good attendance! Keep it up!" 
                  : "Try to maintain at least 75% attendance"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectAttendanceTable;