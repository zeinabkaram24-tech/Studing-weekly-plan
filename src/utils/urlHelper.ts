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
    return 'اضغط هنا لمشاهدة الفيديو والشرح 🎥';
  }
  if (isAudioUrl(url)) {
    return 'اضغط هنا لسماع التسجيل الصوتي 🎧';
  }
  if (isDocumentUrl(url)) {
    return 'اضغط هنا لفتح الملف / الشيت المرفق 📄';
  }

  const lower = url.toLowerCase();
  if (lower.includes('kahoot') || lower.includes('quizlet') || lower.includes('wordwall') || lower.includes('padlet')) {
    return 'اضغط هنا لفتح النشاط التفاعلي واللعبة 🎮';
  }

  return 'اضغط هنا لمشاهدة/سماع الرابط 🔗';
}
