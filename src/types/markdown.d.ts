/**
 * Markdown 파일을 문자열로 import할 수 있도록 타입 선언
 */
declare module "*.md" {
  const content: string;
  export default content;
}
