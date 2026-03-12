import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Costume Asset Locator",
  description: "Internal costume wrap lookup tool for rapid rack sorting and item locating",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
