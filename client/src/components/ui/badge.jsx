
import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/80",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "bg-transparent border border-input text-foreground hover:bg-accent",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  success: "bg-green-500 text-white hover:bg-green-600",
  gradient: "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500 text-white"
};

const Badge = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge, badgeVariants };
