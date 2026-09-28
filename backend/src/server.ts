import http from "node:http";
import { authenticateUser, registerUser, getCurrentUser, clearSessionCookie } from "./auth";
import { serverEnv } from "./config/env";

const PORT = serverEnv.PORT || 5000;

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  // Health check
  if (pathname === "/health" || pathname === "/api/health") {
    return sendJson(res, 200, { status: "ok", service: "streamvault-backend" });
  }

  // Auth: Login
  if (pathname === "/api/auth/login" && method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const result = await authenticateUser(body.identifier, body.password);
      return sendJson(res, result.status, result.success ? { success: true, user: result.user } : { error: result.error });
    } catch (err) {
      console.error("[Backend Server] Login error:", err);
      return sendJson(res, 500, { error: "Internal server error." });
    }
  }

  // Auth: Register
  if (pathname === "/api/auth/register" && method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const result = await registerUser(body);
      return sendJson(res, result.status, result.success ? { success: true, user: result.user } : { error: result.error });
    } catch (err) {
      console.error("[Backend Server] Register error:", err);
      return sendJson(res, 500, { error: "Internal server error." });
    }
  }

  // Auth: Logout
  if (pathname === "/api/auth/logout" && method === "POST") {
    try {
      await clearSessionCookie();
      return sendJson(res, 200, { success: true });
    } catch {
      return sendJson(res, 200, { success: true });
    }
  }

  // Auth: Me
  if (pathname === "/api/auth/me" && method === "GET") {
    try {
      const user = await getCurrentUser();
      return sendJson(res, 200, { user });
    } catch {
      return sendJson(res, 200, { user: null });
    }
  }

  // 404 Not Found
  return sendJson(res, 404, { error: "Endpoint not found." });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[StreamVault Backend] Server listening at http://localhost:${PORT}`);
  });
}
