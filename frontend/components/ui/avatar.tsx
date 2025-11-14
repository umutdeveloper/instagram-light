"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  alt?: string;
  fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', src, alt, fallback, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base', 
      lg: 'h-16 w-16 text-xl'
    };

    if (src) {
      return (
        <div 
          ref={ref}
          className={cn(
            "relative flex shrink-0 overflow-hidden rounded-full",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <img 
            src={src} 
            alt={alt} 
            className="aspect-square h-full w-full object-cover"
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white font-semibold",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {fallback}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };