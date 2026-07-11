import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-[background,border-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "glass-control text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-[var(--control-hover)] hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass-control text-foreground",
        toolbar: "glass-control h-8 px-2.5 text-xs text-secondary",
        raised: "glass-panel border-[var(--border-medium)] text-foreground hover:bg-[var(--control-hover)]",
        "primary-gradient": "border border-[#aa9fff]/45 bg-[linear-gradient(180deg,#9b8dff,#7363ef)] text-[var(--on-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,.32),0_6px_16px_rgba(78,63,190,.28)] hover:brightness-110",
        segmented: "rounded-[9px] border-transparent text-muted-foreground hover:bg-[var(--control-hover)] hover:text-foreground data-[state=active]:bg-[var(--control-active)] data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_1px_2px_rgba(0,0,0,.2)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
