import * as React from "react";
import { formatCurrency, formatDate } from "../lib/utils";

interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  type: "TRANSFER" | "PAY_REQUEST";
  createdAt: Date | string;
  completedAt?: Date | string | null;
  fromUser?: { email: string };
  toUser?: { email: string };
}

export interface TransactionListProps {
  transactions: Transaction[];
  currentUserId?: string;
  emptyMessage?: string;
}

const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function TransactionList({ transactions, currentUserId, emptyMessage = "No transactions yet" }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">From/To</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isOutgoing = currentUserId && tx.fromUserId === currentUserId;
            const otherParty = isOutgoing ? tx.toUser?.email : tx.fromUser?.email;
            
            return (
              <tr key={tx.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4 text-sm">{formatDate(tx.createdAt)}</td>
                <td className="py-3 px-4 text-sm">{tx.type}</td>
                <td className="py-3 px-4 text-sm">
                  <span className={isOutgoing ? "text-red-600" : "text-green-600"}>
                    {isOutgoing ? "To: " : "From: "}
                  </span>
                  {otherParty || "Unknown"}
                </td>
                <td className={`py-3 px-4 text-sm text-right font-medium ${isOutgoing ? "text-red-600" : "text-green-600"}`}>
                  {isOutgoing ? "-" : "+"}
                  {formatCurrency(tx.amount)}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${statusStyles[tx.status]}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

