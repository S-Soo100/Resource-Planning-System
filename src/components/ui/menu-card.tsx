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
    "cursor-pointer rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-Primary-Main/20 shadow-sm hover:shadow-md";

  const variantStyles = {
    default: "p-5",
    compact: "p-3",
  };

  const stateStyles = isActive
    ? "border-Primary-Main bg-Primary-Container"
    : disabled
    ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
    : "border-Outline-Variant hover:border-Primary-Main hover:bg-Primary-Container/50";

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
              isActive ? "text-Primary-Main" : "text-Text-High-90"
            )}
          >
            {icon}
          </div>
        )}
        <h3
          className={cn(
            "font-semibold",
            variant === "default" ? "text-lg" : "text-base",
            isActive ? "text-Text-Highest-100" : "text-Text-Highest-100"
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
            isActive ? "text-Text-High-90" : "text-Text-Low-70"
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
