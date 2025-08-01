"use client";
import { useEffect } from "react";

interface DynamicTitleProps {
  title: string;
  description?: string;
}

export const DynamicTitle: React.FC<DynamicTitleProps> = ({
  title,
  description,
}) => {
  useEffect(() => {
    // 타이틀 변경
    document.title = title;

    // 메타 설명 변경 (선택사항)
    if (description) {
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      }
    }
  }, [title, description]);

  return null; // 이 컴포넌트는 렌더링하지 않음
};
