import React from "react";
import { HiExclamation, HiCheckCircle, HiInformationCircle } from "react-icons/hi";

interface AlertProps {
  variant?: "info" | "success" | "error" | "warning";
  message: string;
}

export function Alert({ variant = "info", message }: AlertProps) {
  const getStyles = () => {
    switch (variant) {
      case "success":
        return {
          container: "bg-emerald-50 border border-emerald-100 text-emerald-800",
          icon: <HiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
        };
      case "error":
        return {
          container: "bg-red-50 border border-red-150/40 text-red-800",
          icon: <HiExclamation className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
        };
      case "warning":
        return {
          container: "bg-amber-50/70 border border-amber-150/30 text-amber-800",
          icon: <HiExclamation className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
        };
      default:
        return {
          container: "bg-primary/[0.03] border border-primary/10 text-gray-800",
          icon: <HiInformationCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />,
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl text-sm font-semibold leading-relaxed animate-fade-in ${styles.container}`}>
      {styles.icon}
      <span>{message}</span>
    </div>
  );
}
