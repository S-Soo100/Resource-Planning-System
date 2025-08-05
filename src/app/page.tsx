import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const token = await cookieStore.get("token");

  if (token && token.value) {
    // console.log("토큰 존재, /menu로 리다이렉트");
    return redirect("/menu");
  }

  // console.log("토큰 없음, /signin으로 리다이렉트");
  return redirect("/signin");
}
