/**
 * Dashboard Page (Consumer)
 * 
 * Main dashboard showing:
 * - Current balance with refresh button
 * - Quick transfer form
 * - Recent transactions
 * 
 * Inspired by Kraken's clean, data-focused layout
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  BalanceCard,
  TransactionList,
  pesosToCents,
} from "@paynxt/ui";
import { Navbar } from "@/components/navbar";
import { userApi, transactionApi } from "@/lib/api";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { Send } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();

  // Transfer form state
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  /**
   * Fetch user balance
   * Uses React Query for caching and automatic refetching
   */
  const { data: balanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      const response = await userApi.getBalance();
      return response.data;
    },
    enabled: isAuthenticated(),
  });

  /**
   * Fetch recent transactions
   * Shows last 10 transactions
   */
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: async () => {
      const response = await transactionApi.getHistory({ limit: 10 });
      return response.data;
    },
    enabled: isAuthenticated(),
  });

  /**
   * Transfer mutation
   * Creates a new transfer and refreshes data
   */
  const transferMutation = useMutation({
    mutationFn: async () => {
      // Convert pesos to cents for API
      const amountInCents = pesosToCents(parseFloat(amount));
      
      const response = await transactionApi.transfer({
        toEmail: recipientEmail,
        amount: amountInCents,
      });
      return response;
    },
    onSuccess: () => {
      // Clear form
      setRecipientEmail("");
      setAmount("");
      setTransferError("");
      setTransferSuccess("Transfer initiated! Processing in background.");

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });

      // Clear success message after 3 seconds
      setTimeout(() => setTransferSuccess(""), 3000);
    },
    onError: (error: Error) => {
      setTransferError(error.message);
      setTransferSuccess("");
    },
  });

  /**
   * Handle transfer form submission
   */
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferError("Please enter a valid amount");
      return;
    }

    transferMutation.mutate();
  };

  if (!isAuthenticated()) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.email}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <BalanceCard
              balance={balanceData?.balance || 0}
              onRefresh={() => refetchBalance()}
              isLoading={isLoadingBalance}
            />
          </div>

          {/* Quick Transfer Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Quick Transfer
              </CardTitle>
              <CardDescription>Send money to another user</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                {transferError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                    {transferError}
                  </div>
                )}
                {transferSuccess && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                    {transferSuccess}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Recipient Email</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      required
                      disabled={transferMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₱)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="100.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      disabled={transferMutation.isPending}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={transferMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {transferMutation.isPending ? "Processing..." : "Send Money"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest 10 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <p className="text-center py-8 text-muted-foreground">Loading transactions...</p>
            ) : (
              <TransactionList
                transactions={transactionsData?.transactions || []}
                currentUserId={currentUser?.id}
                emptyMessage="No transactions yet. Start by sending money!"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

