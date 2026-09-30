import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Returning Sands",
  description: "Returning Sands — a Sudanese cultural heritage campaign and short documentary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
