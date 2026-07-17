#!/usr/bin/env node
/**
 * One-shot local helper to mint a Spotify refresh token with the scopes the
 * now-playing widget needs (user-read-currently-playing +
 * user-read-recently-played). See docs/operations/environment-variables.md.
 *
 * Runs the OAuth authorization-code flow on the loopback interface: starts a
 * tiny local server on the redirect URI, opens the consent page, captures the
 * returned code and exchanges it for a refresh token. Reads the client
 * id/secret from --env (default .env.local); it writes nothing back - it prints
 * the new SPOTIFY_REFRESH_TOKEN and the granted scopes for you to paste in.
 *
 * Prereq: the redirect URI (http://127.0.0.1:<port>/callback) must be registered
 * in the Spotify app dashboard (Settings -> Redirect URIs).
 *
 * Usage: pnpm spotify:token [--env .env.local] [--port 8888]
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const SCOPES = ["user-read-currently-playing", "user-read-recently-played"];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function openBrowser(url) {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  spawn(command, [url], { stdio: "ignore", detached: true }).unref();
}

const envPath = arg("env", ".env.local");
const port = Number(arg("port", "8888"));
const redirectUri = `http://127.0.0.1:${port}/callback`;

const env = loadEnv(envPath);
const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error(`Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in ${envPath}`);
  process.exit(1);
}

const state = randomBytes(8).toString("hex");
const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES.join(" "),
    redirect_uri: redirectUri,
    state,
    show_dialog: "true",
  });

async function exchange(code) {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Token exchange failed (${response.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, redirectUri);
  if (url.pathname !== "/callback") {
    response.writeHead(404).end();
    return;
  }
  const respond = (message) => {
    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end(message);
  };
  try {
    if (url.searchParams.get("state") !== state) throw new Error("State mismatch");
    const spotifyError = url.searchParams.get("error");
    if (spotifyError) throw new Error(`Spotify returned error: ${spotifyError}`);
    const code = url.searchParams.get("code");
    if (!code) throw new Error("No code in callback");

    const data = await exchange(code);
    respond("Refresh token minted. You can close this tab and return to the terminal.");
    console.log("\n=== SUCCESS ===");
    console.log("Granted scopes:", data.scope);
    console.log("\nSPOTIFY_REFRESH_TOKEN=" + data.refresh_token);
    server.close();
    process.exit(0);
  } catch (error) {
    respond("Error: " + error.message);
    console.error("\nERROR:", error.message);
    server.close();
    process.exit(1);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Listening on ${redirectUri}`);
  console.log(`Requesting scopes: ${SCOPES.join(", ")}`);
  console.log("\nOpening the Spotify consent page in your browser...");
  console.log("If it does not open, paste this URL manually:\n");
  console.log(authUrl + "\n");
  openBrowser(authUrl);
});
