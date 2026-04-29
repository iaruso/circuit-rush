import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const nouvelR = localFont({
  src: [
    { path: '../../public/fonts/NouvelR-Light.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/NouvelR-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/NouvelR-Semibold.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/NouvelR-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/NouvelR-Extrabold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-nouvelr',
  display: 'swap',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

const nouvelRBook = localFont({
  src: '../../public/fonts/NouvelR-Book.woff2',
  variable: '--font-nouvelr-book',
  display: 'swap',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Circuit Rush',
  description: 'Three-lap racing simulation with local lap records.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${nouvelR.variable} ${nouvelRBook.variable}`}>
      <body className='antialiased'>
        {children}
      </body>
    </html>
  );
}
