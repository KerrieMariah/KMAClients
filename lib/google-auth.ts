import "server-only"

import { google } from "googleapis"

let authClient: InstanceType<typeof google.auth.GoogleAuth> | null = null

export function getGoogleAuth() {
  if (authClient) return authClient

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!email || !rawKey) {
    throw new Error("Missing Google service account credentials")
  }

  const key = rawKey
    .replace(/\\n/g, "\n")
    .replace(/^["']|["'],?$/g, "")
    .trim()

  authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key,
    },
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  })

  return authClient
}
