"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, TransactionList } from "@paynxt/ui";
import { Navbar } from "@/components/navbar";
import { transactionApi } from "@/lib/api";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { TransactionHistoryResponse } from "@paynxt/types";

export default function TransactionsPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const isUserAuthenticated = isAuthenticated();

  useEffect(() => {
    if (!isUserAuthenticated) {
      router.push("/login");
    }
  }, [router, isUserAuthenticated]);

  const { data: transactionsData, isLoading } = useQuery<TransactionHistoryResponse>({
    queryKey: ["transactions", "all"],
    queryFn: async (): Promise<TransactionHistoryResponse> => {
      const response = await transactionApi.getHistory({ limit: 100 });
      return response.data as TransactionHistoryResponse;
    },
    enabled: isUserAuthenticated,
  });

  if (!isUserAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground">
            View all your transactions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              {transactionsData?.total
                ? `Total: ${transactionsData.total} transaction${transactionsData.total !== 1 ? "s" : ""}`
                : "No transactions yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-12 text-muted-foreground">
                Loading transactions...
              </p>
            ) : (
              <TransactionList
                transactions={transactionsData?.transactions || []}
                currentUserId={currentUser?.id}
                emptyMessage="No transactions yet. Create a pay request to get started!"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

