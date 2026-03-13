// ==================== src/components/ui/input.tsx ====================
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "input-base",
        "placeholder:text-[var(--color-text-muted)]",
        "focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-dim)]",
        error && "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";








