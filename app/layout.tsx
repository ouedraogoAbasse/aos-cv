import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AOSCV | CV Create",
  description: "Créez et personnalisez votre CV professionnel avec AOSCV.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="sunset">
      <body className="antialiased">{children}</body>
    </html>
  );
}
