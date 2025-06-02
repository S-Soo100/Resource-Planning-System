import React from "react";
import { cn } from "@/utils/cn";

export interface MenuCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  id: string;
  isActive?: boolean;
  onClick?: (id: string) => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "compact";
}

const MenuCard: React.FC<MenuCardProps> = ({
  title,
  description,
  icon,
  id,
  isActive = false,
  onClick,
  disabled = false,
  className,
  variant = "default",
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(id);
    }
  };

  const baseStyles =
    "cursor-pointer rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  const variantStyles = {
    default: "p-5",
    compact: "p-3",
  };

  const stateStyles = isActive
    ? "border-blue-500 bg-blue-50"
    : disabled
    ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50";

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], stateStyles, className)}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center mb-2">
        {icon && (
          <div
            className={cn(
              "mr-3 text-2xl",
              variant === "compact" && "text-xl mr-2",
              isActive ? "text-blue-600" : "text-gray-600"
            )}
          >
            {icon}
          </div>
        )}
        <h3
          className={cn(
            "font-semibold",
            variant === "default" ? "text-lg" : "text-base",
            isActive ? "text-blue-900" : "text-gray-900"
          )}
        >
          {title}
        </h3>
      </div>

      {description && (
        <p
          className={cn(
            "text-sm",
            variant === "compact" && "text-xs",
            isActive ? "text-blue-700" : "text-gray-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};

MenuCard.displayName = "MenuCard";

export { MenuCard };
