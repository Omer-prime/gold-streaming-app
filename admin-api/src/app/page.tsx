// admin-api/src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // When someone opens the root, send them to admin login
  redirect("/admin-login");
}
