import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check
app.get("/make-server-cb991f29/health", (c) => c.json({ status: "ok" }));

// Kanka API proxy — forwards any path to kanka.io using the stored secret token
app.get("/make-server-cb991f29/kanka/*", async (c) => {
  const token = Deno.env.get("KANKA_API_TOKEN");
  if (!token) {
    return c.json({ error: "KANKA_API_TOKEN secret not set on this Edge Function." }, 500);
  }

  // Strip our prefix to get the Kanka path e.g. /campaigns/123/characters
  const url = new URL(c.req.url);
  const kankaPath = url.pathname.replace("/make-server-cb991f29/kanka", "");
  const kankaUrl = `https://kanka.io/api/1.0${kankaPath}${url.search}`;

  const res = await fetch(kankaUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return c.json(data, res.status as 200);
});

Deno.serve(app.fetch);
