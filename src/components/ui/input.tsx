import React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-Text-High-90"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute text-Text-Lowest-60 transform -translate-y-1/2 left-3 top-1/2">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            className={cn(
              "block w-full rounded-md border border-Outline-Variant bg-white px-3 py-2 text-sm text-Text-Highest-100 placeholder:text-Text-Lowest-60 focus:border-Primary-Main focus:outline-none focus:ring-2 focus:ring-Primary-Main/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-Back-Mid-20",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error &&
                "border-Error-Main focus:border-Error-Main focus:ring-Error-Main/20",
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute text-Text-Lowest-60 transform -translate-y-1/2 right-3 top-1/2">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-Error-Main">{error}</p>}

        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
