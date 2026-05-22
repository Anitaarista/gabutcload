import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e5c3]/40 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-gradient-to-r from-[#00e5c3] to-[#00b4d8] text-[#0a0e17] hover:brightness-95",
        variant === "secondary" && "bg-[#1a2332] text-[#e8ecf1] hover:bg-[#223146]",
        variant === "danger" && "bg-[#ff4757] text-white hover:bg-[#e73547]",
        variant === "ghost" && "bg-transparent text-[#8892a4] hover:bg-[#1a2332] hover:text-[#e8ecf1]",
        className,
      )}
      {...props}
    />
  );
}
