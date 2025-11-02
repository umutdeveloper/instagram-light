import './globals.css';

export const metadata = {
  title: 'Instagram Light',
  description: 'A lightweight Instagram clone built with Next.js 15 and React 19',
  openGraph: {
    title: 'Instagram Light',
    description: 'Fast, minimalist, social photo sharing app.',
    url: 'https://your-domain.com',
    siteName: 'Instagram Light',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}
