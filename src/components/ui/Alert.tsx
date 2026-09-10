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
          container: "bg-hover border border-border text-ink",
          icon: <HiCheckCircle className="w-5 h-5 text-ink/70 shrink-0 mt-0.5" />,
        };
      case "error":
        return {
          container:
            "bg-red-50 border border-red-100 text-red-800 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-200",
          icon: (
            <HiExclamation className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          ),
        };
      case "warning":
        return {
          container:
            "bg-amber-50/70 border border-amber-100 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-200",
          icon: (
            <HiExclamation className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          ),
        };
      default:
        return {
          container: "bg-canvas border border-border text-ink",
          icon: <HiInformationCircle className="w-5 h-5 text-ink/60 shrink-0 mt-0.5" />,
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl text-sm font-semibold leading-relaxed animate-fade-in ${styles.container}`}
    >
      {styles.icon}
      <span>{message}</span>
    </div>
  );
}
