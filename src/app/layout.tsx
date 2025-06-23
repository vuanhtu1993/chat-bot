import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initializeMongoDBForAPI } from "../database/initMongoDB";

// Tạo một component để khởi tạo DB
async function InitDB() {
  try {
    if (typeof window === 'undefined') { // Chỉ chạy trên server
      await initializeMongoDBForAPI();
    }
  } catch (error) {
    console.error('Failed to initialize MongoDB:', error);
  }
  return null; // Component này không render gì cả
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VungAI - Generative chatbot Việt Nam",
  description: "VungAI là một chatbot generative AI được phát triển tại Việt Nam, hỗ trợ tiếng Việt và các ngôn ngữ khác.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Khởi tạo DB trước khi render children */}
        <InitDB />
        {children}
      </body>
    </html>
  );
}
