"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { Button } from "@/components/ui/Button";
import { HiEye, HiEyeOff } from "react-icons/hi";

function ClientLoginForm() {
  const { login } = useClientAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login({ email, password });
      router.push("/client-portal/dashboard");
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || errorObj.message || "Authentication failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/50 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lysp Client Portal</h1>
        <p className="text-sm text-gray-500">Secure Client Access</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs py-3 px-5 rounded-full text-center animate-fade-in font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 bg-gray-50/80 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200"
            placeholder="client@company.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-5 pr-12 py-3 bg-gray-50/80 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1.5 rounded-full hover:bg-gray-100 transition-all"
            >
              {showPassword ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="client"
          loading={isLoading}
          className="w-full font-semibold"
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <ClientAuthProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoginFormWrapper />
      </div>
    </ClientAuthProvider>
  );
}

function LoginFormWrapper() {
  return <ClientLoginForm />;
}
