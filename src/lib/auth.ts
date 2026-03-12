import { cookies } from "next/headers";

export function hashPassword(pw: string): string {
    let hash = 0;
    for (let i = 0; i < pw.length; i++) {
        const char = pw.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return "cal_" + Math.abs(hash).toString(36);
}

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
