export type SchoolClass = '2A' | '2B' | '2C';

export type UserRole = 'visitor' | 'student' | 'admin';

export interface SubjectInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  textColor: string;
  borderColor: string;
  iconName: string;
}

export interface PeriodSlot {
  id: string;
  periodNum: number;
  time: string;
  subjectId: string;
  teacher?: string;
  room?: string;
}

export interface DaySchedule {
  dayNameAr: 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
  dayNameEn: string;
  periods: PeriodSlot[];
}

export interface ClassTimetable {
  classId: SchoolClass;
  days: DaySchedule[];
  // File attachments for timetable sheet/document (PDF, Image, Word)
  fileName?: string;
  fileType?: 'pdf' | 'image' | 'word' | 'doc';
  fileSize?: string;
  fileDataUrl?: string;
  uploadedAt?: string;
}

/**
 * A compact homework item shape used by integrations and lightweight views.
 * The richer HomeworkRecord below remains the persisted daily-follow-up model.
 */
export interface HomeworkItem {
  id: string;
  day: string;
  subject: string;
  assignment: string;
  dueDate?: string;
}

export interface WeeklyPlanItem {
  id: string;
  blockId: string; // 'block1' | 'block2' | 'block3' | 'block4'
  weekId: string;  // 'week1' | 'week2' | 'week3' | ...
  classId: SchoolClass | 'all';
  subjectId: string;
  unitOrTheme: string;
  learningObjectives: string[];
  vocabulary?: string[];
  resourcesNote?: string;
  assessmentNote?: string;
  homeworkNote?: string;
  classworkNote?: string;
  tomorrowNote?: string;
  extractedText?: string;
  extractionVersion?: number;
  dayContent?: Record<string, { classworkNote?: string; homeworkNote?: string; tomorrowNote?: string }>;
  dictationFileName?: string;
  dictationFileType?: 'pdf' | 'word' | 'image';
  dictationFileSize?: string;
  dictationFileDataUrl?: string;
  // File attachments for PDF or Word or image
  fileName?: string;
  fileType?: 'pdf' | 'word' | 'doc' | 'image';
  fileSize?: string;
  fileDataUrl?: string;

  // Compact weekly-plan fields used by imports and external integrations.
  // Existing fields above remain the canonical persisted representation.
  weekNumber?: number;
  day?: string;
  subject?: string;
  classwork?: string;
  homework?: string;
  pdfUrl?: string;
  links?: string[];
}

export interface ClassworkRecord {
  id: string;
  subjectId: string;
  lessonTitle: string;
  details: string;
  pages?: string;
}

export interface HomeworkRecord {
  id: string;
  subjectId: string;
  assignment: string;
  dueDate?: string;
  pages?: string;
  instructions?: string;
}

export interface TomorrowPreparationItem {
  id: string;
  subjectId?: string;
  item: string;
  category: 'books' | 'tools' | 'clothes' | 'general';
  isImportant?: boolean;
}

export interface DailyFollowUp {
  id: string;
  date: string; // YYYY-MM-DD
  classId: SchoolClass;
  blockId: string;
  weekId: string;
  dayNameAr: string;
  classwork: ClassworkRecord[];
  homework: HomeworkRecord[];
  tomorrowPreparations: TomorrowPreparationItem[];
}

export interface StudentPersonalTask {
  id: string;
  studentName: string;
  classId: SchoolClass;
  title: string;
  subjectId?: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  notes?: string;
}

export interface StudentProfile {
  name: string;
  classId: SchoolClass;
}

export interface SchoolMaterialFile {
  id: string;
  title: string;
  subjectId: string;
  classId: SchoolClass | 'all';
  blockId?: string;
  weekId?: string;
  materialKind?: 'main' | 'week' | 'dictation';
  fileType: 'pdf' | 'doc' | 'image' | 'sheet';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy?: string;
  description?: string;
  fileDataUrl?: string;
  previewSummary?: string;
}
