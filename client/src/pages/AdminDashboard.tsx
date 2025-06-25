import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Bell, 
  LogOut,
  Shield,
  Search,
  Eye,
  Settings,
  Ban
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Transaction } from "@/types";
import { UserFundsModal } from "@/components/UserFundsModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserFunds, setShowUserFunds] = useState(false);

  // Fetch all users
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.username === "admin",
  });

  // Fetch pending users
  const { data: pendingUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users/pending"],
    enabled: user?.username === "admin",
  });

  // Fetch pending transactions
  const { data: pendingTransactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/pending"],
    enabled: user?.username === "admin",
  });

  // User approval mutation
  const approveUserMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest("POST", `/api/admin/users/${userId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/pending"] });
      toast({
        title: "Success",
        description: "User approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    },
  });

  // User ban mutation
  const banUserMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest("POST", `/api/admin/users/${userId}/ban`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User banned successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    },
  });

  // Transaction approval mutation
  const approveTransactionMutation = useMutation({
    mutationFn: (transactionId: number) =>
      apiRequest("PUT", `/api/transactions/${transactionId}`, { status: "approved" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      toast({
        title: "Success",
        description: "Transaction approved successfully",
      });
    },
  });

  // Transaction rejection mutation
  const rejectTransactionMutation = useMutation({
    mutationFn: (transactionId: number) =>
      apiRequest("PUT", `/api/transactions/${transactionId}`, { status: "rejected" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      toast({
        title: "Success",
        description: "Transaction rejected successfully",
      });
    },
  });

  const handleSignOut = async () => {
    await signOut();
    setLocation("/login");
  };

  const handleManageUserFunds = async (targetUser: User) => {
    setSelectedUser(targetUser);
    setShowUserFunds(true);
  };

  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.ubsId.includes(searchTerm)
  );

  const getUserInitials = (username: string) => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user?.username !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Navigation */}
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-ubs-gold rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold">UBS Admin Panel</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                onClick={handleSignOut}
                className="bg-ubs-red hover:bg-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allUsers.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pendingUsers.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pendingTransactions.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Pending Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allUsers.filter(u => u.isBanned).length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Banned Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUsers.map((targetUser) => (
                  <div
                    key={targetUser.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-ubs-gold rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {getUserInitials(targetUser.username)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {targetUser.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          UBS ID: {targetUser.ubsId}
                        </div>
                        <div className="flex space-x-2 mt-1">
                          {!targetUser.isApproved && (
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                          )}
                          {targetUser.isBanned && (
                            <Badge variant="destructive" className="text-xs">Banned</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {/* Show user details */}}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleManageUserFunds(targetUser)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      {!targetUser.isBanned && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => banUserMutation.mutate(targetUser.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Management */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No pending transactions
                  </div>
                ) : (
                  pendingTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.transactionType} - ${transaction.amount}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(transaction.transactionDate)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveTransactionMutation.mutate(transaction.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectTransactionMutation.mutate(transaction.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Funds Modal */}
      {selectedUser && (
        <UserFundsModal
          isOpen={showUserFunds}
          onClose={() => {
            setShowUserFunds(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          accounts={[]} // Would need to fetch user's accounts
          onTransactionCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
          }}
        />
      )}
    </div>
  );
}
