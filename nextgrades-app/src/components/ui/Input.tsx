
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { theme as t } from "@/lib/theme/tokens";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(t.inputLegacy, "transition-[border-color,box-shadow,background-color]", className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
