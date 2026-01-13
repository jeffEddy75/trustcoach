import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header minimal */}
      <header className="p-4">
        <Link href="/" className="font-heading text-xl font-bold text-primary">
          TrustCoach
        </Link>
      </header>

      {/* Contenu centré */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer minimal */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TrustCoach. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
