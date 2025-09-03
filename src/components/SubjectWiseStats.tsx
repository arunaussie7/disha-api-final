import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface Student {
  id: number;
  name: string;
  attendance: Array<{
    date: string;
    status: 'present' | 'absent';
    subject: string;
  }>;
}

interface SubjectWiseStatsProps {
  students: Student[];
}

const SUBJECTS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "computer_science", label: "Computer Science" }
];

const SubjectWiseStats = ({ students }: SubjectWiseStatsProps) => {
  const today = new Date().toISOString().split('T')[0];

  const getSubjectStats = (subject: string) => {
    let present = 0;
    let absent = 0;

    students.forEach(student => {
      const todayAttendance = student.attendance?.find(
        a => a.date === today && a.subject === subject
      );
      
      if (todayAttendance) {
        if (todayAttendance.status === 'present') present++;
        else if (todayAttendance.status === 'absent') absent++;
      }
    });

    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, total, percentage };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <CardTitle>Subject-wise Attendance Today</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {SUBJECTS.map(subject => {
            const stats = getSubjectStats(subject.value);
            return (
              <div key={subject.value} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">{subject.label}</h4>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-green-600">Present: {stats.present}</p>
                    <p className="text-sm text-red-600">Absent: {stats.absent}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectWiseStats;