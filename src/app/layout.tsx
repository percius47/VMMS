import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Vendor Master Management System",
  description: "Centralized platform for vendor data management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
