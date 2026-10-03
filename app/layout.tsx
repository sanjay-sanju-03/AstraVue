import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstraVue — Understand What's Happening in Space.",
  description:
    "AI-powered visual intelligence for space and Earth imagery. AstraVue detects visible features, highlights them on the image, and explains the scene in simple language.",
  applicationName: "AstraVue",
  keywords: [
    "AstraVue",
    "space imagery",
    "Earth observation",
    "NASA",
    "visual intelligence",
    "computer vision",
  ],
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
