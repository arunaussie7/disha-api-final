import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, BarChart3 } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-400">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Student Management System
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            A modern platform for managing student attendance, tracking academic progress, 
            and streamlining educational administration.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Student Card */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Student Portal</CardTitle>
                <CardDescription className="text-lg">
                  Access your dashboard, view attendance records, and track your academic progress.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span>View attendance statistics</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Track class participation</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link to="/student/login" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                      Student Login
                    </Button>
                  </Link>
                  <Link to="/student/signup" className="block">
                    <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" size="lg">
                      Create Student Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Card */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Teacher Portal</CardTitle>
                <CardDescription className="text-lg">
                  Manage students, take attendance, and monitor class performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>Manage student records</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span>Take attendance</span>
                  </div>
                </div>
                <Link to="/teacher/login" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    Teacher Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Platform Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-white/10 rounded-full w-fit mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-white/80 text-sm">Comprehensive attendance tracking with visual charts and statistics</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-white/10 rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Student Management</h3>
                <p className="text-white/80 text-sm">Easy-to-use interface for managing student records and profiles</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-white/10 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Role-Based Access</h3>
                <p className="text-white/80 text-sm">Secure login system with distinct student and teacher portals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;