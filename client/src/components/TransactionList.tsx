import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, RefreshCw, Filter } from "lucide-react";
import { Transaction } from "@/types";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  showFilters?: boolean;
  title?: string;
  onViewAll?: () => void;
}

export function TransactionList({ 
  transactions, 
  showFilters = false, 
  title = "Recent Transactions",
  onViewAll 
}: TransactionListProps) {
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "debit":
        return <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "transfer":
        return <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (type === "credit" || numAmount > 0) {
      return "text-green-600";
    } else if (type === "debit" || numAmount < 0) {
      return "text-red-600";
    }
    return "text-gray-600 dark:text-gray-400";
  };

  const formatAmount = (amount: string, type: string) => {
    const num = parseFloat(amount);
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(num));

    if (type === "credit") {
      return `+${formattedAmount}`;
    } else if (type === "debit") {
      return `-${formattedAmount}`;
    }
    return formattedAmount;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" onClick={onViewAll} className="text-ubs-red hover:text-red-700">
              View All
            </Button>
          )}
        </div>
        
        {showFilters && (
          <div className="flex space-x-2 mt-4">
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credits</SelectItem>
                <SelectItem value="debit">Debits</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" className="w-40" />
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No transactions found
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    transaction.transactionType === "credit" 
                      ? "bg-green-100 dark:bg-green-900"
                      : transaction.transactionType === "debit"
                        ? "bg-red-100 dark:bg-red-900"
                        : "bg-blue-100 dark:bg-blue-900"
                  )}>
                    {getTransactionIcon(transaction.transactionType)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {transaction.description || `${transaction.transactionType} Transaction`}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.transactionDate)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-semibold",
                    getTransactionColor(transaction.transactionType, transaction.amount)
                  )}>
                    {formatAmount(transaction.amount, transaction.transactionType)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
