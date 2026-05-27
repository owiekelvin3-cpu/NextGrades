import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "success" | "warning" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    gold: "bg-yellow-100 text-yellow-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-orange-100 text-orange-800",
    outline: "border-2 border-deep-navy text-deep-navy",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
