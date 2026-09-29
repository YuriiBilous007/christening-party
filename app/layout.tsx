import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://christening-party.vercel.app"),
  title: "Christening of Teresa",
  description: "Join us to celebrate Teresa’s christening on October 25, 2026.",
  openGraph: {
    type: "website",
    title: "Christening of Teresa",
    description:
      "Join us to celebrate Teresa’s christening on October 25, 2026.",
    url: "/",
    siteName: "Christening of Teresa",
    images: [
      {
        url: "/social-preview.jpg",
        width: 1200,
        height: 800,
        type: "image/jpeg",
        alt: "Teresa sleeping peacefully in her blanket",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christening of Teresa",
    description:
      "Join us to celebrate Teresa’s christening on October 25, 2026.",
    images: ["/social-preview.jpg"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
