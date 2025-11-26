import "./globals.css";
import type { Metadata } from "next";
import React from "react";

import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Flowbit AI Dashboard",
  description: "Interactive analytics dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
