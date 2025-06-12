export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// 파일 첨부 관련 타입
export interface AttachedFile {
  file: File;
  preview: string;
  name: string;
  type: string;
  size: number;
}
