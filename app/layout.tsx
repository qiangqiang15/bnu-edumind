import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // 引入通知组件

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "智测 Edu Platform",
  description: "教育经济学认知诊断平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        {/* 全局通知容器，必须放在这里 toast 才能弹出来 */}
        <Toaster richColors position="top-center" /> 
      </body>
    </html>
  );
}