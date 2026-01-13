import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter, Literata } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const literata = Literata({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TrustCoach - Le tiers de confiance du coaching augmenté",
    template: "%s | TrustCoach",
  },
  description:
    "Trouvez votre coach, réservez vos séances et bénéficiez de résumés IA personnalisés. TrustCoach : le coaching augmenté pour votre développement personnel et professionnel.",
  keywords: [
    "coaching",
    "développement personnel",
    "bien-être",
    "coaching professionnel",
    "résumé IA",
    "coach certifié",
  ],
  authors: [{ name: "TrustCoach" }],
  creator: "TrustCoach",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "TrustCoach",
    title: "TrustCoach - Le tiers de confiance du coaching augmenté",
    description:
      "Trouvez votre coach, réservez vos séances et bénéficiez de résumés IA personnalisés.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr" suppressHydrationWarning>
        <body
          className={`${dmSans.variable} ${inter.variable} ${literata.variable} font-body antialiased bg-background text-foreground`}
        >
          <QueryProvider>
            {children}
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
