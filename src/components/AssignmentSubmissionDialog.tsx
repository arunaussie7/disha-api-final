import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  description: string;
  questions: string[];
  dueDate: string;
}

interface AssignmentSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment;
  studentName: string;
}

const AssignmentSubmissionDialog = ({
  open,
  onOpenChange,
  assignment,
  studentName
}: AssignmentSubmissionDialogProps) => {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<string[]>(assignment.questions.map(() => ""));

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would normally send this to your backend
      // For now, we'll just store it in localStorage
      const assignments = JSON.parse(localStorage.getItem("assignments") || "[]");
      const assignmentIndex = assignments.findIndex((a: Assignment) => a.id === assignment.id);
      
      if (assignmentIndex !== -1) {
        if (!assignments[assignmentIndex].submissions) {
          assignments[assignmentIndex].submissions = [];
        }
        
        assignments[assignmentIndex].submissions.push({
          studentName,
          answers,
          submittedAt: new Date().toISOString()
        });
        
        localStorage.setItem("assignments", JSON.stringify(assignments));
      }

      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Assignment Details</h3>
            <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Subject: {assignment.subject}</span>
              <span>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-6">
            {assignment.questions.map((question, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Question {index + 1}:
                </label>
                <p className="text-gray-700 mb-2">{question}</p>
                <Textarea
                  value={answers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Type your answer here..."
                  className="h-24"
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600">
              Submit Assignment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentSubmissionDialog;
