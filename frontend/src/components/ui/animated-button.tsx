"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const animatedButtonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 hover:scale-105",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:scale-105",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground hover:shadow-lg hover:scale-105",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 hover:scale-105",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface AnimatedButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ButtonPrimitive>, "children">,
    VariantProps<typeof animatedButtonVariants> {
  children?: React.ReactNode;
  hoverScale?: number;
  tapScale?: number;
  animateOnMount?: boolean;
}

function AnimatedButton({
  className,
  variant = "default",
  size = "default",
  hoverScale = 1.05,
  tapScale = 0.95,
  animateOnMount = false,
  children,
  ...props
}: AnimatedButtonProps) {
  return (
    <div style={{ display: "inline-block" }}>
      <ButtonPrimitive
        data-slot="button"
        className={cn(animatedButtonVariants({ variant, size, className }))}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-1.5">
          {children}
        </span>
      </ButtonPrimitive>
    </div>
  );
}

interface AnimatedIconButtonProps extends AnimatedButtonProps {
  rotateOnHover?: boolean;
}

function AnimatedIconButton({
  rotateOnHover = true,
  className,
  children,
  ...props
}: AnimatedIconButtonProps) {
  return (
    <AnimatedButton className={cn(rotateOnHover && "hover:rotate-[15deg] transition-transform", className)} {...props}>
      <span>
        {children}
      </span>
    </AnimatedButton>
  );
}

function AnimatedRippleButton({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: AnimatedButtonProps) {
  return (
    <div style={{ display: "inline-block" }}>
      <ButtonPrimitive
        data-slot="button"
        className={cn(animatedButtonVariants({ variant, size }), "relative overflow-hidden", className)}
        {...props}
      >
        <span className="absolute inset-0 bg-white/20 rounded-full" />
        <span className="relative z-10">{children}</span>
      </ButtonPrimitive>
    </div>
  );
}

interface AnimatedButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

function AnimatedButtonGroup({
  children,
  className,
  staggerDelay = 0.1,
}: AnimatedButtonGroupProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {children}
    </div>
  );
}

export {
  AnimatedButton,
  AnimatedIconButton,
  AnimatedRippleButton,
  AnimatedButtonGroup,
  animatedButtonVariants,
};
