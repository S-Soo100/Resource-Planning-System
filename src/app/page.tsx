import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const token = await cookieStore.get("token");

  if (token) {
    redirect("/menu"); // 로그인 상태라면 /menu로 리다이렉트
  } else {
    redirect("/signin"); // 비로그인 상태라면 /signin으로 리다이렉트
  }

  return null; // 이 페이지는 렌더링되지 않음
}
