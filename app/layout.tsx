import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Хрестини Терези · Особливе запрошення', description: 'Маленька душа. Велике благословення. Запрошуємо розділити з нами день хрестин Терези.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="uk"><body>{children}</body></html>; }
