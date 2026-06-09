import { redirect } from "next/navigation";

// Clienti gestiti nella dashboard unica.
export default function ClientsRedirect() {
  redirect("/app/clients");
}
