import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientPage from "./ClientPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    redirect("/login?next=%2F");
  }

  return <ClientPage />;
}
