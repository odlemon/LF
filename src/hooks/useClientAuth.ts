"use client";

import { useContext } from "react";
import { ClientAuthContext, ClientAuthContextType } from "@/context/ClientAuthContext";

export function useClientAuth(): ClientAuthContextType {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth must be used within a ClientAuthProvider");
  }
  return context;
}
