"use client";
import { redirect } from "next/navigation";

// /admin 페이지는 /admin/team-members로 리다이렉트
export default function AdminPage() {
  redirect("/admin/team-members");
}
