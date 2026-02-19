import React from 'react';

interface LoadingProps {
  /** 크기: sm(버튼용), md(일반), lg(오버레이용) */
  size?: 'sm' | 'md' | 'lg';
  /** 색상 테마: primary(파란색), purple(보라색) */
  variant?: 'primary' | 'purple';
  /** 추가 커스텀 클래스 */
  className?: string;
}

/**
 * 통합 로딩 스피너 컴포넌트
 * 3개의 점이 순차적으로 튀어오르는 Dots 애니메이션
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  // 크기별 스타일
  const sizeStyles = {
    sm: 'gap-1',  // 버튼용
    md: 'gap-1.5', // 일반
    lg: 'gap-2',   // 오버레이용
  };

  // 점 크기
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  // 색상 테마 — 디자인 토큰 사용
  const variantStyles = {
    primary: 'bg-Primary-Main',
    purple: 'bg-Primary-Main',
  };

  return (
    <div
      className={`flex items-center justify-center ${sizeStyles[size]} ${className}`}
      role="status"
      aria-label="로딩 중"
    >
      <div
        className={`${dotSizes[size]} ${variantStyles[variant]} rounded-full animate-bounce`}
        style={{ animationDelay: '0ms', animationDuration: '600ms' }}
      />
      <div
        className={`${dotSizes[size]} ${variantStyles[variant]} rounded-full animate-bounce`}
        style={{ animationDelay: '150ms', animationDuration: '600ms' }}
      />
      <div
        className={`${dotSizes[size]} ${variantStyles[variant]} rounded-full animate-bounce`}
        style={{ animationDelay: '300ms', animationDuration: '600ms' }}
      />
    </div>
  );
};

/**
 * 중앙 정렬된 로딩 스피너 (페이지/섹션용)
 */
export const LoadingCentered: React.FC<LoadingProps> = (props) => {
  return (
    <div className="flex items-center justify-center w-full py-8">
      <Loading {...props} />
    </div>
  );
};

/**
 * 인라인 로딩 스피너 (버튼용)
 */
export const LoadingInline: React.FC<LoadingProps> = ({ className = '', ...props }) => {
  return (
    <Loading
      size="sm"
      className={`inline-flex ${className}`}
      {...props}
    />
  );
};

export default Loading;
