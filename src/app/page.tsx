import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientPage from "./ClientPage";

export default async function Home() {
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    redirect("/login");
  }

  return <ClientPage />;
}
