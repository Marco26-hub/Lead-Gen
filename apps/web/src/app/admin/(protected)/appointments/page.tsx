import { redirect } from "next/navigation";

// Appuntamenti gestiti nella dashboard unica.
export default function AppointmentsRedirect() {
  redirect("/app/appointments");
}
