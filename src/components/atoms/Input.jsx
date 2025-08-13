import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ 
  className, 
  type = "text",
  label,
  error,
  icon,
  multiline = false,
  rows = 3,
  ...props 
}, ref) => {
  // Filter out non-DOM props to prevent React warnings
  const { hover, ...domProps } = props;

  const inputClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    placeholder-gray-400 text-sm
    transition-all duration-200 ease-in-out
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  const textareaClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    placeholder-gray-400 text-sm
    transition-all duration-200 ease-in-out
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    resize-vertical min-h-[80px]
  `;

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && !multiline && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        {multiline ? (
          <textarea
            className={cn(
              textareaClasses,
              error && "border-red-300",
              className
            )}
            style={{
              '--tw-ring-color': error ? '#C0392B' : '#4A90E2'
            }}
            rows={rows}
            ref={ref}
            {...domProps}
          />
        ) : (
          <input
            type={type}
            className={cn(
              inputClasses,
              icon && "pl-10",
              error && "border-red-300",
              className
            )}
            style={{
              '--tw-ring-color': error ? '#C0392B' : '#4A90E2'
            }}
            ref={ref}
            {...domProps}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;