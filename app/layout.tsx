import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpaceSnap AI",
  description: "What's happening in this space image?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
