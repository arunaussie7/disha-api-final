import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';

interface AttendanceTrendsChartProps {
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

const AttendanceTrendsChart = ({ attendance }: AttendanceTrendsChartProps) => {
  // Get the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return format(date, 'yyyy-MM-dd');
  });

  // Process attendance data for each day
  const chartData = last30Days.map(date => {
    const dayAttendance = attendance.filter(a => a.date === date);
    
    // Calculate attendance percentage for the day across all subjects
    const presentCount = dayAttendance.filter(a => a.status === 'present').length;
    const totalCount = dayAttendance.length;
    const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

    // Calculate 7-day moving average
    const last7Days = attendance.filter(a => {
      const attendanceDate = new Date(a.date);
      const currentDate = new Date(date);
      const diffTime = Math.abs(currentDate.getTime() - attendanceDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });

    const movingAveragePresent = last7Days.filter(a => a.status === 'present').length;
    const movingAverageTotal = last7Days.length;
    const movingAverage = movingAverageTotal > 0 
      ? (movingAveragePresent / movingAverageTotal) * 100 
      : 0;

    return {
      date: format(new Date(date), 'MMM d'),
      percentage: Math.round(percentage),
      movingAverage: Math.round(movingAverage)
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={6}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Attendance']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="Daily Attendance"
              />
              <Line
                type="monotone"
                dataKey="movingAverage"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                name="7-day Average"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span className="text-sm text-gray-600">Daily Attendance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-600 rounded-full" />
            <span className="text-sm text-gray-600">7-day Average</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTrendsChart;