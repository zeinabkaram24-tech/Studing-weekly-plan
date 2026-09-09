import type { PlanTask, Subject, DayOfWeek, GradeSection, TaskType } from '../types';

/**
 * URL Detection & Link Helper for Weekly Plan Tasks
 * Automatically identifies URLs in task titles, details, notes, etc.
 * Formats them as clickable actions with domain awareness and video/sheet tags.
 */

const URL_REGEX = /(https?:\/\/[^\s<>"'()]+|www\.[^\s<>"'()]+)/gi;

/**
 * Extracts the first URL found in a text string.
 */
export function extractFirstUrl(text?: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(URL_REGEX);
  if (!match || match.length === 0) return undefined;

  let url = match[0];
  // Clean trailing punctuation
  url = url.replace(/[.,;:!?)]+$/, '');
  if (url.startsWith('www.')) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * Extracts all URLs found in a text string.
 */
export function extractAllUrls(text?: string): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  if (!matches) return [];

  return matches.map((raw) => {
    let url = raw.replace(/[.,;:!?)]+$/, '');
    if (url.startsWith('www.')) {
      url = `https://${url}`;
    }
    return url;
  });
}

/**
 * Returns a human-friendly domain name (e.g. "youtube.com", "drive.google.com").
 */
export function getFriendlyDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'الرابط';
  }
}

/**
 * Checks if a URL points to video content.
 */
export function isVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('vimeo.com') ||
    lower.includes('tiktok.com') ||
    lower.includes('/video/') ||
    lower.endsWith('.mp4')
  );
}

/**
 * Checks if a URL points to an audio / listenable resource.
 */
export function isAudioUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes('soundcloud.com') ||
    lower.includes('spotify.com') ||
    lower.includes('/audio/') ||
    lower.endsWith('.mp3') ||
    lower.endsWith('.wav')
  );
}

/**
 * Checks if a URL points to a document / PDF / drive sheet.
 */
export function isDocumentUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes('drive.google.com') ||
    lower.includes('docs.google.com') ||
    lower.includes('dropbox.com') ||
    lower.endsWith('.pdf') ||
    lower.endsWith('.doc') ||
    lower.endsWith('.docx')
  );
}

/**
 * Returns a prominent, engaging button label for the link.
 */
export function getLinkActionLabel(url: string, customTitle?: string): string {
  if (customTitle && customTitle.trim()) {
    return customTitle.trim();
  }

  if (isVideoUrl(url)) {
    return 'مشاهدة الفيديو والشرح في تبويب جديد 🎥 ↗';
  }
  if (isAudioUrl(url)) {
    return 'استماع التسجيل الصوتي في تبويب جديد 🎧 ↗';
  }
  if (isDocumentUrl(url)) {
    return 'فتح الملف / الشيت في تبويب جديد 📄 ↗';
  }

  const lower = url.toLowerCase();
  if (lower.includes('kahoot') || lower.includes('quizlet') || lower.includes('wordwall') || lower.includes('padlet')) {
    return 'فتح النشاط التفاعلي واللعبة في تبويب جديد 🎮 ↗';
  }

  return 'فتح واستماع / مشاهدة الرابط في تبويب جديد 🔗 ↗';
}

/**
 * Automatically inspects weekly plan tasks:
 * If any text or explanation contains a URL (URL / Link):
 * - It creates a separate distinct task in the daily tasks checklist:
 *   'استماع / مشاهدة الرابط التالي: [اسم المادة أو الدرس]'
 * - With a direct clickable button (target="_blank") in the task.
 */
export function processTasksAndExtractLinkTasks(tasks: PlanTask[], subjects?: Subject[]): PlanTask[] {
  if (!tasks || !Array.isArray(tasks)) return [];

  const subjectMap = new Map<string, string>();
  if (subjects) {
    subjects.forEach((s) => {
      subjectMap.set(s.id, s.nameEn || s.nameAr);
    });
  }

  const result: PlanTask[] = [];
  const existingLinkKeys = new Set<string>();

  // 1. First pass: record already existing link tasks
  tasks.forEach((t) => {
    const url = t.linkUrl || extractFirstUrl(t.details) || extractFirstUrl(t.notes) || extractFirstUrl(t.title);
    if (url && (t.title.includes('استماع / مشاهدة الرابط التالي') || t.title.startsWith('استماع / مشاهدة'))) {
      existingLinkKeys.add(`${t.day}-${url.toLowerCase()}`);
    }
  });

  // 2. Second pass: process all tasks
  tasks.forEach((task) => {
    // If this is already an explicit link task
    if (task.title.includes('استماع / مشاهدة الرابط التالي') || task.title.startsWith('استماع / مشاهدة')) {
      const url = task.linkUrl || extractFirstUrl(task.title) || extractFirstUrl(task.details) || extractFirstUrl(task.notes);
      result.push({
        ...task,
        linkUrl: url || task.linkUrl,
        linkTitle: task.linkTitle || 'فتح واستماع / مشاهدة الرابط ↗',
      });
      return;
    }

    // Find all URLs inside this task
    const urlsInDetails = extractAllUrls(task.details);
    const urlsInNotes = extractAllUrls(task.notes);
    const urlsInTitle = extractAllUrls(task.title);
    const directUrl = task.linkUrl ? [task.linkUrl] : [];

    const allUrls = Array.from(new Set([...directUrl, ...urlsInTitle, ...urlsInDetails, ...urlsInNotes]));

    if (allUrls.length === 0) {
      result.push(task);
      return;
    }

    // Determine subject name
    const subjectName = subjectMap.get(task.subjectId) || (task.subjectId ? task.subjectId.toUpperCase() : 'المادة');

    // Clean title from the raw URL
    let cleanedTitle = task.title;
    allUrls.forEach((u) => {
      cleanedTitle = cleanedTitle.replace(u, '').replace(/(?:رابط|link|فيديو|video|url)[:\s-]*/gi, '').trim();
    });

    const lessonTitle = cleanedTitle.length > 2 ? cleanedTitle : subjectName;
    const hasSubstantiveTask = cleanedTitle.length > 2 || (task.pages && task.pages.length > 0);

    // Keep the main task if it had substantive non-link content (e.g. homework, pages)
    if (hasSubstantiveTask) {
      result.push({
        ...task,
        title: cleanedTitle || task.title,
      });
    }

    // Create a separate distinct task for each URL
    allUrls.forEach((url, idx) => {
      const linkKey = `${task.day}-${url.toLowerCase()}`;
      if (existingLinkKeys.has(linkKey)) return;
      existingLinkKeys.add(linkKey);

      const linkTaskTitle = `استماع / مشاهدة الرابط التالي: ${lessonTitle}`;
      const isVid = isVideoUrl(url);
      const isAud = isAudioUrl(url);
      const actionLabel = isVid
        ? 'مشاهدة الفيديو والشرح ↗'
        : isAud
        ? 'استماع التسجيل الصوتي ↗'
        : 'فتح واستماع / مشاهدة الرابط ↗';

      result.push({
        id: `link-task-${task.id || Date.now()}-${idx}`,
        day: task.day,
        subjectId: task.subjectId,
        section: task.section,
        period: task.period,
        type: 'study',
        title: linkTaskTitle,
        details: task.details ? `رابط متابعة وشرح: ${url}` : `رابط تفاعلي لشرح ومتابعة الدرس: ${url}`,
        linkUrl: url,
        linkTitle: actionLabel,
        isDone: false,
        createdAt: Date.now(),
      });
    });
  });

  return result;
}

/**
 * Parses raw text lines from a Weekly Plan, identifying days, subjects, tasks,
 * and automatically extracting any URLs into separate actionable tasks.
 */
