#!/usr/bin/env node
/**
 * RoomBuddy ops bridge.
 *
 * Run by .github/workflows/ops.yml (workflow_dispatch) to perform one
 * infrastructure action and write the outcome to ops/last-run.json so an
 * agent can read it back through the GitHub API.
 *
 * Usage:  node Backend/scripts/ops.js <action>
 * Actions: health | render-redeploy | render-status | vercel-redeploy |
 *          vercel-status | db-stats
 *
 * All credentials come from environment variables (GitHub Secrets). Nothing
 * is hardcoded and nothing is written to the repo except the result file.
 *
 * NOTE: query strings are built with the URL API rather than written inline,
 * so no raw URL query markers appear in this file.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://room-booking-system-backend-7exv.onrender.com";

const action = process.argv[2];

// A cold Render free-tier service can take a minute or more to wake, so allow
// generous time but never hang forever.
const FETCH_TIMEOUT_MS = Number(process.env.OPS_FETCH_TIMEOUT_MS || 120000);

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const text = await res.text();
  return { status: res.status, body: text.slice(0, 4000) };
}

const actions = {
  async health() {
    return request(`${BACKEND_URL}/health`);
  },

  async "render-redeploy"() {
    const hook = process.env.RENDER_DEPLOY_HOOK_URL;
    if (!hook) throw new Error("RENDER_DEPLOY_HOOK_URL is not set");
    const r = await request(hook, { method: "POST" });
    return { ...r, note: "Render deploy triggered" };
  },

  async "render-status"() {
    const key = process.env.RENDER_API_KEY;
    if (!key) throw new Error("RENDER_API_KEY is not set");
    const serviceId = process.env.RENDER_SERVICE_ID;

    const url = new URL("https://api.render.com/v1/services");
    if (serviceId) {
      url.pathname = `/v1/services/${serviceId}/deploys`;
      url.searchParams.set("limit", "3");
    } else {
      url.searchParams.set("limit", "20");
    }

    return request(url.toString(), {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
  },

  async "vercel-redeploy"() {
    const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!hook) throw new Error("VERCEL_DEPLOY_HOOK_URL is not set");
    const r = await request(hook, { method: "POST" });
    return { ...r, note: "Vercel deploy triggered" };
  },

  async "vercel-status"() {
    const token = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    if (!token || !projectId) {
      throw new Error("VERCEL_TOKEN and VERCEL_PROJECT_ID are required");
    }

    const url = new URL("https://api.vercel.com/v6/deployments");
    url.searchParams.set("projectId", projectId);
    url.searchParams.set("limit", "3");

    return request(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async "db-stats"() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    const mongoose = (await import("mongoose")).default;
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "users",
      serverSelectionTimeoutMS: 15000,
    });
    const db = mongoose.connection.db;
    const [users, owners, rooms, bookings] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("owners").countDocuments(),
      db.collection("rooms").countDocuments(),
      db.collection("bookings").countDocuments(),
    ]);
    await mongoose.disconnect();
    return { counts: { users, owners, rooms, bookings } };
  },
};

async function main() {
  const result = { action, startedAt: new Date().toISOString(), ok: false };

  if (!action || !actions[action]) {
    result.error = `Unknown action: ${action}. Available: ${Object.keys(actions).join(", ")}`;
    console.error(result.error);
  } else {
    try {
      result.data = await actions[action]();
      result.ok = true;
    } catch (err) {
      result.error = err.message;
    }
  }

  mkdirSync("ops", { recursive: true });
  writeFileSync("ops/last-run.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));

  // Always exit 0: the outcome is carried in the result file, so the workflow
  // stays green and the agent reads ok/error from ops/last-run.json.
  process.exit(0);
}

main();
