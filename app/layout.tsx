import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Small-Town Baker',
  description: 'Hover to see prices while frosting cakes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
