import '@/app/styles.css';
import ReactQueryClientProvider from '@/components/react-query-client-provider';
import { GTM_ID, PRODUCT_NAME } from '@/constants';
import theme from '@/theme';
import '@blocknote/mantine/style.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} | Open-source Enterprise AI Management Platform`,
  openGraph: {
    images: ['/logo.svg'],
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
        {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
        <MantineProvider theme={theme}>
          <Notifications />
          <ReactQueryClientProvider>
            <ModalsProvider>{children}</ModalsProvider>
          </ReactQueryClientProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
