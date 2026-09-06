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
  name: string;
  loginType: 'student' | 'visitor' | 'admin';
  studentGrade?: string;
  section?: string;
  firstSeenAt: number;
  lastSeenAt: number;
  visitCount: number;
  dailyVisits?: Record<string, number>;
  device?: string;
  email?: string;
  userAgent?: string;
}

interface VisitorsDatabase {
  visitors: VisitorItem[];
  lastUpdated: number;
}

// Calendar day string in Egypt timezone (Africa/Cairo): "YYYY-MM-DD"
// Midnight (12:00 AM) strictly starts a new calendar date
function getCairoDateKey(timestamp: number = Date.now()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date(timestamp));
  } catch {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

// Descriptive Arabic label for Egypt date: e.g. "الأحد، 6 سبتمبر 2026"
function getCairoDateLabel(timestamp: number = Date.now()): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: 'Africa/Cairo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleDateString('ar-EG');
  }
}

function calculateStats(visitors: VisitorItem[], lastUpdated: number) {
  const todayKey = getCairoDateKey();
  const todayDateLabel = getCairoDateLabel();

  // Cumulative all-time stats
  const totalUsers = visitors.length;
  const totalStudentsNamed = visitors.filter((v) => v.loginType === 'student').length;
  const totalVisitorsGuest = visitors.filter((v) => v.loginType === 'visitor').length;
  const totalVisits = visitors.reduce((acc, v) => acc + (v.visitCount || 1), 0);

  // STRICT DAILY CENSUS: from 12:00 AM midnight to 12:00 AM next day
  // Resets completely to 0 at 12:00 AM for the new day
  const activeTodayVisitors = visitors.filter((v) => {
    if (v.dailyVisits && typeof v.dailyVisits[todayKey] === 'number' && v.dailyVisits[todayKey] > 0) {
      return true;
    }
    return getCairoDateKey(v.lastSeenAt) === todayKey;
  });

  const todayStudentsNamed = activeTodayVisitors.filter((v) => v.loginType === 'student').length;
  const todayVisitorsGuest = activeTodayVisitors.filter((v) => v.loginType === 'visitor').length;
  const todayTotalUsers = activeTodayVisitors.length;

  // Total session/platform visits recorded today since 12:00 AM midnight
  const todayVisits = activeTodayVisitors.reduce((acc, v) => {
    if (v.dailyVisits && typeof v.dailyVisits[todayKey] === 'number') {
      return acc + v.dailyVisits[todayKey];
    }
    return acc + (getCairoDateKey(v.lastSeenAt) === todayKey ? 1 : 0);
  }, 0);

  // Cumulative Section Counts
  const sectionCounts = {
    '2A': visitors.filter((v) => v.section === '2A' || (v.studentGrade && v.studentGrade.includes('2A'))).length,
    '2B': visitors.filter((v) => v.section === '2B' || (v.studentGrade && v.studentGrade.includes('2B'))).length,
    '2C': visitors.filter((v) => v.section === '2C' || (v.studentGrade && v.studentGrade.includes('2C'))).length,
    other: visitors.filter((v) => {
      const isA = v.section === '2A' || (v.studentGrade && v.studentGrade.includes('2A'));
      const isB = v.section === '2B' || (v.studentGrade && v.studentGrade.includes('2B'));
      const isC = v.section === '2C' || (v.studentGrade && v.studentGrade.includes('2C'));
      return !isA && !isB && !isC;
    }).length,
  };

  // Today's Section Counts
  const todaySectionCounts = {
    '2A': activeTodayVisitors.filter((v) => v.section === '2A' || (v.studentGrade && v.studentGrade.includes('2A'))).length,
    '2B': activeTodayVisitors.filter((v) => v.section === '2B' || (v.studentGrade && v.studentGrade.includes('2B'))).length,
    '2C': activeTodayVisitors.filter((v) => v.section === '2C' || (v.studentGrade && v.studentGrade.includes('2C'))).length,
    other: activeTodayVisitors.filter((v) => {
      const isA = v.section === '2A' || (v.studentGrade && v.studentGrade.includes('2A'));
      const isB = v.section === '2B' || (v.studentGrade && v.studentGrade.includes('2B'));
      const isC = v.section === '2C' || (v.studentGrade && v.studentGrade.includes('2C'));
      return !isA && !isB && !isC;
    }).length,
  };

  return {
    totalUsers,
    totalStudentsNamed,
    totalVisitorsGuest,
    totalVisits,
    todayDateString: todayKey,
    todayDateLabel,
    todayTotalUsers,
    todayStudentsNamed,
    todayVisitorsGuest,
    todayVisits,
    lastUpdated,
    sectionCounts,
    todaySectionCounts,
  };
}

