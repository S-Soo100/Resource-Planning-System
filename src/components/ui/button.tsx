import React from "react";
import { cn } from "@/utils/cn";
import { LoadingInline } from "./Loading";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      disabled,
      children,
      icon,
      iconPosition = "left",
      ...props
    },
    ref
  ) => {
    // 버튼 베이스 스타일
    const baseStyles =
      "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.98]";

    // 버튼 변형 스타일
    const variants = {
      default:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300",
      primary:
        "bg-Primary-Main text-white hover:brightness-90 focus:ring-Primary-Main/30 disabled:bg-Gray-Sub-Disabled-40 disabled:text-Text-Low-70",
      secondary:
        "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-300",
      danger:
        "bg-Error-Main text-white hover:brightness-90 focus:ring-Error-Main/30",
      success:
        "bg-green-500 text-white hover:bg-green-600 focus:ring-green-300",
      outline:
        "border border-Outline bg-transparent text-Primary-Main hover:bg-Primary-Container/30 focus:ring-Primary-Main/30 focus:border-Primary-Main disabled:border-Gray-Sub-Disabled-40 disabled:text-Text-Low-70",
      ghost:
        "bg-transparent text-Primary-Main hover:bg-Primary-Container/30 focus:ring-Primary-Main/30",
    };

    // 버튼 크기 스타일
    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    };

    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <LoadingInline className="mr-2" />}
        {!loading && icon && iconPosition === "left" && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
