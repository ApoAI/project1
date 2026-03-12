"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                const params = new URLSearchParams(window.location.search);
                const nextPath = params.get("next") || "/";
                router.push(nextPath);
                router.refresh();
            } else {
                setError(data.error || "Incorrect password");
            }
        } catch {
            setError("Connection error. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-icon">🎭</div>
                <h1 className="login-title">Costume Asset Locator</h1>
                <p className="login-subtitle">Internal Tool — Authorized Access Only</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="login-input"
                        autoFocus
                        autoComplete="current-password"
                    />
                    {error && <div className="login-error">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="login-button"
                    >
                        {loading ? "Checking..." : "Enter"}
                    </button>
                </form>
            </div>
        </div>
    );
}
