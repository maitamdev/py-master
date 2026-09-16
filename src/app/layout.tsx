import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AutoResumeToast } from '@/components/course/auto-resume-toast';
import { FloatingResumeButton } from '@/components/course/floating-resume-button';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'PYTHON-MASTER — Nền tảng Học Python Tiếng Việt Toàn Diện',
    template: '%s | PYTHON-MASTER',
  },
  description:
    'Khóa học Lập trình Python toàn diện tiếng Việt từ nền tảng đến tư duy thực tế. 14 phần, 78 bài học, 283 bài tập, Python playground và gia sư AI. Phát triển bởi MaiTamDev.',
  keywords: [
    'Python',
    'Học Python',
    'Python tiếng Việt',
    'Tự học Python',
    'Lập trình Python',
    'MaiTamDev',
    'Lập trình cơ bản',
    'Lập trình nâng cao',
  ],
  authors: [{ name: 'MaiTamDev' }],
  metadataBase: new URL('https://python-master.dev'),
  openGraph: {
    title: 'PYTHON-MASTER — Nền tảng Học Python Tiếng Việt Toàn Diện',
    description:
      'Khóa học Python tiếng Việt chất lượng cao gồm 14 phần học, 78 bài học, 283 bài tập thực hành trực tiếp trên trình duyệt. Phát triển bởi MaiTamDev.',
    siteName: 'PYTHON-MASTER',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('python-master:theme') || 'system';
                  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-sky-500/20 selection:text-sky-600 dark:selection:text-sky-300">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <AutoResumeToast />
        <FloatingResumeButton />
      </body>
    </html>
  );
}
