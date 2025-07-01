import { User } from "@paynxt/types";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

