import { redirect } from "next/navigation";

/**
 * Redirect ancienne page /login vers /sign-in (Clerk)
 */
export default function LoginPage() {
  redirect("/sign-in");
}
