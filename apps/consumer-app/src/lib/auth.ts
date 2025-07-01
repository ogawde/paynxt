/**
 * Authentication Utilities
 * 
 * Helper functions for managing authentication state
 */

import { User } from "@paynxt/types";

/**
 * Check if user is authenticated
 * Simply checks if token exists in localStorage
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

/**
 * Get current user from localStorage
 * Returns null if not found
 */
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

/**
 * Save user to localStorage
 */
export function setCurrentUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Clear authentication data
 */
export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

