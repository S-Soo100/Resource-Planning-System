import { useState } from "react";

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface UseFormValidationReturn {
  errors: Record<string, string>;
  isValid: boolean;
  validate: (data: Record<string, unknown>, rules: ValidationRules) => boolean;
  clearErrors: () => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
}

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (
    data: Record<string, unknown>,
    rules: ValidationRules
  ): boolean => {
    const newErrors: Record<string, string> = {};

    Object.keys(rules).forEach((field) => {
      const value = data[field];
      const rule = rules[field];

      // Required 검증
      if (
        rule.required &&
        (!value || (typeof value === "string" && value.trim() === ""))
      ) {
        newErrors[field] = `${field}은(는) 필수 입력 항목입니다.`;
        return;
      }

      // 값이 없으면 나머지 검증 건너뛰기
      if (!value) return;

      // 최소 길이 검증
      if (
        rule.minLength &&
        typeof value === "string" &&
        value.length < rule.minLength
      ) {
        newErrors[
          field
        ] = `${field}은(는) 최소 ${rule.minLength}자 이상이어야 합니다.`;
        return;
      }

      // 최대 길이 검증
      if (
        rule.maxLength &&
        typeof value === "string" &&
        value.length > rule.maxLength
      ) {
        newErrors[
          field
        ] = `${field}은(는) 최대 ${rule.maxLength}자 이하여야 합니다.`;
        return;
      }

      // 패턴 검증
      if (
        rule.pattern &&
        typeof value === "string" &&
        !rule.pattern.test(value)
      ) {
        newErrors[field] = `${field} 형식이 올바르지 않습니다.`;
        return;
      }

      // 커스텀 검증
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          newErrors[field] = customError;
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => setErrors({});

  const setError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validate,
    clearErrors,
    setError,
    clearError,
  };
}
