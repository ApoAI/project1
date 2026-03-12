import { cookies } from "next/headers";
import { hashPassword } from "@/lib/password-hash";


export async function isAuthenticated(): Promise<boolean> {
    const password = process.env.SITE_PASSWORD || "";
    if (!password) {
        // No password configured — allow through (dev mode)
        return true;
    }

    const cookieStore = await cookies();
    const authCookie = cookieStore.get("costume-auth")?.value;

    return authCookie === hashPassword(password);
}
