import { VisitorItem, VisitorStatsSummary } from '../types';

const STORAGE_EMAIL_KEY = 'g2b_visitor_email';
const STORAGE_NAME_KEY = 'g2b_visitor_name';
const STORAGE_ADMIN_PIN_KEY = 'g2b_admin_pin';

export function getStoredVisitorEmail(): string | null {
  try {
    return localStorage.getItem(STORAGE_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function getStoredVisitorName(): string | null {
  try {
    return localStorage.getItem(STORAGE_NAME_KEY);
  } catch {
    return null;
  }
}

export function setStoredVisitorInfo(email: string, name?: string): void {
  try {
    localStorage.setItem(STORAGE_EMAIL_KEY, email.trim().toLowerCase());
    if (name) {
      localStorage.setItem(STORAGE_NAME_KEY, name.trim());
    }
  } catch (e) {
    console.error('Could not save visitor info to local storage', e);
  }
}

export function getStoredAdminPin(): string | null {
  try {
    return localStorage.getItem(STORAGE_ADMIN_PIN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminPin(pin: string): void {
  try {
    localStorage.setItem(STORAGE_ADMIN_PIN_KEY, pin);
  } catch (e) {
    console.error('Could not save admin pin', e);
  }
}

// 1. Fetch live public stats
export async function fetchVisitorStats(): Promise<VisitorStatsSummary | null> {
  try {
    const res = await fetch('/api/visitors/stats');
    if (!res.ok) throw new Error(`Stats HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch visitor stats:', error);
    return null;
  }
}

// 2. Register visitor student by name
export async function registerStudentLogin(
  studentName: string,
  studentGrade = 'Grade 2'
): Promise<{ success: boolean; visitor?: VisitorItem; error?: string }> {
  try {
    const res = await fetch('/api/visitors/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: studentName.trim(),
        name: studentName.trim(),
        studentGrade,
        userAgent: navigator.userAgent,
        device: `${navigator.platform || 'Unknown'} - ${navigator.language || 'ar'}`,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'فشل تسجيل الطالب' };
    }

    const data = await res.json();
    if (data.success && data.visitor) {
      setStoredVisitorInfo(data.visitor.email, data.visitor.name);
    }
    return data;
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: 'تعذر الاتصال بالخادم' };
  }
}

// 2b. Register visitor email (legacy fallback)
export async function registerVisitorEmail(
  email: string,
  name?: string,
  studentGrade = 'Grade 2B'
): Promise<{ success: boolean; visitor?: VisitorItem; error?: string }> {
  try {
    const res = await fetch('/api/visitors/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        name: name?.trim(),
        studentGrade,
        userAgent: navigator.userAgent,
        device: `${navigator.platform || 'Unknown'} - ${navigator.language || 'ar'}`,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'فشل تسجيل البيانات' };
    }

    const data = await res.json();
    if (data.success && data.visitor) {
      setStoredVisitorInfo(data.visitor.email, data.visitor.name);
    }
    return data;
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: 'تعذر الاتصال بالخادم' };
  }
}

// 3. Ping visitor / student session
export async function pingVisitorSession(identifier: string): Promise<void> {
  try {
    const isEmail = identifier.includes('@');
    await fetch('/api/visitors/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEmail ? { email: identifier } : { studentName: identifier }),
    });
  } catch {
    // Ignore silent background ping errors
  }
}

// 4. Fetch full visitors list for Admin
export async function fetchAllVisitorsAdmin(
  pin?: string,
  userEmail?: string
): Promise<{
  authorized: boolean;
  totalUniqueEmails: number;
  totalVisits: number;
  visitors: VisitorItem[];
  error?: string;
}> {
  try {
    const res = await fetch('/api/visitors/all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: pin || getStoredAdminPin() || '',
        userEmail: userEmail || getStoredVisitorEmail() || '',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        authorized: false,
        totalUniqueEmails: 0,
        totalVisits: 0,
        visitors: [],
        error: err.error || 'غير مصرح لك بعرض هذه القائمة',
      };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch all visitors failed:', error);
    return {
      authorized: false,
      totalUniqueEmails: 0,
      totalVisits: 0,
      visitors: [],
      error: 'تعذر الاتصال بالخادم',
    };
  }
}

// 5. Delete visitor record (Admin)
export async function deleteVisitorRecord(
  id: string,
  pin?: string,
  userEmail?: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/visitors/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: pin || getStoredAdminPin() || '',
        userEmail: userEmail || getStoredVisitorEmail() || '',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
