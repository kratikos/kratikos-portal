import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const portalUrl = "https://portal.kratikos.com.br";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    metadataBase: new URL(portalUrl),
    title: "Portal administrativo | Kratikos",
    description: "Gestão, moderação e inteligência de negócio da plataforma Kratikos.",
    icons: { icon: "/brand/kratikos-symbol.svg", shortcut: "/brand/kratikos-symbol.svg" },
    openGraph: {
      url: portalUrl,
      title: "Portal administrativo | Kratikos",
      description: "Dados, moderação e impacto em um só lugar.",
      images: [{ url: imageUrl, width: 1731, height: 909, alt: "Portal administrativo Kratikos" }],
      type: "website",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: "Portal administrativo | Kratikos",
      description: "Dados, moderação e impacto em um só lugar.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
