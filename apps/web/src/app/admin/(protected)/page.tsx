import { redirect } from "next/navigation";

// Dashboard unificata sotto /app.
export default function AdminOverviewRedirect() {
  redirect("/app");
}
