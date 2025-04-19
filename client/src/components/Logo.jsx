
import React from "react";
import { BookOpen } from "lucide-react";
import { cn } from "../lib/utils";

export const Logo = ({ className, size = "md", showText = true, variant = "default" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };
  
  const textSizes = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };
  
  const colorVariants = {
    default: "bg-gradient-to-r from-indigo-600 to-blue-500 text-white",
    light: "bg-white text-indigo-600",
    dark: "bg-gray-900 text-white",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-lg flex items-center justify-center",
        sizeClasses[size],
        colorVariants[variant]
      )}>
        <BookOpen className="w-3/4 h-3/4" />
      </div>
      {showText && (
        <span className={cn("font-bold", textSizes[size])}>
          EduVerse
        </span>
      )}
    </div>
  );
};

export default Logo;
