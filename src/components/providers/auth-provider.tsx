"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getCurrentAccount, AccountListItem } from "@/lib/actions/accounts";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: AccountListItem | null;
  isLoading: boolean;
  updateCurrentUser: (userData: Partial<AccountListItem>) => void;
  refreshUser: () => Promise<AccountListItem | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AccountListItem | null;
}) {
  const [user, setUser] = useState<AccountListItem | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const current = await getCurrentAccount();
      setUser(current);
      return current;
    } catch (err) {
      console.error("Failed to refresh user session:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser) {
      refreshUser();
    }
  }, [initialUser, refreshUser]);

  const updateCurrentUser = useCallback(
    (userData: Partial<AccountListItem>) => {
      setUser((prev) => (prev ? { ...prev, ...userData } : null));
      router.refresh();
    },
    [router]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      updateCurrentUser,
      refreshUser,
    }),
    [user, isLoading, updateCurrentUser, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
