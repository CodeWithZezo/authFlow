// ==================== src/components/ui/textarea.tsx ====================
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "input-base resize-none min-h-[80px] leading-relaxed",
        "focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-dim)]",
        error && "border-red-500/50 focus:border-red-500",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";