export function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return `₱${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

