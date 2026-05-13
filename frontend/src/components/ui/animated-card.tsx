"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.ComponentProps<"div"> {
  className?: string;
  size?: "default" | "sm";
  hoverScale?: number;
  hoverRotate?: number;
  animateOnScroll?: boolean;
}

function AnimatedCard({
  className,
  size = "default",
  hoverScale = 1.02,
  hoverRotate = 0,
  animateOnScroll = true,
  children,
  ...props
}: AnimatedCardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        "transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
        "relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AnimatedCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  );
}

function AnimatedCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        "transition-colors duration-300 group-hover/card:text-primary",
        className
      )}
      {...props}
    />
  );
}

function AnimatedCardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground transition-colors duration-300", className)}
      {...props}
    />
  );
}

function AnimatedCardAction({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AnimatedCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  );
}

function AnimatedCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props}
    />
  );
}

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardFooter,
  AnimatedCardTitle,
  AnimatedCardAction,
  AnimatedCardDescription,
  AnimatedCardContent,
};
