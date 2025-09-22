import { redirect } from "next/navigation";

export default function StaffPage() {
  // Redirect to dashboard
  redirect("/staff/dashboard");
}
