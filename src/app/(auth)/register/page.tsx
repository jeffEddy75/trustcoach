import { redirect } from "next/navigation";

/**
 * Redirect ancienne page /register vers /sign-up (Clerk)
 */
export default function RegisterPage() {
  redirect("/sign-up");
}
