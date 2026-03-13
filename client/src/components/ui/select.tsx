// ==================== src/components/ui/select.tsx ====================
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select         = SelectPrimitive.Root;
export const SelectValue    = SelectPrimitive.Value;
export const SelectGroup    = SelectPrimitive.Group;
export const SelectPortal   = SelectPrimitive.Portal;

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "input-base flex items-center justify-between gap-2",
        "text-[var(--color-text-primary)]",
        "focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-dim)]",
        "data-[placeholder]:text-[var(--color-text-muted)]",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPortal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={4}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden",
          "rounded-[var(--radius-lg)] border border-[var(--color-border)]",
          "bg-[var(--color-surface-2)] shadow-[var(--shadow-lg)]",
          "animate-scale-in",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPortal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center",
        "rounded-[var(--radius-sm)] py-2 pl-8 pr-3",
        "text-sm text-[var(--color-text-secondary)]",
        "outline-none transition-colors",
        "hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]",
        "data-[state=checked]:text-[var(--color-text-primary)]",
        "data-[highlighted]:bg-[var(--color-accent-dim)] data-[highlighted]:text-[var(--color-text-primary)]",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={12} className="text-[var(--color-accent)]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectLabel({ className, ...props }: SelectPrimitive.SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      className={cn("section-label px-2 py-1.5", className)}
      {...props}
    />
  );
}
