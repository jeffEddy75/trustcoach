import Link from "next/link";

const footerLinks = {
  product: [
    { href: "/coaches", label: "Trouver un coach" },
    { href: "/about", label: "Comment ça marche" },
    { href: "/pricing", label: "Tarifs" },
  ],
  company: [
    { href: "/about-us", label: "À propos" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
  ],
  legal: [
    { href: "/terms", label: "CGU" },
    { href: "/privacy", label: "Confidentialité" },
    { href: "/cookies", label: "Cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-heading text-xl font-bold">
              TrustCoach
            </Link>
            <p className="mt-2 text-sm text-primary-foreground/70">
              Le tiers de confiance du coaching augmenté.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-medium mb-3">Produit</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-medium mb-3">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-medium mb-3">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <p className="text-sm text-primary-foreground/70 text-center">
            &copy; {new Date().getFullYear()} TrustCoach. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
