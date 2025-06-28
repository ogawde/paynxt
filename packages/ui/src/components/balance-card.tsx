import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { RefreshCw } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export interface BalanceCardProps {
  balance: number;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function BalanceCard({ balance, onRefresh, isLoading = false }: BalanceCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {isLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : (
            formatCurrency(balance)
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {balance === 1000000 && "Initial balance"}
        </p>
      </CardContent>
    </Card>
  );
}

