import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "UGC.az — Made by people. Built for brands.",
  description: "UGC.az — kreatorlar və brendlər üçün platforma.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
