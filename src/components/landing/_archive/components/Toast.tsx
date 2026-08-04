"use client";

import React, { useEffect } from "react";
import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right bg-white rounded-xl shadow-lg border border-gray-100 p-4 max-w-sm flex items-start gap-3">
      {type === "success" ? (
        <HiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
      ) : (
        <HiExclamationCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {type === "success" ? "Success" : "Error"}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
