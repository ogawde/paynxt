/**
 * Navigation Bar Component (Merchant)
 */

"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@paynxt/ui";
import { logout, getCurrentUser } from "@/lib/auth";
import { LogOut, Wallet, ArrowLeftRight, FileText } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Wallet },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/pay-requests", label: "Pay Requests", icon: FileText },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              PayNXT Merchant
            </Link>

            <div className="hidden md:flex space-x-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

