import '@/app/styles.css';
import theme from '@/theme';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
const font = Poppins({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Airstrip | Open-source Enterprise AI Management Platform',
  openGraph: {
    images: ['/logo.png'],
  },
  alternates: {
    canonical: './',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body className={font.className} style={{ backgroundColor: '#ffffff' }}>
        <MantineProvider theme={theme}>
          <Notifications />
          <ModalsProvider>{children}</ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
