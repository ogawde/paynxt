"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@paynxt/ui";
import { authApi, setToken } from "@/lib/api";
import { setCurrentUser } from "@/lib/auth";
import { loginSchema, LoginResponse } from "@paynxt/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = async (emailValue: string, passwordValue: string) => {
    setError("");
    setIsLoading(true);

    try {
      const validatedData = loginSchema.parse({ email: emailValue, password: passwordValue });

      const response = await authApi.login(validatedData) as { success: boolean; data?: LoginResponse; error?: string };

      if (response.success && response.data) {
        setToken(response.data.token);
        setCurrentUser(response.data.user);

        router.push("/dashboard");
      } else {
        setError(response.error || "Login failed");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickLogin = async () => {
    const testEmail = "testuser@test.com";
    const testPassword = "testuser@test.com";
    setEmail(testEmail);
    setPassword(testPassword);
    await performLogin(testEmail, testPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            PayNXT Consumer
          </CardTitle>
          <CardDescription className="text-center">
            Login to your consumer account
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isLoading}
                className="text-sm text-muted-foreground hover:text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use suggested credentials
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

