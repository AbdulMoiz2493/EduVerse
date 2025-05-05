
import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          
          // Variants
          {
            "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default" || !variant,
            "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90": variant === "destructive",
            "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80": variant === "secondary",
            "bg-background text-primary underline-offset-4 hover:underline": variant === "link",
            "bg-gradient-to-r from-primary to-secondary text-white": variant === "gradient",
          },
          
          // Sizes
          {
            "h-9 px-4 py-2": size === "default" || !size,
            "h-11 rounded-md px-8": size === "lg",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-7 rounded-md px-2 text-xs": size === "xs",
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
