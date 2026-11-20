import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "HELIOS™ Digital Maturity Assessment | MIRAKI23",
  description:
    "Assess your institution across 21 digital capability layers and receive a board-ready gap analysis report.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <footer className="no-print mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-navy-700/70">
            HELIOS Framework™ © MIRAKI23 LLP ·{" "}
            <a className="underline" href="https://miraki23.com/privacy-policy/" target="_blank" rel="noreferrer">
              Privacy policy
            </a>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
