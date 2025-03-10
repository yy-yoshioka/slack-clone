"use client";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import { Providers } from "./providers";

const client = new Ably.Realtime({
  key: process.env.NEXT_PUBLIC_ABLY_API_KEY!,
  clientId: "slackclone",
});

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AblyProvider client={client}>
        <ChannelProvider channelName="messages">{children}</ChannelProvider>
      </AblyProvider>
    </Providers>
  );
}
