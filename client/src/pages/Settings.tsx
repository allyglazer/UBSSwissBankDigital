import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Shield, Globe, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { PinPrompt } from "@/components/PinPrompt";
import { SecurityAlert } from "@/components/SecurityAlert";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  
  // Settings state
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const handlePinAction = (action: string) => {
    setCurrentAction(action);
    setShowPinPrompt(true);
  };

  const handleSecurityRestricted = () => {
    setShowSecurityAlert(true);
  };

  const handlePinConfirm = (pin: string) => {
    setShowPinPrompt(false);
    
    if (currentAction === "changePin") {
      toast({
        title: "PIN Changed",
        description: "Your PIN has been successfully updated.",
      });
    }
  };

  const handlePreferenceChange = (setting: string, value: any) => {
    switch (setting) {
      case "currency":
        setCurrency(value);
        toast({
          title: "Currency Updated",
          description: `Default currency changed to ${value}`,
        });
        break;
      case "language":
        setLanguage(value);
        toast({
          title: "Language Updated",
          description: "Language preference has been updated",
        });
        break;
      case "emailNotifications":
        setEmailNotifications(value);
        break;
      case "loginAlerts":
        setLoginAlerts(value);
        break;
    }
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setLocation("/dashboard")}
                className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* PIN Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                PIN Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Update your security PIN for transactions and account access.
              </p>
              <Button 
                onClick={() => handlePinAction("changePin")}
                className="bg-ubs-red hover:bg-red-700"
              >
                Change PIN
              </Button>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Email Address</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={handleSecurityRestricted}
                    className="text-ubs-red hover:text-red-700 text-sm font-medium"
                  >
                    Change
                  </Button>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Username</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.username}</div>
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={handleSecurityRestricted}
                    className="text-ubs-red hover:text-red-700 text-sm font-medium"
                  >
                    Change
                  </Button>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Account Type</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {user.accountType}
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={handleSecurityRestricted}
                    className="text-ubs-red hover:text-red-700 text-sm font-medium"
                  >
                    Change
                  </Button>
                </div>

                <div className="flex justify-between items-center py-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">ID Document</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Verified - Status: Approved
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={handleSecurityRestricted}
                    className="text-ubs-red hover:text-red-700 text-sm font-medium"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Default Currency</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Choose your preferred currency for account displays
                    </div>
                  </div>
                  <Select value={currency} onValueChange={(value) => handlePreferenceChange("currency", value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" />
                          USD
                        </div>
                      </SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Language</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Select your preferred interface language
                    </div>
                  </div>
                  <Select value={language} onValueChange={(value) => handlePreferenceChange("language", value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="de">🇩🇪 German</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                      <SelectItem value="it">🇮🇹 Italian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Email Notifications</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Receive account alerts and transaction updates via email
                    </div>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">SMS Notifications</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Receive important security alerts via SMS
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSecurityRestricted}
                  >
                    Setup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <Button 
                    onClick={handleSecurityRestricted}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Enable
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Login Alerts</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified when your account is accessed from new devices
                    </div>
                  </div>
                  <Switch
                    checked={loginAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange("loginAlerts", checked)}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Session Management</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      View and manage active sessions across devices
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleSecurityRestricted}
                  >
                    Manage
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Download Data</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Export your account data and transaction history
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleSecurityRestricted}
                  >
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Temporarily Disable Account</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Temporarily suspend account access for security
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleSecurityRestricted}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Disable
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Close Account</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Permanently close your UBS account
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleSecurityRestricted}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <PinPrompt
        isOpen={showPinPrompt}
        onClose={() => setShowPinPrompt(false)}
        onConfirm={handlePinConfirm}
        title="Enter Current PIN"
        description="Please enter your current 4-digit PIN to continue"
      />

      <SecurityAlert
        isOpen={showSecurityAlert}
        onClose={() => setShowSecurityAlert(false)}
        message="Contact your manager for security purposes."
        title="Security Restriction"
      />
    </div>
  );
}
