// ui/app/layout.tsx
import React from "react";
import ClientProviders from "@/components/shared/providers/ClientProviders";
import "./globals.css";

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
