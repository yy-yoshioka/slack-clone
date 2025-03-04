import * as Ably from "ably";

let ably: Ably.Rest | null = null;

export function getAblyClient() {
  if (!ably) {
    ably = new Ably.Rest(process.env.NEXT_PUBLIC_ABLY_API_KEY || "");
  }
  return ably;
}
