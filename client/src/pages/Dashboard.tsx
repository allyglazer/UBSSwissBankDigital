import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Send, Plus, RefreshCw, MoreHorizontal, CreditCard, Smartphone, Building, Receipt, DollarSign, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AccountCard } from "@/components/AccountCard";
import { TransactionList } from "@/components/TransactionList";
import { SecurityAlert } from "@/components/SecurityAlert";
import { PinPrompt } from "@/components/PinPrompt";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Account, Transaction } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [currentAction, setCurrentAction] = useState("");

  // Fetch user accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: [`/api/accounts/user/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch recent transactions for all user accounts
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/recent/${user?.id}`],
    enabled: !!user?.id && accounts.length > 0,
    queryFn: async () => {
      // Get transactions for all accounts
      const allTransactions: Transaction[] = [];
      for (const account of accounts) {
        const response = await fetch(`/api/transactions/account/${account.id}`, {
          credentials: "include",
        });
        if (response.ok) {
          const accountTransactions = await response.json();
          allTransactions.push(...accountTransactions);
        }
      }
      // Sort by date and return recent ones
      return allTransactions
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 5);
    },
  });

  const handleQuickAction = (action: string) => {
    if (action === "transfer") {
      setLocation("/transfer");
    } else {
      setCurrentAction(action);
      setShowPinPrompt(true);
    }
  };

  const handleSecurityRestricted = () => {
    setShowSecurityAlert(true);
  };

  const handlePinConfirm = (pin: string) => {
    // In a real app, validate PIN here
    setShowPinPrompt(false);
    if (currentAction === "transfer") {
      setLocation("/transfer");
    }
    // Handle other PIN-protected actions
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => {
      return total + parseFloat(account.balance || "0");
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar 
        onShowSettings={() => setLocation("/settings")}
        onShowSupport={handleSecurityRestricted}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-ubs-red to-ubs-gold text-white mb-8 border-0">
          <CardContent className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Hello, {user.username}
                </h1>
                <p className="text-white/80 mb-6">
                  Welcome back to your UBS Digital Banking
                </p>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm opacity-80">Total Balance</span>
                  <span className="text-4xl font-bold">
                    {formatCurrency(getTotalBalance())}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm opacity-80">UBS ID</div>
                <div className="text-xl font-mono">{user.ubsId}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Button
                onClick={() => handleQuickAction("transfer")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0"
              >
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
              <Button
                onClick={handleSecurityRestricted}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Deposit
              </Button>
              <Button
                onClick={() => handleQuickAction("transfer")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Transfer
              </Button>
              
              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0">
                    <MoreHorizontal className="mr-2 h-4 w-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={handleSecurityRestricted}>
                    <CreditCard className="mr-3 h-4 w-4" />
                    POS Fast Pay
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSecurityRestricted}>
                    <Smartphone className="mr-3 h-4 w-4" />
                    Virtual Card
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSecurityRestricted}>
                    <Building className="mr-3 h-4 w-4" />
                    Wire Transfer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSecurityRestricted}>
                    <Receipt className="mr-3 h-4 w-4" />
                    Bill Payment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSecurityRestricted}>
                    <DollarSign className="mr-3 h-4 w-4" />
                    Loans
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSecurityRestricted}>
                    <TrendingUp className="mr-3 h-4 w-4" />
                    Investments
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Account Cards Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Accounts
          </h2>
          
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {accountsLoading ? (
              <div className="flex space-x-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-80 h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onClick={() => setLocation(`/account/${account.id}`)}
                />
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <TransactionList
          transactions={transactions}
          onViewAll={() => setLocation("/transactions")}
        />
      </div>

      {/* Modals */}
      <SecurityAlert
        isOpen={showSecurityAlert}
        onClose={() => setShowSecurityAlert(false)}
      />
      
      <PinPrompt
        isOpen={showPinPrompt}
        onClose={() => setShowPinPrompt(false)}
        onConfirm={handlePinConfirm}
        title="Enter PIN"
        description="Please enter your 4-digit PIN to continue"
      />
    </div>
  );
}
