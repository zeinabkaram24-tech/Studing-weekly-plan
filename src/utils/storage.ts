import {
  DEFAULT_STUDENT,
  DEFAULT_SUBJECTS,
  DEFAULT_TASKS,
  DEFAULT_TIMETABLE,
  GRADE_TASKS,
  GRADE_TIMETABLES,
} from '../data/defaultData';
import { DayOfWeek, GradeSection, PlanTask, StudentProfile, Subject, Timetable } from '../types';

const STORAGE_KEYS = {
  TASKS: 'g2_school_tasks_v2',
  TIMETABLE: 'g2_school_timetable_v2',
  STUDENT: 'g2_school_student_v2',
  SUBJECTS: 'g2_school_subjects_v2',
  WEEK_TITLE: 'g2_school_week_title_v2',
  FILES: 'g2_school_uploaded_files_v2',
  SECTION: 'g2_school_grade_section_v2',
};

export function loadSavedGradeSection(): GradeSection | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SECTION);
    if (saved === '2A' || saved === '2B' || saved === '2C') {
      return saved;
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveGradeSection(section: GradeSection): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SECTION, section);
  } catch (e) {
    console.error('Failed to save grade section', e);
  }
}

export function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay();
  const dayMap: Record<number, DayOfWeek> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  return dayMap[dayIndex] || 'sunday';
}

export function filterOutArtTasks(tasks: PlanTask[]): PlanTask[] {
  return tasks.filter(
    (t) =>
      t.subjectId !== 'arts' &&
      t.subjectId !== 'pe' &&
      !t.title?.toLowerCase().includes('arts') &&
      !t.title?.toLowerCase().includes('pe') &&
      !t.title?.toLowerCase().includes('physical education') &&
      !t.title?.includes('التربية الفنية') &&
      !t.title?.includes('التربية الرياضية') &&
      !t.title?.includes('الرسم') &&
      !t.title?.includes('اللياقة البدنية') &&
      !t.title?.includes('الزي الرياضي')
  );
}

export function loadSavedTasks(section: GradeSection = '2A'): PlanTask[] {
  try {
    const key = `${STORAGE_KEYS.TASKS}_${section}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed: PlanTask[] = JSON.parse(saved);
      return filterOutArtTasks(parsed);
    }
  } catch (e) {
    console.error('Failed to load tasks', e);
  }
  const defaults = GRADE_TASKS[section] || DEFAULT_TASKS;
  return filterOutArtTasks(defaults);
}

export function saveTasks(tasks: PlanTask[], section: GradeSection = '2A'): void {
  try {
    const filtered = filterOutArtTasks(tasks);
    const key = `${STORAGE_KEYS.TASKS}_${section}`;
    localStorage.setItem(key, JSON.stringify(filtered));
    // Also save as global fallback
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadSavedTimetable(section: GradeSection = '2A'): Timetable {
  try {
    const key = `${STORAGE_KEYS.TIMETABLE}_${section}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load timetable', e);
  }
  return GRADE_TIMETABLES[section] || DEFAULT_TIMETABLE;
}

export function saveTimetable(timetable: Timetable, section: GradeSection = '2A'): void {
  try {
    const key = `${STORAGE_KEYS.TIMETABLE}_${section}`;
    localStorage.setItem(key, JSON.stringify(timetable));
  } catch (e) {
    console.error('Failed to save timetable', e);
  }
}

export function loadSavedSubjects(): Subject[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load subjects', e);
  }
  return DEFAULT_SUBJECTS;
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function isStudentRemembered(): boolean {
  try {
    const remembered = localStorage.getItem('g2_student_remembered');
    return remembered === 'true';
  } catch {
    return false;
  }
}

export function isUserLoggedIn(): boolean {
  try {
    const isRemembered = localStorage.getItem('g2_student_remembered') === 'true';
    const name = localStorage.getItem('g2_saved_student_name');
    return Boolean(isRemembered && name && name.trim() && name !== 'طالب Grade 2' && name !== 'زائر');
  } catch {
    return false;
  }
}

export function getSavedStudentName(): string | null {
  try {
    return localStorage.getItem('g2_saved_student_name');
  } catch {
    return null;
  }
}

export function saveStudentLogin(name: string, section: GradeSection, remember: boolean = true): void {
  try {
    const trimmedName = name.trim();
    if (remember) {
      localStorage.setItem('g2_student_remembered', 'true');
      localStorage.setItem('g2_saved_student_name', trimmedName);
    } else {
      localStorage.removeItem('g2_student_remembered');
      localStorage.removeItem('g2_saved_student_name');
    }

    // Save section
    saveGradeSection(section);

    // Save student profile
    const existing = loadSavedStudent();
    saveStudent({
      ...existing,
      name: trimmedName,
      section: section,
      grade: `Grade ${section}`,
    });
  } catch (e) {
    console.error('Failed to save student login', e);
  }
}

export function clearStudentLogin(): void {
  try {
    localStorage.removeItem('g2_student_remembered');
    localStorage.removeItem('g2_saved_student_name');
    localStorage.removeItem(STORAGE_KEYS.STUDENT);
  } catch (e) {
    console.error('Failed to clear student login', e);
  }
}

export function loadSavedStudent(): StudentProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENT);
    const savedName = getSavedStudentName();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (savedName && savedName.trim()) {
        parsed.name = savedName.trim();
      }
      return parsed;
    }
    if (savedName && savedName.trim()) {
      return {
        ...DEFAULT_STUDENT,
        name: savedName.trim(),
      };
    }
  } catch (e) {
    console.error('Failed to load student', e);
  }
  return DEFAULT_STUDENT;
}

export function saveStudent(student: StudentProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENT, JSON.stringify(student));
  } catch (e) {
    console.error('Failed to save student', e);
  }
}

export function loadWeekTitle(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.WEEK_TITLE) || 'خطة الأسبوع الأول (Block 1 - Week 1)';
  } catch {
    return 'خطة الأسبوع الأول (Block 1 - Week 1)';
  }
}

export function saveWeekTitle(title: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEK_TITLE, title);
  } catch (e) {
    console.error('Failed to save week title', e);
  }
}

export function loadSavedUploadedFiles(): import('../types').UploadedPlanFile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FILES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load uploaded files', e);
  }
  return [];
}

export function saveUploadedFiles(files: import('../types').UploadedPlanFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save uploaded files', e);
  }
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.TIMETABLE);
  localStorage.removeItem(`${STORAGE_KEYS.TIMETABLE}_2A`);
  localStorage.removeItem(`${STORAGE_KEYS.TIMETABLE}_2B`);
  localStorage.removeItem(`${STORAGE_KEYS.TIMETABLE}_2C`);
  localStorage.removeItem(STORAGE_KEYS.STUDENT);
  localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
  localStorage.removeItem(STORAGE_KEYS.WEEK_TITLE);
  localStorage.removeItem(STORAGE_KEYS.FILES);
  localStorage.removeItem(STORAGE_KEYS.SECTION);
}
