import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/navigation/auth/login/page");
}
