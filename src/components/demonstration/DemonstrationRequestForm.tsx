"use client";

/**
 * 시연 요청 폼 컴포넌트
 *
 * ⚠️ API 통신 미개발 상태
 * 현재 이 컴포넌트는 데모용으로만 동작하며, 실제 API 연동이 필요합니다.
 *
 * TODO: 다음 기능들의 API 연동이 필요합니다:
 * - 시연 요청 데이터 전송
 * - 파일 업로드 처리
 * - 서버 응답 처리
 * - 에러 핸들링
 */

import React from "react";
import { OrderRequestFormProps } from "@/types/(order)/orderRequestFormData";
import DemonstrationForm from "./forms/DemonstrationForm";

const DemonstrationRequestForm: React.FC<OrderRequestFormProps> = (props) => {
  return <DemonstrationForm {...props} />;
};

export default DemonstrationRequestForm;
