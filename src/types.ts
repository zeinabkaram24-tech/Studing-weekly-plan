export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export type TaskType = 'homework' | 'classwork' | 'study' | 'dictation' | 'quiz' | 'supplies' | 'general';

export interface Subject {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  color: {
    bg: string;
    text: string;
    border: string;
    accent: string;
    lightBg: string;
  };
  iconName: string;
}

export interface PlanTask {
  id: string;
  day: DayOfWeek;
  subjectId: string;
  section?: GradeSection;
  period?: number;
  type: TaskType;
  title: string;
  details?: string;
  pages?: string;
  isDone: boolean;
  notes?: string;
  isCarriedOver?: boolean;
  previousWeekNote?: string;
  createdAt: number;
  completedAt?: number;
}

export interface TimetableSlot {
  period: number;
  timeRange: string;
  subjectId: string;
  room?: string;
}

export type Timetable = Record<DayOfWeek, TimetableSlot[]>;

export type GradeSection = '2A' | '2B' | '2C';

export interface GradeSectionOption {
  id: GradeSection;
  nameAr: string;
  nameEn: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  lightBg: string;
}

export interface StudentProfile {
  name: string;
  grade: string;
  section: GradeSection;
  schoolName: string;
  branch: string;
}

export interface DayInfo {
  key: DayOfWeek;
  nameAr: string;
  nameEn: string;
  shortAr: string;
  shortEn: string;
  isSchoolDay: boolean;
}

export interface UploadedPlanFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: number;
  subjectId?: string;
  weekName?: string;
  previewUrl?: string;
  extractedTaskCount?: number;
}

export interface VisitorItem {
  id: string;
  email: string;
  name?: string;
  studentGrade?: string;
  firstSeenAt: number;
  lastSeenAt: number;
  visitCount: number;
  device?: string;
}

export interface VisitorStatsSummary {
  totalUniqueEmails: number;
  totalVisits: number;
  todayVisits: number;
  lastUpdated: number;
}

