"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 마운트 시 애니메이션
    setIsVisible(true);

    // 자동 닫기
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]); // handleClose는 무한루프 방지를 위해 의존성에서 제외

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // 애니메이션 시간
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "border-l-4 shadow-lg";
    switch (type) {
      case "success":
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case "error":
        return `${baseStyles} bg-Error-Container border-Error-Main text-On-Error-Container`;
      case "warning":
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case "info":
        return `${baseStyles} bg-Primary-Container border-Primary-Main text-Text-Highest-100`;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-Error-Main";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-Primary-Main";
    }
  };

  return (
    <div
      className={`
        w-96 max-w-[calc(100vw-2rem)] p-4 rounded-md transition-all duration-300 ease-in-out
        ${getStyles()}
        ${
          isVisible && !isLeaving
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
      `}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconColor()}`}>{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{title}</p>
          {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
        </div>
        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 rounded-md p-1.5 hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
