"use client";

import { createContext, useContext, type ReactNode } from "react";

type UserContextValue = {
  role: string;
  fullName: string | null;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  role,
  fullName,
  children,
}: {
  role: string;
  fullName: string | null;
  children: ReactNode;
}) {
  return (
    <UserContext.Provider value={{ role, fullName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
