import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "default", 
  children, 
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
primary: "text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-white hover:bg-gray-50 border border-gray-300 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] focus:ring-gray-500",
    ghost: "hover:bg-gray-100 hover:text-gray-900 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-gray-500",
    danger: "text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
<button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      style={{
        background: variant === 'primary' ? 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)' :
                   variant === 'danger' ? 'linear-gradient(135deg, #C0392B 0%, #A93226 100%)' : undefined,
        color: variant === 'secondary' ? '#333333' : variant === 'ghost' ? '#6B7280' : undefined,
        '--tw-ring-color': variant === 'primary' ? '#4A90E2' : variant === 'danger' ? '#C0392B' : '#6B7280'
      }}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;