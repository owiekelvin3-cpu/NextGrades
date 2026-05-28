
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "success" | "warning" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300",
    gold: "bg-[#D4AF37]/20 dark:bg-[#D4AF37]/20 text-[#D4AF37] dark:text-[#D4AF37]",
    success: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400",
    warning: "bg-orange-100 dark:bg-orange-90/20 text-orange-800 dark:text-orange-400",
    outline: "border-2 border-[#0D1B2A] dark:border-white/30 text-[#0D1B2A] dark:text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
