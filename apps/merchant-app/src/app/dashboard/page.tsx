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
import { userApi, transactionApi, payRequestApi } from "@/lib/api";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { FileText } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const isUserAuthenticated = isAuthenticated();

  const [consumerEmail, setConsumerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  useEffect(() => {
    if (!isUserAuthenticated) {
      router.push("/login");
    }
  }, [router, isUserAuthenticated]);

  const { data: balanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      const response = await userApi.getBalance();
      return response.data;
    },
    enabled: isUserAuthenticated,
  });

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: async () => {
      const response = await transactionApi.getHistory({ limit: 10 });
      return response.data;
    },
    enabled: isUserAuthenticated,
  });

  const createPayRequestMutation = useMutation({
    mutationFn: async () => {
      const amountInCents = pesosToCents(parseFloat(amount));
      
      const response = await payRequestApi.create({
        consumerEmail,
        amount: amountInCents,
        message: message || undefined,
      });
      return response;
    },
    onSuccess: () => {
      setConsumerEmail("");
      setAmount("");
      setMessage("");
      setRequestError("");
      setRequestSuccess("Pay request sent successfully!");

      queryClient.invalidateQueries({ queryKey: ["payRequests"] });

      setTimeout(() => setRequestSuccess(""), 3000);
    },
    onError: (error: Error) => {
      setRequestError(error.message);
      setRequestSuccess("");
    },
  });

  const handleCreatePayRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError("");
    setRequestSuccess("");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setRequestError("Please enter a valid amount");
      return;
    }

    createPayRequestMutation.mutate();
  };

  if (!isUserAuthenticated) {
    return null;
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
          <div className="lg:col-span-1">
            <BalanceCard
              balance={balanceData?.balance || 0}
              onRefresh={() => refetchBalance()}
              isLoading={isLoadingBalance}
            />
          </div>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create Pay Request
              </CardTitle>
              <CardDescription>Request payment from a consumer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePayRequest} className="space-y-4">
                {requestError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                    {requestError}
                  </div>
                )}
                {requestSuccess && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                    {requestSuccess}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="consumerEmail">Consumer Email</Label>
                    <Input
                      id="consumerEmail"
                      type="email"
                      placeholder="consumer@example.com"
                      value={consumerEmail}
                      onChange={(e) => setConsumerEmail(e.target.value)}
                      required
                      disabled={createPayRequestMutation.isPending}
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
                      disabled={createPayRequestMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Input
                    id="message"
                    type="text"
                    placeholder="Invoice #123, Service fee, etc."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={createPayRequestMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createPayRequestMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {createPayRequestMutation.isPending ? "Sending..." : "Send Pay Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest received payments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <p className="text-center py-8 text-muted-foreground">Loading transactions...</p>
            ) : (
              <TransactionList
                transactions={transactionsData?.transactions || []}
                currentUserId={currentUser?.id}
                emptyMessage="No transactions yet. Send a pay request to get started!"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

