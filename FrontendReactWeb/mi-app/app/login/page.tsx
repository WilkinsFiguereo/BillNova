import { redirect } from "next/navigation";

export default function LoginRedirectPage() {
  redirect("/navigation/auth/login/page");
}

