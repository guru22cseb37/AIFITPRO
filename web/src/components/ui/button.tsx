import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-[var(--accent)] text-zinc-950 shadow-lg shadow-[var(--accent-glow)] hover:brightness-110 active:scale-[0.98]",
          variant === "secondary" &&
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-white/10",
          variant === "outline" &&
            "border border-[color-mix(in_oklab,var(--accent)_45%,transparent)] bg-transparent text-[var(--foreground)] hover:bg-white/5",
          variant === "ghost" && "text-zinc-200 hover:bg-white/5",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-5 text-sm",
          size === "lg" && "h-12 px-8 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
