import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CloudUpload, Info, User, Building } from "lucide-react";
import { useLocation } from "wouter";
import { signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    dateOfBirth: "",
    accountType: "personal",
    idCard: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, idCard: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real implementation, you would upload the ID card file first
      // For now, we'll just pass the filename
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        accountType: formData.accountType,
        idCardUrl: formData.idCard ? formData.idCard.name : undefined,
      };

      await signUp(userData);
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created and is pending admin approval.",
      });
      
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-ubs-red rounded-xl mb-4">
              <span className="text-white font-bold text-xl">UBS</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join UBS Swiss Digital Banking
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose username"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create password"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Account Type</Label>
                <RadioGroup
                  value={formData.accountType}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, accountType: value }))
                  }
                  className="grid grid-cols-2 gap-4 mt-3"
                >
                  <div>
                    <RadioGroupItem value="personal" id="personal" className="peer sr-only" />
                    <Label
                      htmlFor="personal"
                      className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-ubs-red transition-colors cursor-pointer peer-checked:border-ubs-red peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20"
                    >
                      <User className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Personal</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Individual banking</div>
                      </div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="business" id="business" className="peer sr-only" />
                    <Label
                      htmlFor="business"
                      className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-ubs-red transition-colors cursor-pointer peer-checked:border-ubs-red peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20"
                    >
                      <Building className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Business</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Company banking</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="idCard">ID Card Upload</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-ubs-red transition-colors mt-2">
                  <CloudUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Drop your ID card here or{" "}
                    <label htmlFor="idCard" className="text-ubs-red cursor-pointer hover:text-red-700">
                      browse files
                    </label>
                  </p>
                  <input
                    id="idCard"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {formData.idCard && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {formData.idCard.name}
                    </p>
                  )}
                </div>
              </div>

              <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  <strong>Admin Approval Required:</strong> Your account will be reviewed and activated within 24-48 hours after submission.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/login")}
                  className="flex-1"
                >
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-ubs-red hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