// Ensure data folder and database file exist
function initDatabase(): VisitorsDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed: VisitorsDatabase = JSON.parse(content);
      // Normalize existing records
      if (Array.isArray(parsed.visitors)) {
        parsed.visitors = parsed.visitors.map((v: any) => {
          let loginType: 'student' | 'visitor' | 'admin' = v.loginType || 'student';
          if (v.id === 'owner-zeinab' || (v.name && v.name.includes('المسؤول'))) {
            loginType = 'admin';
          } else if (!v.name || v.name.trim() === 'زائر' || v.name.startsWith('زائر') || v.name === 'Guest') {
            loginType = 'visitor';
          }
          return {
            id: v.id || `vis-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: v.name || (loginType === 'visitor' ? 'زائر' : 'طالب'),
            loginType,
            studentGrade: v.studentGrade || (loginType === 'visitor' ? 'زائر' : 'Grade 2'),
            section: v.section || (v.studentGrade && v.studentGrade.includes('2A') ? '2A' : v.studentGrade && v.studentGrade.includes('2B') ? '2B' : v.studentGrade && v.studentGrade.includes('2C') ? '2C' : undefined),
            firstSeenAt: v.firstSeenAt || Date.now(),
            lastSeenAt: v.lastSeenAt || Date.now(),
            visitCount: v.visitCount || 1,
            dailyVisits: v.dailyVisits || {},
            device: v.device || 'متصفح ويب',
            email: v.email,
            userAgent: v.userAgent,
          };
        });
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error initializing visitors db:", err);
  }

  const initial: VisitorsDatabase = {
    visitors: [
      {
        id: "owner-zeinab",
        name: "الأستاذة زينب (المسؤول)",
        loginType: "admin",
        studentGrade: "Grade 2",
        section: "all",
        firstSeenAt: Date.now() - 86400000 * 5,
        lastSeenAt: Date.now(),
        visitCount: 15,
        device: "Admin Account",
        email: "zeinabkaram909@gmail.com",
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
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  let db = initDatabase();

  const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
  const MATERIALS_FILE = path.join(DATA_DIR, "materials.json");

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (e) {
      console.error("Failed to create uploads dir:", e);
    }
  }

  function getStoredMaterials(): any[] {
    try {
      if (fs.existsSync(MATERIALS_FILE)) {
        const raw = fs.readFileSync(MATERIALS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to read materials.json:", e);
    }
    return [];
  }

  function saveStoredMaterials(list: any[]) {
    try {
      fs.writeFileSync(MATERIALS_FILE, JSON.stringify(list, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write materials.json:", e);
    }
  }

  // 1. Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // 2. Public summary stats (Total users, students logged in by name, visitors, total visits)
  app.get("/api/visitors/stats", (_req, res) => {
    const stats = calculateStats(db.visitors, db.lastUpdated);
    res.json(stats);
  });

  // 3. Register or log a student by name OR guest visitor
  app.post("/api/visitors/register", (req, res) => {
    const {
      name,
      studentName,
      studentGrade,
      section,
      isGuest,
      visitorId,
      userAgent,
      device,
    } = req.body || {};

    const cleanName = (typeof studentName === "string" && studentName.trim())
      ? studentName.trim()
      : (typeof name === "string" && name.trim())
      ? name.trim()
      : "";

    const isExplicitGuest = Boolean(isGuest) || (!cleanName && Boolean(visitorId));
    const cleanSection = typeof section === "string" && ['2A', '2B', '2C'].includes(section) ? section : undefined;
    const cleanGrade = typeof studentGrade === "string" && studentGrade.trim()
      ? studentGrade.trim()
      : cleanSection
      ? `Grade ${cleanSection}`
      : "Grade 2";

    let resultVisitor: VisitorItem;
    let isNew = false;
    const todayKey = getCairoDateKey();

    if (isExplicitGuest && !cleanName) {
      // Guest Visitor without name
      const existingGuestIndex = db.visitors.findIndex(
        (v) => (visitorId && v.id === visitorId)
      );

      if (existingGuestIndex >= 0) {
        const existing = db.visitors[existingGuestIndex];
        existing.lastSeenAt = Date.now();
        existing.visitCount = (existing.visitCount || 1) + 1;
        if (!existing.dailyVisits) existing.dailyVisits = {};
        existing.dailyVisits[todayKey] = (existing.dailyVisits[todayKey] || 0) + 1;
        if (cleanSection) existing.section = cleanSection;
        if (device) existing.device = device;
        resultVisitor = existing;
      } else {
        isNew = true;
        const dailyVisits: Record<string, number> = {};
        dailyVisits[todayKey] = 1;
        resultVisitor = {
          id: visitorId || `vis-guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: "زائر",
          loginType: "visitor",
          studentGrade: cleanSection ? `زائر (فصل ${cleanSection})` : "زائر",
          section: cleanSection,
          firstSeenAt: Date.now(),
          lastSeenAt: Date.now(),
          visitCount: 1,
          dailyVisits,
          userAgent: typeof userAgent === "string" ? userAgent.substring(0, 150) : undefined,
          device: typeof device === "string" ? device : "متصفح ويب",
        };
        db.visitors.unshift(resultVisitor);
      }
    } else {
      // Student Logging In By Name
      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({ error: "اسم الطالب مطلوب لتسجيل الدخول (حرفين على الأقل)" });
      }

      // Check if student with same name exists, or promote existing guest with visitorId
      const existingIndex = db.visitors.findIndex(
        (v) => (v.name && v.name.toLowerCase() === cleanName.toLowerCase()) ||
               (visitorId && v.id === visitorId)
      );

      if (existingIndex >= 0) {
        const existing = db.visitors[existingIndex];
        existing.name = cleanName;
        existing.loginType = "student";
        existing.lastSeenAt = Date.now();
        existing.visitCount = (existing.visitCount || 1) + 1;
        if (!existing.dailyVisits) existing.dailyVisits = {};
        existing.dailyVisits[todayKey] = (existing.dailyVisits[todayKey] || 0) + 1;
        if (cleanGrade) existing.studentGrade = cleanGrade;
        if (cleanSection) existing.section = cleanSection;
        if (device) existing.device = device;
        resultVisitor = existing;
      } else {
        isNew = true;
        const dailyVisits: Record<string, number> = {};
        dailyVisits[todayKey] = 1;
        resultVisitor = {
          id: visitorId || `std-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: cleanName,
          loginType: "student",
          studentGrade: cleanGrade,
          section: cleanSection,
          firstSeenAt: Date.now(),
          lastSeenAt: Date.now(),
          visitCount: 1,
          dailyVisits,
          userAgent: typeof userAgent === "string" ? userAgent.substring(0, 150) : undefined,
          device: typeof device === "string" ? device : "متصفح ويب",
        };
        db.visitors.unshift(resultVisitor);
      }
    }

    saveDatabase(db);

    const stats = calculateStats(db.visitors, db.lastUpdated);

    res.json({
      success: true,
      isNew,
      visitor: resultVisitor,
      stats,
      totalUsers: db.visitors.length,
      totalStudentsNamed: stats.totalStudentsNamed,
      totalVisitorsGuest: stats.totalVisitorsGuest,
    });
  });

  // 4. Ping to keep visit record fresh when reopening app
  app.post("/api/visitors/ping", (req, res) => {
    const { studentName, name, visitorId, section } = req.body || {};
    const cleanName = (typeof studentName === "string" && studentName.trim())
      ? studentName.trim()
      : (typeof name === "string" && name.trim())
      ? name.trim()
      : "";

    const todayKey = getCairoDateKey();

    let existing = db.visitors.find(
      (v) => (cleanName && v.name && v.name.toLowerCase() === cleanName.toLowerCase()) ||
             (visitorId && v.id === visitorId)
    );

    if (existing) {
      const now = Date.now();
      if (!existing.dailyVisits) existing.dailyVisits = {};
      const lastSeenDay = getCairoDateKey(existing.lastSeenAt);

      // Increment visit if last seen on another day or more than 15 mins ago
      if (lastSeenDay !== todayKey || now - existing.lastSeenAt > 15 * 60 * 1000) {
        existing.visitCount = (existing.visitCount || 1) + 1;
        existing.dailyVisits[todayKey] = (existing.dailyVisits[todayKey] || 0) + 1;
      } else if (!existing.dailyVisits[todayKey]) {
        existing.dailyVisits[todayKey] = 1;
      }
      existing.lastSeenAt = now;
      if (section && !existing.section) existing.section = section;
      saveDatabase(db);
    } else if (visitorId) {
      // Auto-register guest on ping if not yet recorded
      const dailyVisits: Record<string, number> = {};
      dailyVisits[todayKey] = 1;
      const newGuest: VisitorItem = {
        id: visitorId,
        name: cleanName || "زائر",
        loginType: cleanName ? "student" : "visitor",
        studentGrade: section ? `فصل ${section}` : "زائر",
        section: section,
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        visitCount: 1,
        dailyVisits,
        device: "متصفح ويب",
      };
      db.visitors.unshift(newGuest);
      saveDatabase(db);
    }

    res.json({ success: true, count: db.visitors.length });
  });

  // 5. Admin retrieval of all visitors & students login report
  // Protected with either admin email or PIN "2026" / "admin" / "zeinab"
  app.post("/api/visitors/all", (req, res) => {
    const { pin, userEmail } = req.body || {};

    const normalizedEmail = typeof userEmail === "string" ? userEmail.trim().toLowerCase() : "";
    const pinStr = typeof pin === "string" ? pin.trim().toLowerCase() : "";
    const candidate = normalizedEmail || pinStr;

    const authorizedAdminEmails = [
      "zeinabkaram909@gmail.com",
      "zeinabkaram24@gmail.com",
      "faridaferghali2019@gmail.com",
    ];

    const isAdminEmail =
      authorizedAdminEmails.includes(candidate) ||
      authorizedAdminEmails.includes(normalizedEmail) ||
      authorizedAdminEmails.includes(pinStr) ||
      normalizedEmail.includes("admin");

    const isPinCorrect = pinStr === "2026" || pinStr === "admin" || pinStr === "zeinab" || pinStr === "1234";

    if (!isAdminEmail && !isPinCorrect) {
      return res.status(403).json({
        authorized: false,
        error: "غير مصرح لك بعرض تقرير الدخول. يرجى إدخال أحد الإيميلات الإدارية المعتمدة أو رمز المرور السري.",
      });
    }

    const stats = calculateStats(db.visitors, db.lastUpdated);
    const todayKey = stats.todayDateString;

    // Enhance each visitor with today's status:
    const enriched = db.visitors.map((v) => {
      const isToday = (v.dailyVisits && typeof v.dailyVisits[todayKey] === 'number' && v.dailyVisits[todayKey] > 0) ||
                      getCairoDateKey(v.lastSeenAt) === todayKey;
      return {
        ...v,
        visitedToday: isToday,
        todayVisitsCount: v.dailyVisits?.[todayKey] || (isToday ? 1 : 0),
      };
    });

    // Sort: people who attended today first (sorted by lastSeenAt desc), then others by lastSeenAt desc
    const sorted = enriched.sort((a, b) => {
      if (a.visitedToday !== b.visitedToday) {
        return a.visitedToday ? -1 : 1;
      }
      return b.lastSeenAt - a.lastSeenAt;
    });

    res.json({
      authorized: true,
      stats,
      totalUsers: stats.totalUsers,
      totalStudentsNamed: stats.totalStudentsNamed,
      totalVisitorsGuest: stats.totalVisitorsGuest,
      totalVisits: stats.totalVisits,
      visitors: sorted,
    });
  });

  // 6. Delete visitor entry (admin management)
  app.delete("/api/visitors/:id", (req, res) => {
    const { pin, userEmail } = req.body || {};
    const { id } = req.params;

    const normalizedEmail = typeof userEmail === "string" ? userEmail.trim().toLowerCase() : "";
    const pinStr = typeof pin === "string" ? pin.trim().toLowerCase() : "";
    const authorizedAdminEmails = [
      "zeinabkaram909@gmail.com",
      "zeinabkaram24@gmail.com",
      "faridaferghali2019@gmail.com",
    ];

    const isAdminEmail =
      authorizedAdminEmails.includes(normalizedEmail) ||
      authorizedAdminEmails.includes(pinStr);
    const isPinCorrect = pinStr === "2026" || pinStr === "admin" || pinStr === "zeinab" || pinStr === "1234";

    if (!isAdminEmail && !isPinCorrect) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Do not delete primary admin owner
    if (id === "owner-zeinab") {
      return res.status(400).json({ error: "لا يمكن حذف حساب المسؤول الرئيسي" });
    }

    db.visitors = db.visitors.filter((v) => v.id !== id);
    saveDatabase(db);

    res.json({ success: true, remaining: db.visitors.length });
  });

  // =========================================================================
  // MATERIALS & PDF MANAGEMENT API
  // =========================================================================

  // 7. Get all materials
  app.get("/api/materials", (_req, res) => {
    const list = getStoredMaterials();
    res.json({ success: true, materials: list });
  });

  // 8. Add or upload a material (with optional PDF base64 file)
  app.post("/api/materials", (req, res) => {
    try {
      const {
        title,
        subjectId,
        blockNumber,
        category,
        categoryLabel,
        itemType,
        fileName,
        fileUrl,
        fileBase64,
        fileSize,
        pageRange,
        pageCount,
        unitTitle,
        notes,
        section,
        contentPreview,
      } = req.body || {};

      if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "عنوان الشيت مطلوب" });
      }

      const fileId = `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let finalFileUrl = typeof fileUrl === "string" ? fileUrl : undefined;

      // Handle binary/base64 PDF upload if provided
      if (typeof fileBase64 === "string" && fileBase64.length > 50) {
        try {
          const rawBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, "").replace(/^data:.*?;base64,/, "");
          const buffer = Buffer.from(rawBase64, "base64");
          const safeFileName = `${fileId}.pdf`;
          const filePath = path.join(UPLOADS_DIR, safeFileName);
          fs.writeFileSync(filePath, buffer);
          finalFileUrl = `/api/materials/file/${fileId}`;
        } catch (e) {
          console.error("Failed to write uploaded PDF to disk:", e);
        }
      }

      const newItem = {
        id: fileId,
        title: title.trim(),
        subjectId: subjectId || "science",
        blockNumber: Number(blockNumber) || 1,
        category: category || "week1",
        categoryLabel: categoryLabel || (category === "week1" ? "Week 1" : category === "week2" ? "Week 2" : category === "week3" ? "Week 3" : "Main Sheets"),
        itemType: itemType || "sheet",
        fileName: fileName ? fileName.trim() : undefined,
        fileUrl: finalFileUrl,
        fileSize: fileSize || undefined,
        pageRange: pageRange ? pageRange.trim() : undefined,
        pageCount: pageCount ? Number(pageCount) : undefined,
        unitTitle: unitTitle ? unitTitle.trim() : undefined,
        notes: notes ? notes.trim() : undefined,
        section: section || "all",
        contentPreview: contentPreview || undefined,
        createdAt: Date.now(),
        isUserUploaded: true,
      };

      const current = getStoredMaterials();
      const updated = [newItem, ...current];
      saveStoredMaterials(updated);

      res.json({ success: true, material: newItem });
    } catch (err: any) {
      console.error("Error creating material:", err);
      res.status(500).json({ error: "فشل حفظ الشيت: " + (err?.message || "Unknown error") });
    }
  });

  // 9. Serve authentic PDF file
  app.get("/api/materials/file/:fileId", (req, res) => {
    try {
      const { fileId } = req.params;
      const safeFileName = `${fileId.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf`;
      const filePath = path.join(UPLOADS_DIR, safeFileName);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "ملف الـ PDF غير موجود على الخادم" });
      }

      const list = getStoredMaterials();
      const found = list.find((m) => m.id === fileId);
      const downloadName = found?.fileName || `NileSchools_Sheet_${fileId}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(downloadName)}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (err: any) {
      console.error("Error serving PDF file:", err);
      res.status(500).json({ error: "تعذر فتح ملف الـ PDF" });
    }
  });

  // 10. Delete a material
  app.delete("/api/materials/:id", (req, res) => {
    try {
      const { id } = req.params;
      const current = getStoredMaterials();
      const updated = current.filter((m) => m.id !== id);
      saveStoredMaterials(updated);

      // Clean up file if on disk
      try {
        const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // ignore
      }

      res.json({ success: true, count: updated.length });
    } catch (err: any) {
      console.error("Error deleting material:", err);
      res.status(500).json({ error: "فشل حذف الشيت" });
    }
  });

  // 11. Sync materials list from client
  app.post("/api/materials/sync", (req, res) => {
    try {
      const { materials } = req.body || {};
      if (Array.isArray(materials)) {
        saveStoredMaterials(materials);
      }
      res.json({ success: true, count: Array.isArray(materials) ? materials.length : 0 });
    } catch (err: any) {
      console.error("Error syncing materials:", err);
      res.status(500).json({ error: "فشل المزامنة" });
    }
  });

  // 12. Clear all materials
  app.post("/api/materials/clear-all", (_req, res) => {
    try {
      saveStoredMaterials([]);
      res.json({ success: true, count: 0 });
    } catch (err: any) {
      console.error("Error clearing materials:", err);
      res.status(500).json({ error: "فشل مسح الشيتات" });
    }
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
