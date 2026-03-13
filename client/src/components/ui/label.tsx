// ==================== src/components/ui/ ====================
import { forwardRef, type LabelHTMLAttributes } from "react";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-xs font-medium tracking-wide uppercase text-[var(--color-text-muted)]",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label"; 