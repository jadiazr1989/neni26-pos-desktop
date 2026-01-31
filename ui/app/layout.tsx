// ui/app/layout.tsx
import ClientProviders from "@/components/shared/providers/ClientProviders";
import React from "react";
import "./globals.css";

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
