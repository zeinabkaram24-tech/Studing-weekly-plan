import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "visitors.json");

interface VisitorItem {
  id: string;
  email: string;
  name?: string;
  studentGrade?: string;
  firstSeenAt: number;
  lastSeenAt: number;
  visitCount: number;
  userAgent?: string;
  device?: string;
}

interface VisitorsDatabase {
  visitors: VisitorItem[];
  lastUpdated: number;
}

// Ensure data folder and database file exist
function initDatabase(): VisitorsDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error initializing visitors db:", err);
  }

  const initial: VisitorsDatabase = {
    visitors: [
      {
        id: "owner-zeinab",
        email: "zeinabkaram909@gmail.com",
        name: "الأستاذة زينب (المسؤول)",
        studentGrade: "Grade 2B",
        firstSeenAt: Date.now() - 86400000 * 5,
        lastSeenAt: Date.now(),
        visitCount: 15,
        device: "Admin Account",
      },
    ],
    lastUpdated: Date.now(),
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write initial visitors db:", err);
  }

  return initial;
}

function saveDatabase(db: VisitorsDatabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.lastUpdated = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save visitors db:", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  let db = initDatabase();

  // 1. Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // 2. Public / summary stats (count of visitors and total visits)
  app.get("/api/visitors/stats", (_req, res) => {
    const totalUniqueEmails = db.visitors.length;
    const totalVisits = db.visitors.reduce((acc, v) => acc + (v.visitCount || 1), 0);

    // Active today (within last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todayVisits = db.visitors.filter((v) => v.lastSeenAt >= oneDayAgo).length;

    res.json({
      totalUniqueEmails,
      totalVisits,
      todayVisits,
      lastUpdated: db.lastUpdated,
    });
  });

  // 3. Register or log a visitor email
  app.post("/api/visitors/register", (req, res) => {
    const { email, name, studentGrade, userAgent, device } = req.body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanGrade = typeof studentGrade === "string" ? studentGrade.trim() : "";

    const existingIndex = db.visitors.findIndex(
      (v) => v.email.toLowerCase() === cleanEmail
    );

    let resultVisitor: VisitorItem;
    let isNew = false;

    if (existingIndex >= 0) {
      // Update existing record
      const existing = db.visitors[existingIndex];
      existing.lastSeenAt = Date.now();
      existing.visitCount = (existing.visitCount || 1) + 1;
      if (cleanName && (!existing.name || existing.name === cleanEmail)) {
        existing.name = cleanName;
      }
      if (cleanGrade && !existing.studentGrade) {
        existing.studentGrade = cleanGrade;
      }
      if (device) existing.device = device;
      resultVisitor = existing;
    } else {
      // New visitor
      isNew = true;
      resultVisitor = {
        id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email: cleanEmail,
        name: cleanName || cleanEmail.split("@")[0],
        studentGrade: cleanGrade || "Grade 2B",
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        visitCount: 1,
        userAgent: typeof userAgent === "string" ? userAgent.substring(0, 150) : undefined,
        device: typeof device === "string" ? device : "Web Browser",
      };
      db.visitors.unshift(resultVisitor);
    }

    saveDatabase(db);

    res.json({
      success: true,
      isNew,
      visitor: resultVisitor,
      totalUniqueEmails: db.visitors.length,
    });
  });

  // 4. Ping to keep visit record fresh when reopening app
  app.post("/api/visitors/ping", (req, res) => {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.visitors.find(
      (v) => v.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      const now = Date.now();
      // Only increment visit count if more than 30 minutes since last visit
      if (now - existing.lastSeenAt > 30 * 60 * 1000) {
        existing.visitCount = (existing.visitCount || 1) + 1;
      }
      existing.lastSeenAt = now;
      saveDatabase(db);
    }

    res.json({ success: true, count: db.visitors.length });
  });

  // 5. Admin retrieval of all visitors (Full list with details)
  // Protected with either admin email or PIN "2026" / "admin"
  app.post("/api/visitors/all", (req, res) => {
    const { pin, userEmail } = req.body || {};

    const isAdminEmail =
      typeof userEmail === "string" &&
      userEmail.trim().toLowerCase() === "zeinabkaram909@gmail.com";

    const isPinCorrect = pin === "2026" || pin === "admin" || pin === "zeinab";

    if (!isAdminEmail && !isPinCorrect) {
      return res.status(403).json({
        authorized: false,
        error: "غير مصرح لك بعرض هذه البيانات. يرجى إدخال رمز المرور أو بريد المسؤول.",
      });
    }

    const totalUniqueEmails = db.visitors.length;
    const totalVisits = db.visitors.reduce((acc, v) => acc + (v.visitCount || 1), 0);

    // Sort by most recent activity
    const sorted = [...db.visitors].sort((a, b) => b.lastSeenAt - a.lastSeenAt);

    res.json({
      authorized: true,
      totalUniqueEmails,
      totalVisits,
      visitors: sorted,
    });
  });

  // 6. Delete visitor entry (admin management)
  app.delete("/api/visitors/:id", (req, res) => {
    const { pin, userEmail } = req.body || {};
    const { id } = req.params;

    const isAdminEmail =
      typeof userEmail === "string" &&
      userEmail.trim().toLowerCase() === "zeinabkaram909@gmail.com";
    const isPinCorrect = pin === "2026" || pin === "admin" || pin === "zeinab";

    if (!isAdminEmail && !isPinCorrect) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    db.visitors = db.visitors.filter((v) => v.id !== id);
    saveDatabase(db);

    res.json({ success: true, remaining: db.visitors.length });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
