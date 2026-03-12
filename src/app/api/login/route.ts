import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";

/**
 * Login API route.
 * Accepts POST with { password: string }.
 * Sets an auth cookie if the password matches SITE_PASSWORD.
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        const sitePassword = process.env.SITE_PASSWORD || "";

        if (!sitePassword) {
            // No password configured — allow through
            const response = NextResponse.json({ success: true });
            return response;
        }

        if (password !== sitePassword) {
            return NextResponse.json(
                { success: false, error: "Incorrect password" },
                { status: 401 }
            );
        }

        const response = NextResponse.json({ success: true });
        response.cookies.set("costume-auth", hashPassword(sitePassword), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request" },
            { status: 400 }
        );
    }
}
