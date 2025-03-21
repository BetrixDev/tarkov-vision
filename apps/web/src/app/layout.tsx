import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { extractRouterConfig } from "uploadthing/server";
import { tarkovVisionFileRouter } from "./api/uploadthing/core";
import "./globals.css";
import Providers from "./providers";
import { connection } from "next/server";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarkov Vision",
  description:
    "Upload screenshots of your Tarkov inventory, stash, or loot containers and instantly identify all items.",
};

async function UTSSR() {
  await connection();
  return (
    <NextSSRPlugin routerConfig={extractRouterConfig(tarkovVisionFileRouter)} />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <UTSSR />
        </Suspense>
        <NuqsAdapter>
          <Providers>{children}</Providers>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
