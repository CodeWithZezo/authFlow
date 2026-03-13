// ==================== src/components/ui/button.tsx ====================
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans font-medium text-sm",
    "rounded-[var(--radius)]",
    "transition-all duration-150",
    "focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "cursor-pointer select-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--color-accent)] text-white",
          "hover:bg-[var(--color-accent-hover)]",
          "shadow-sm",
        ],
        secondary: [
          "bg-[var(--color-surface-3)] text-[var(--color-text-primary)]",
          "border border-[var(--color-border)]",
          "hover:border-[var(--color-border-2)] hover:bg-[var(--color-surface-2)]",
        ],
        ghost: [
          "text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
        ],
        destructive: [
          "bg-red-500/10 text-red-400",
          "border border-red-500/20",
          "hover:bg-red-500/20 hover:border-red-500/30",
        ],
        outline: [
          "border border-[var(--color-border)]",
          "text-[var(--color-text-secondary)]",
          "hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]",
        ],
        link: [
          "text-[var(--color-accent)] underline-offset-4",
          "hover:underline",
          "p-0 h-auto",
        ],
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-7 px-3 text-xs",
        lg:      "h-11 px-6 text-base",
        icon:    "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled ?? loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
