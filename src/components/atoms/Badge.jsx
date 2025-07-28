import React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    active: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
    expired: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
    coming: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200",
    soldout: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300",
    primary: "bg-gradient-to-r from-primary-100 to-indigo-100 text-primary-800 border-primary-200",
    accent: "bg-gradient-to-r from-accent-100 to-pink-100 text-accent-800 border-accent-200"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export default Badge;