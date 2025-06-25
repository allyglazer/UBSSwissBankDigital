import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, PiggyBank, Building, DollarSign } from "lucide-react";
import { Account } from "@/types";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
  className?: string;
}

export function AccountCard({ account, onClick, className }: AccountCardProps) {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case "current":
      case "business_current":
        return <CreditCard className="h-6 w-6 opacity-60" />;
      case "savings":
      case "business_savings":
        return <PiggyBank className="h-6 w-6 opacity-60" />;
      case "treasury":
        return <Building className="h-6 w-6 opacity-60" />;
      default:
        return <DollarSign className="h-6 w-6 opacity-60" />;
    }
  };

  const getAccountGradient = (type: string) => {
    switch (type) {
      case "current":
      case "business_current":
        return "bg-gradient-to-br from-ubs-red to-ubs-gold";
      case "savings":
      case "business_savings":
        return "bg-gradient-to-br from-green-500 to-emerald-600";
      case "credit_card":
        return "bg-gradient-to-br from-gray-800 to-ubs-red";
      case "treasury":
        return "bg-gradient-to-br from-purple-500 to-indigo-600";
      default:
        return "bg-gradient-to-br from-blue-500 to-cyan-600";
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  return (
    <Card
      className={cn(
        "w-80 cursor-pointer transform hover:scale-105 transition-all duration-300",
        getAccountGradient(account.accountType),
        "text-white border-0",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{account.accountName}</h3>
            <p className="text-white/80 text-sm">UBS ID: {account.ubsId}</p>
            {account.isFrozen && (
              <Badge className="mt-2 bg-red-500 text-white">FROZEN</Badge>
            )}
          </div>
          {getAccountIcon(account.accountType)}
        </div>
        
        <div className="text-2xl font-bold mb-2">
          {account.accountType === "credit_card" && account.isFrozen
            ? "**** **** **** ****"
            : formatBalance(account.balance)
          }
        </div>
        
        <div className="text-sm opacity-80">
          {account.accountType === "credit_card" 
            ? "Available Credit" 
            : account.accountType.includes("savings") 
              ? "Savings Balance"
              : "Available Balance"
          }
        </div>
      </CardContent>
    </Card>
  );
}
