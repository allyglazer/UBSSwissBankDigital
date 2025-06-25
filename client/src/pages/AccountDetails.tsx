import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Lock, Settings, Snowflake } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Account, Transaction } from "@/types";
import { TransactionList } from "@/components/TransactionList";
import { PinPrompt } from "@/components/PinPrompt";
import { SecurityAlert } from "@/components/SecurityAlert";
import { AccountCard } from "@/components/AccountCard";

export default function AccountDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [currentAction, setCurrentAction] = useState("");

  // Fetch account details
  const { data: account, isLoading: accountLoading } = useQuery<Account>({
    queryKey: [`/api/accounts/${id}`],
    enabled: !!id,
  });

  // Fetch account transactions
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/account/${id}`],
    enabled: !!id,
  });

  const handlePinAction = (action: string) => {
    setCurrentAction(action);
    if (account?.accountType === "credit_card" && account.isFrozen) {
      setShowSecurityAlert(true);
    } else {
      setShowPinPrompt(true);
    }
  };

  const handleSecurityRestricted = () => {
    setShowSecurityAlert(true);
  };

  const handlePinConfirm = (pin: string) => {
    setShowPinPrompt(false);
    // Handle different actions based on currentAction
    switch (currentAction) {
      case "freeze":
        // Handle account freeze
        break;
      case "settings":
        // Handle account settings
        break;
      case "transfer":
        setLocation("/transfer");
        break;
      default:
        break;
    }
  };

  if (accountLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ubs-red"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested account could not be found.</p>
          <Button onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Account Details
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <AccountCard account={account} className="w-full" />
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setLocation("/transfer")}
                className="w-full bg-ubs-red hover:bg-red-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Transfer Funds
              </Button>
              
              {account.accountType === "credit_card" && account.isFrozen ? (
                <Button
                  onClick={handleSecurityRestricted}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  <Snowflake className="mr-2 h-4 w-4" />
                  Unfreeze Card
                </Button>
              ) : (
                <Button
                  onClick={() => handlePinAction("freeze")}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Snowflake Account
                </Button>
              )}
              
              <Button
                onClick={() => handlePinAction("settings")}
                variant="outline"
                className="w-full"
              >
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              showFilters={true}
              title="Transaction History"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <PinPrompt
        isOpen={showPinPrompt}
        onClose={() => setShowPinPrompt(false)}
        onConfirm={handlePinConfirm}
        title="Enter PIN"
        description="Please enter your 4-digit PIN to continue"
      />

      <SecurityAlert
        isOpen={showSecurityAlert}
        onClose={() => setShowSecurityAlert(false)}
        message="Contact support for security purposes."
      />
    </div>
  );
}
