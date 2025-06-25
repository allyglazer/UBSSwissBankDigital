import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Send, Info, RefreshCw, Building } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Account } from "@/types";
import { PinPrompt } from "@/components/PinPrompt";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Transfer() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [transferType, setTransferType] = useState<"internal" | "external">("internal");
  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountId: "",
    recipientUbsId: "",
    amount: "",
    description: "",
  });
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch user accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: [`/api/accounts/user/${user?.id}`],
    enabled: !!user?.id,
  });

  const createTransferMutation = useMutation({
    mutationFn: async (transferData: any) => {
      return apiRequest("POST", "/api/transactions", transferData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/accounts/user/${user?.id}`] });
      toast({
        title: "Transfer Initiated",
        description: "Your transfer request has been submitted and is pending approval.",
      });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Transfer Failed",
        description: "Unable to process your transfer request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromAccountId || !formData.amount || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (transferType === "external" && !formData.recipientUbsId) {
      toast({
        title: "Missing Recipient",
        description: "Please enter the recipient's UBS ID.",
        variant: "destructive",
      });
      return;
    }

    if (transferType === "internal" && !formData.toAccountId) {
      toast({
        title: "Missing Destination",
        description: "Please select a destination account.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid transfer amount.",
        variant: "destructive",
      });
      return;
    }

    // Check sufficient balance
    const fromAccount = accounts.find(acc => acc.id.toString() === formData.fromAccountId);
    if (fromAccount && parseFloat(fromAccount.balance) < amount) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance in the selected account.",
        variant: "destructive",
      });
      return;
    }

    setShowPinPrompt(true);
  };

  const handlePinConfirm = async (pin: string) => {
    setShowPinPrompt(false);
    setIsProcessing(true);

    try {
      // In a real implementation, validate PIN first
      if (pin.length !== 4) {
        throw new Error("Invalid PIN");
      }

      const transferData = {
        fromAccountId: parseInt(formData.fromAccountId),
        toAccountId: transferType === "internal" ? parseInt(formData.toAccountId) : undefined,
        amount: formData.amount,
        transactionType: "transfer" as const,
        description: `${transferType === "internal" ? "Internal" : "External"} transfer: ${formData.description}`,
      };

      // Add recipient info for external transfers
      if (transferType === "external") {
        transferData.description += ` | To UBS ID: ${formData.recipientUbsId}`;
      }

      await createTransferMutation.mutateAsync(transferData);
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Invalid PIN or transfer error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getAvailableBalance = () => {
    const selectedAccount = accounts.find(acc => acc.id.toString() === formData.fromAccountId);
    return selectedAccount ? parseFloat(selectedAccount.balance) : 0;
  };

  const getInternalAccounts = () => {
    return accounts.filter(acc => acc.id.toString() !== formData.fromAccountId);
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (accountsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your accounts...</p>
        </div>
      </div>
    );
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Transfer Funds</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="mr-2 h-5 w-5" />
              Transfer Money
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transfer Type Selection */}
              <div>
                <Label className="text-base font-medium">Transfer Type</Label>
                <RadioGroup
                  value={transferType}
                  onValueChange={(value: "internal" | "external") => setTransferType(value)}
                  className="grid grid-cols-2 gap-4 mt-3"
                >
                  <div>
                    <RadioGroupItem value="internal" id="internal" className="peer sr-only" />
                    <Label
                      htmlFor="internal"
                      className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-ubs-red transition-colors cursor-pointer peer-checked:border-ubs-red peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Between My Accounts</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Internal transfer</div>
                      </div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="external" id="external" className="peer sr-only" />
                    <Label
                      htmlFor="external"
                      className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-ubs-red transition-colors cursor-pointer peer-checked:border-ubs-red peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20"
                    >
                      <Building className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">To Another User</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">External transfer</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* From Account */}
              <div>
                <Label htmlFor="fromAccountId">From Account *</Label>
                <Select 
                  value={formData.fromAccountId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, fromAccountId: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        <div className="flex justify-between items-center w-full">
                          <span>{account.accountName}</span>
                          <span className="ml-4 text-sm text-gray-500">
                            ${parseFloat(account.balance).toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.fromAccountId && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Available Balance: ${getAvailableBalance().toLocaleString()}
                  </p>
                )}
              </div>

              {/* To Account / Recipient */}
              {transferType === "internal" ? (
                <div>
                  <Label htmlFor="toAccountId">To Account *</Label>
                  <Select 
                    value={formData.toAccountId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, toAccountId: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      {getInternalAccounts().map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div className="flex justify-between items-center w-full">
                            <span>{account.accountName}</span>
                            <span className="ml-4 text-sm text-gray-500">
                              ${parseFloat(account.balance).toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="recipientUbsId">Recipient UBS ID *</Label>
                  <Input
                    id="recipientUbsId"
                    name="recipientUbsId"
                    value={formData.recipientUbsId}
                    onChange={handleInputChange}
                    placeholder="Enter 9-digit UBS ID"
                    className="mt-2"
                    maxLength={9}
                    pattern="[0-9]{9}"
                    required={transferType === "external"}
                  />
                </div>
              )}

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={getAvailableBalance()}
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="pl-8"
                    required
                  />
                </div>
                {formData.amount && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Amount in words: {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(parseFloat(formData.amount) || 0)}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What's this transfer for?"
                  className="mt-2"
                  rows={3}
                  required
                />
              </div>

              {/* Transfer Summary */}
              {formData.fromAccountId && formData.amount && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    <div className="space-y-1">
                      <div>Transfer Amount: <strong>${parseFloat(formData.amount).toLocaleString()}</strong></div>
                      <div>Remaining Balance: <strong>${(getAvailableBalance() - parseFloat(formData.amount)).toLocaleString()}</strong></div>
                      <div className="text-sm mt-2">
                        {transferType === "internal" 
                          ? "Internal transfers are processed instantly after approval."
                          : "External transfers may take 1-3 business days after approval."
                        }
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Admin Approval Notice */}
              <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  <strong>Admin Approval Required:</strong> All transfers require PIN verification and admin approval before processing.
                </AlertDescription>
              </Alert>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing || createTransferMutation.isPending}
                  className="flex-1 bg-ubs-red hover:bg-red-700"
                >
                  {isProcessing || createTransferMutation.isPending ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Continue with Transfer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* PIN Prompt Modal */}
      <PinPrompt
        isOpen={showPinPrompt}
        onClose={() => setShowPinPrompt(false)}
        onConfirm={handlePinConfirm}
        title="Authorize Transfer"
        description="Please enter your 4-digit PIN to authorize this transfer"
      />
    </div>
  );
}
