"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";

const client = new Ably.Realtime({
  key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
});

const inter = Inter({ subsets: ["latin"] });

// メタデータはサーバーコンポーネントでのみ使用可能なので削除
// export const metadata: Metadata = {
//   title: "SlackClone",
//   description: "A modern messaging app inspired by Slack",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AblyProvider client={client}>
          <ChannelProvider channelName="messages">
            {children}
            <Toaster />
          </ChannelProvider>
        </AblyProvider>
      </body>
    </html>
  );
}
