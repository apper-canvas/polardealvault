import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  hover = false,
  children, 
  ...props 
}, ref) => {
  // Filter out non-DOM props to prevent React warnings
  const { multiline, ...domProps } = props;

  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200",
        hover && "hover:shadow-md hover:scale-[1.02] cursor-pointer",
        className
      )}
      {...domProps}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;