import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { User, Account } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  accounts: Account[];
  onTransactionCreated?: () => void;
}

export function UserFundsModal({ 
  isOpen, 
  onClose, 
  user, 
  accounts,
  onTransactionCreated 
}: UserFundsModalProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccountId || !amount || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const transactionData = {
        [transactionType === "credit" ? "toAccountId" : "fromAccountId"]: parseInt(selectedAccountId),
        amount: parseFloat(amount).toString(),
        transactionType,
        description: `Admin ${transactionType}: ${description}`,
      };

      await apiRequest("POST", "/api/transactions", transactionData);

      // Update account balance
      const account = accounts.find(acc => acc.id === parseInt(selectedAccountId));
      if (account) {
        const currentBalance = parseFloat(account.balance);
        const newBalance = transactionType === "credit" 
          ? currentBalance + parseFloat(amount)
          : currentBalance - parseFloat(amount);

        await apiRequest("PUT", `/api/accounts/${selectedAccountId}`, {
          balance: newBalance.toFixed(2)
        });
      }

      toast({
        title: "Success",
        description: "Transaction processed successfully",
      });

      // Reset form
      setSelectedAccountId("");
      setAmount("");
      setDescription("");
      setTransactionType("credit");
      
      onTransactionCreated?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getUserInitials = (username: string) => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User Funds</DialogTitle>
        </DialogHeader>
        
        {user && (
          <div className="mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-ubs-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-white">
                  {getUserInitials(user.username)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                UBS ID: {user.ubsId}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="account">Select Account</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.accountName} - ${account.balance}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transactionType">Transaction Type</Label>
            <Select 
              value={transactionType} 
              onValueChange={(value: "credit" | "debit") => setTransactionType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit (Add Money)</SelectItem>
                <SelectItem value="debit">Debit (Remove Money)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Transaction description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="flex space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="flex-1 bg-ubs-red hover:bg-red-700"
            >
              {isProcessing ? "Processing..." : "Process Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
