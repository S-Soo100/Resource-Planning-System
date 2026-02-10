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
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.98]";

    // 버튼 변형 스타일
    const variants = {
      default:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300",
      primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300",
      secondary: "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-300",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300",
      success:
        "bg-green-500 text-white hover:bg-green-600 focus:ring-green-300",
      outline:
        "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
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
