"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  formatCurrency,
  formatDate,
} from "@paynxt/ui";
import { Navbar } from "@/components/navbar";
import { payRequestApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function PayRequestsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const { data: payRequestsData, isLoading } = useQuery({
    queryKey: ["payRequests", "received"],
    queryFn: async () => {
      const response = await payRequestApi.getReceived();
      return response.data;
    },
    enabled: isAuthenticated(),
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await payRequestApi.approve(id);
    },
    onSuccess: () => {
      setActionSuccess("Pay request approved! Payment processing in background.");
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["payRequests"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error: Error) => {
      setActionError(error.message);
      setActionSuccess("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await payRequestApi.reject(id);
    },
    onSuccess: () => {
      setActionSuccess("Pay request rejected.");
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["payRequests"] });
      
      setTimeout(() => setActionSuccess(""), 3000);
    },
    onError: (error: Error) => {
      setActionError(error.message);
      setActionSuccess("");
    },
  });

  if (!isAuthenticated()) {
    return null;
  }

  const payRequests = payRequestsData?.payRequests || [];
  const pendingRequests = payRequests.filter((pr) => pr.status === "PENDING");
  const completedRequests = payRequests.filter((pr) => pr.status !== "PENDING");

  const statusConfig = {
    PENDING: {
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      label: "Pending",
    },
    APPROVED: {
      icon: CheckCircle,
      color: "text-green-600 bg-green-50 border-green-200",
      label: "Approved",
    },
    REJECTED: {
      icon: XCircle,
      color: "text-red-600 bg-red-50 border-red-200",
      label: "Rejected",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pay Requests</h1>
          <p className="text-muted-foreground">
            Manage payment requests from merchants
          </p>
        </div>

        {actionError && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6 p-4 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
            {actionSuccess}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>
              {pendingRequests.length === 0
                ? "No pending requests"
                : `${pendingRequests.length} request${pendingRequests.length !== 1 ? "s" : ""} awaiting your action`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : pendingRequests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No pending pay requests
              </p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => {
                  const StatusIcon = statusConfig[request.status].icon;
                  return (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusIcon className="h-5 w-5 text-yellow-600" />
                            <span className="font-medium">
                              From: {request.merchant?.email}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-primary mb-2">
                            {formatCurrency(request.amount)}
                          </div>
                          {request.message && (
                            <p className="text-sm text-muted-foreground mb-2">
                              Message: {request.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Requested: {formatDate(request.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            onClick={() => approveMutation.mutate(request.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => rejectMutation.mutate(request.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Requests</CardTitle>
            <CardDescription>Previously approved or rejected requests</CardDescription>
          </CardHeader>
          <CardContent>
            {completedRequests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No past requests
              </p>
            ) : (
              <div className="space-y-3">
                {completedRequests.map((request) => {
                  const config = statusConfig[request.status];
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 bg-card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              From: {request.merchant?.email}
                            </span>
                          </div>
                          <div className="font-bold">
                            {formatCurrency(request.amount)}
                          </div>
                          {request.message && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(request.updatedAt)}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${config.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