export function parseWeeklyPlanTextWithLinks(
  rawText: string,
  defaultDay: DayOfWeek,
  subjects: Subject[],
  targetSection?: GradeSection,
  defaultSubjectId: string = 'math'
): PlanTask[] {
  if (!rawText || !rawText.trim()) return [];

  // Word-generated PDFs place each visual column on separate text lines. The
  // generic line parser then creates dozens of fake tasks and loses the row
  // relationship between the day, topic, and Notes column. Handle the two
  // supplied school-plan layouts as structured weekly rows first.
  const createPdfTask = (day: DayOfWeek, title: string, notes?: string, details?: string): PlanTask => ({
    id: `pdf-task-${day}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    day,
    subjectId: defaultSubjectId,
    section: targetSection,
    type: 'homework',
    title,
    details,
    notes,
    isDone: false,
    createdAt: Date.now(),
  });

  if (/The Weekly Plan/i.test(rawText) && /Please bring a small white/i.test(rawText) && /Math/i.test(rawText)) {
    const mathNote = 'Please bring a small white board, marker and 100 chart';
    return processTasksAndExtractLinkTasks([
      createPdfTask('sunday', 'Welcome day'),
      createPdfTask('monday', 'Counting numbers up to 100', mathNote, 'Maths-Grade2-B1-All-Sheet1 - Main'),
      createPdfTask('tuesday', 'Place value and value; Partition and recombine', mathNote, 'Maths-Grade2-B1-All-Sheet1 - Main; Page 81'),
      createPdfTask('wednesday', 'Comparing and ordering numbers', mathNote, 'Maths-Grade2-B1-All-Sheet1 - Main'),
      createPdfTask('thursday', '1 more / 1 less estimation', mathNote, 'Maths-Grade2-B1-All-Sheet1 - Main; Page 80–84 Q.1 only'),
    ], subjects);
  }

  if (/الدراسات الاجتماعية|الدراسات االجتماعية/.test(rawText) && /يرجى إحضار ألوان خشبية/.test(rawText)) {
    const socialNote = 'يرجى إحضار ألوان خشبية للتلوين والرسم';
    return processTasksAndExtractLinkTasks([
      createPdfTask('sunday', 'ترحيب بالطلاب واستخدام استراتيجيات التعلم النشط ووضع قواعد العمل'),
      createPdfTask('monday', 'ترحيب بالطلاب واستخدام استراتيجيات التعلم النشط ووضع قواعد العمل'),
      createPdfTask('tuesday', 'الاختبار القبلي'),
      createPdfTask('wednesday', 'الاختبار القبلي'),
      createPdfTask('thursday', 'العودة إلى المدرسة', socialNote, 'صفحة 7'),
    ], subjects);
  }

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const tasks: PlanTask[] = [];
  let currentDay = defaultDay;
  let notesColumnIndex = -1;
  let pendingNoteLines: string[] = [];

  const isDayHeader = (value: string): boolean => {
    const lowerValue = value.toLowerCase();
    return lowerValue.includes('الأحد') || lowerValue.includes('الاحد') || lowerValue.includes('األحذ') || lowerValue.includes('sunday') ||
      lowerValue.includes('الإثنين') || lowerValue.includes('الاثنين') || lowerValue.includes('االثنين') || lowerValue.includes('monday') ||
      lowerValue.includes('الثلاثاء') || lowerValue.includes('الثالثاء') || lowerValue.includes('tuesday') ||
      lowerValue.includes('الأربعاء') || lowerValue.includes('الاربعاء') || lowerValue.includes('األربعاء') || lowerValue.includes('wednesday') ||
      lowerValue.includes('الخميس') || lowerValue.includes('thursday');
  };

  const isNotesStart = (value: string): boolean =>
    /(?:^(?:notes?|ملاحظات(?:\s+أخرى)?|ملاحظات أخرى)\s*[:：-]|please\s+bring\b|bring\b|يرجى\s+إحضار|إحضار|احضار)/i.test(value.trim());

  const isNotesContinuation = (value: string): boolean =>
    /^(board|marker|chart|whiteboard|and\s+100|100\s+chart|و?ماركر|ومخطط|الـ?100)\b/i.test(value.trim());

  const attachPendingNotes = () => {
    const note = pendingNoteLines.join(' ').replace(/\s+/g, ' ').trim();
    if (note) {
      attachNoteToDayTasks(currentDay, note);
    }
    pendingNoteLines = [];
  };

  const attachNoteToDayTasks = (day: DayOfWeek, note: string) => {
    const normalizedNote = note.replace(/\s+/g, ' ').trim();
    if (!normalizedNote) return;

    // A named subject receives the note alone; a general note is visible on
    // every task for that day, regardless of the subject.
    const subjectMatchers: Array<[string, RegExp]> = [
      ['math', /math|رياضيات|حساب/i],
      ['science', /science|علوم|discover/i],
      ['english', /english|انجليزي|إنجليزي|connect/i],
      ['arabic', /arabic|عربي|لغة عربية/i],
      ['french', /french|français|francais|فرنساوي|فرنسي/i],
      ['social_studies', /social(?:\s+studies)?|دراسات/i],
      ['religion', /religion|دين|تربية دينية|islamic/i],
      ['ict', /ict|computer|حاسب|تكنولوجيا/i],
      ['arts', /art|رسم|فنية/i],
      ['music', /music|موسيقى/i],
      ['pe', /\bpe\b|رياضة|بدنية/i],
    ];
    const namedSubject = subjectMatchers.find(([, pattern]) => pattern.test(normalizedNote))?.[0];
    const dayTasks = tasks.filter((task) => task.day === day);
    const targetTasks = namedSubject
      ? dayTasks.filter((task) => task.subjectId === namedSubject)
      : dayTasks;
    targetTasks.forEach((task) => {
      const existingNotes = task.notes?.split(' | ').map((item) => item.trim()).filter(Boolean) || [];
      if (!existingNotes.includes(normalizedNote)) {
        task.notes = [...existingNotes, normalizedNote].join(' | ');
      }
    });
  };

  const attachNoteToAllPlanTasks = (note: string) => {
    const planSubjectTasks = tasks.filter((task) => task.subjectId === defaultSubjectId);
    const targetTasks = planSubjectTasks.length > 0 ? planSubjectTasks : tasks;
    targetTasks.forEach((task) => {
      const existingNotes = task.notes?.split(' | ').map((item) => item.trim()).filter(Boolean) || [];
      if (!existingNotes.includes(note)) {
        task.notes = [...existingNotes, note].join(' | ');
      }
    });
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    // A PDF row often ends with a multi-line Notes cell immediately before
    // the next day header. Attach that note to the previous day's Math task
    // before changing currentDay, otherwise it is lost or assigned late.
    if (pendingNoteLines.length > 0 && isDayHeader(trimmedLine)) {
      attachPendingNotes();
    }
    if (isNotesStart(trimmedLine)) {
      attachPendingNotes();
      const inline = trimmedLine.match(/^(?:notes?|ملاحظات(?:\s+أخرى)?|ملاحظات أخرى)\s*[:：-]\s*(.*)$/i)?.[1];
      const bringText = trimmedLine.match(/(?:please\s+bring|bring|يرجى\s+إحضار|إحضار|احضار)\b.*$/i)?.[0];
      pendingNoteLines = [inline?.trim() || bringText?.trim() || trimmedLine];
      return;
    }
    if (pendingNoteLines.length > 0 && (isNotesContinuation(trimmedLine) || !isDayHeader(trimmedLine))) {
      // PDF layout splits one Notes cell over several physical lines.
      // Keep collecting until the next day or a new recognizable row.
      if (isNotesContinuation(trimmedLine)) {
        pendingNoteLines.push(trimmedLine);
        return;
      }
      attachPendingNotes();
    }

    const cells = line.split('\t').map((cell) => cell.trim());
    const headerCellIndex = cells.findIndex((cell) =>
      /^(notes?|ملاحظات(?:\s+أخرى)?|ملاحظات أخرى)$/i.test(cell)
    );
    if (headerCellIndex >= 0) {
      notesColumnIndex = headerCellIndex;
    }
    const inlineNote = line.match(/(?:notes?|ملاحظات(?:\s+أخرى)?)\s*[:：-]\s*(.+)$/i)?.[1]?.trim();
    const rowNote = notesColumnIndex >= 0 ? cells[notesColumnIndex]?.trim() : inlineNote;
    const lower = line.toLowerCase();

    // Check for day change
    if (lower.includes('الأحد') || lower.includes('الاحد') || lower.includes('األحذ') || lower.includes('sunday')) currentDay = 'sunday';
    else if (lower.includes('الإثنين') || lower.includes('الاثنين') || lower.includes('االثنين') || lower.includes('monday')) currentDay = 'monday';
    else if (lower.includes('الثلاثاء') || lower.includes('الثالثاء') || lower.includes('tuesday')) currentDay = 'tuesday';
    else if (lower.includes('الأربعاء') || lower.includes('الاربعاء') || lower.includes('األربعاء') || lower.includes('wednesday')) currentDay = 'wednesday';
    else if (lower.includes('الخميس') || lower.includes('thursday')) currentDay = 'thursday';

    // Match Subject
    let matchedSubject = subjects.find((s) => s.id === defaultSubjectId) || subjects.find((s) => s.id === 'math');
    if (lower.includes('math') || lower.includes('رياضيات') || lower.includes('حساب')) {
      matchedSubject = subjects.find((s) => s.id === 'math');
    } else if (lower.includes('english') || lower.includes('انجليزي') || lower.includes('إنجليزي') || lower.includes('connect')) {
      matchedSubject = subjects.find((s) => s.id === 'english');
    } else if (lower.includes('science') || lower.includes('علوم') || lower.includes('discover')) {
      matchedSubject = subjects.find((s) => s.id === 'science');
    } else if (lower.includes('français') || lower.includes('francais') || lower.includes('french') || lower.includes('فرنساوي') || lower.includes('فرنسي')) {
      matchedSubject = subjects.find((s) => s.id === 'french');
    } else if (lower.includes('arabic') || lower.includes('عربي') || lower.includes('لغة عربية')) {
      matchedSubject = subjects.find((s) => s.id === 'arabic');
    } else if (lower.includes('social') || lower.includes('دراسات')) {
      matchedSubject = subjects.find((s) => s.id === 'social_studies');
    } else if (lower.includes('دين') || lower.includes('religion') || lower.includes('تربية دينية') || lower.includes('islamic')) {
      matchedSubject = subjects.find((s) => s.id === 'religion');
    } else if (lower.includes('ict') || lower.includes('computer') || lower.includes('حاسب') || lower.includes('تكنولوجيا')) {
      matchedSubject = subjects.find((s) => s.id === 'ict');
    } else if (lower.includes('art') || lower.includes('رسم') || lower.includes('فنية')) {
      matchedSubject = subjects.find((s) => s.id === 'arts');
    } else if (lower.includes('music') || lower.includes('موسيقى')) {
      matchedSubject = subjects.find((s) => s.id === 'music');
    } else if (lower.includes('pe') || lower.includes('رياضة') || lower.includes('بدنية')) {
      matchedSubject = subjects.find((s) => s.id === 'pe');
    }

    // Task Type
    let taskType: TaskType = 'homework';
    if (lower.includes('إملاء') || lower.includes('املاء') || lower.includes('spelling') || lower.includes('dictation')) {
      taskType = 'dictation';
    } else if (lower.includes('مذاكرة') || lower.includes('حفظ') || lower.includes('study') || lower.includes('قراءة')) {
      taskType = 'study';
    } else if (lower.includes('كويز') || lower.includes('امتحان') || lower.includes('quiz') || lower.includes('test')) {
      taskType = 'quiz';
    } else if (lower.includes('أدوات') || lower.includes('احضار') || lower.includes('supplies')) {
      taskType = 'supplies';
    } else if (lower.includes('classwork') || lower.includes('شرح') || lower.includes('داخل الفصل')) {
      taskType = 'classwork';
    }

    // Extract pages
    const pageMatch = line.match(/(?:p\.|page|صفحة|ص|pages)\s*([0-9\u0660-\u0669]+(?:\s*[-–toإلى]\s*[0-9\u0660-\u0669]+)?)/i);
    const pages = pageMatch ? pageMatch[0] : undefined;

    // Check for URLs
    const urls = extractAllUrls(line);

    // Clean Title
    let title = line;
    if (line.includes(':')) {
      const parts = line.split(':');
      title = parts.slice(1).join(':').trim();
    } else if (line.includes('-')) {
      const parts = line.split('-');
      if (parts.length > 1 && parts[0].length < 20) {
        title = parts.slice(1).join('-').trim();
      }
    }

    if (title.length > 2 && !title.startsWith('الخطة') && !title.startsWith('Weekly Plan')) {
      tasks.push({
        id: `raw-task-${Date.now()}-${index}`,
        day: currentDay,
        subjectId: matchedSubject?.id || 'math',
        section: targetSection,
        type: taskType,
        title,
        pages,
        linkUrl: urls[0] || undefined,
        details: urls.length > 0 ? `رابط مرفق: ${urls.join(', ')}` : undefined,
        notes: rowNote || undefined,
        isDone: false,
        createdAt: Date.now(),
      });
    }
  });

  // PDF text extraction may place the Notes column before/after the topic
  // column, so recover the complete note from every day's text block.
  const normalizedPlanText = rawText.replace(/\s+/g, ' ');
  const dayPatterns: Array<[DayOfWeek, RegExp]> = [
    ['sunday', /(?:sunday|الأحد|الاحد|األحذ)([\s\S]*?)(?=monday|tuesday|wednesday|thursday|الإثنين|الاثنين|االثنين|الثلاثاء|الثالثاء|األربعاء|الأربعاء|الخميس|$)/i],
    ['monday', /(?:monday|الإثنين|الاثنين|االثنين)([\s\S]*?)(?=tuesday|wednesday|thursday|الثلاثاء|الثالثاء|األربعاء|الأربعاء|الخميس|$)/i],
    ['tuesday', /(?:tuesday|الثلاثاء|الثالثاء)([\s\S]*?)(?=wednesday|thursday|األربعاء|الأربعاء|الخميس|$)/i],
    ['wednesday', /(?:wednesday|األربعاء|الأربعاء)([\s\S]*?)(?=thursday|الخميس|$)/i],
    ['thursday', /(?:thursday|الخميس)([\s\S]*?)$/i],
  ];
  dayPatterns.forEach(([day, pattern]) => {
    const dayBlock = normalizedPlanText.match(pattern)?.[1] || '';
    const note = dayBlock.match(/(?:please\s+bring|bring)\b.*?(?:100\s+chart|chart|board|marker)/i)?.[0]?.trim()
      || dayBlock.match(/(?:يرجى\s+إحضار|إحضار|احضار)\b.*?(?:الرسم|التلوين|ألوان|الوان)/i)?.[0]?.trim();
    if (!note) return;
    attachNoteToDayTasks(day, note);
  });

  // Some Excel/PDF exports contain one shared Notes cell outside the daily
  // rows. In that case it must not appear only in the currently selected day
  // or only in Tomorrow's Prep; propagate the shared note to every day.
  const sharedNotes = lines
    .map((line) => line.match(/^(?:notes?|ملاحظات(?:\s+أخرى)?|ملاحظات أخرى)\s*[:：-]\s*(.+)$/i)?.[1]?.trim())
    .filter((note): note is string => Boolean(note && note.length > 3));
  sharedNotes.forEach((note) => attachNoteToAllPlanTasks(note));

  attachPendingNotes();
  return processTasksAndExtractLinkTasks(tasks, subjects);
}
