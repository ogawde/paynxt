/**
 * Register Page (Consumer)
 * 
 * Allows new consumers to create an account
 * 
 * Flow:
 * 1. User enters email and password
 * 2. Submit to backend API with userType: CONSUMER
 * 3. Receive JWT token and user data
 * 4. User gets 10,000 ₱ initial balance automatically
 * 5. Store in localStorage
 * 6. Redirect to dashboard
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@paynxt/ui";
import { authApi, setToken } from "@/lib/api";
import { setCurrentUser } from "@/lib/auth";
import { registerSchema, UserType } from "@paynxt/types";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle registration form submission
   * 
   * Flow:
   * 1. Validate passwords match
   * 2. Validate input using Zod schema
   * 3. Call register API with CONSUMER type
   * 4. Store token and user in localStorage
   * 5. Navigate to dashboard
   * 6. Show error if registration fails
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate input
      const validatedData = registerSchema.parse({
        email,
        password,
        userType: UserType.CONSUMER, // Fixed as CONSUMER for this app
      });

      // Call register API
      const response = await authApi.register(validatedData);

      if (response.success && response.data) {
        // Store token and user data
        setToken(response.data.token);
        setCurrentUser(response.data.user);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(response.error || "Registration failed");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Consumer Account
          </CardTitle>
          <CardDescription className="text-center">
            Register as a consumer to start sending and receiving payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="consumer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="p-3 text-sm bg-primary/10 rounded-md border border-primary/20">
              <p className="font-medium">🎉 Get started with 10,000 ₱</p>
              <p className="text-muted-foreground text-xs mt-1">
                Every new account receives an initial balance
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

