import {
  SubjectInfo,
  ClassTimetable,
  WeeklyPlanItem,
  DailyFollowUp,
  StudentPersonalTask,
  SchoolMaterialFile
} from '../types';

export const SUBJECTS: SubjectInfo[] = [
  {
    id: 'english',
    nameAr: 'اللغة الإنجليزية',
    nameEn: 'English',
    color: 'bg-blue-50 text-blue-800',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    iconName: 'BookOpen'
  },
  {
    id: 'arabic',
    nameAr: 'اللغة العربية',
    nameEn: 'Arabic',
    color: 'bg-emerald-50 text-emerald-800',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    iconName: 'Feather'
  },
  {
    id: 'math',
    nameAr: 'الرياضيات',
    nameEn: 'Math',
    color: 'bg-indigo-50 text-indigo-800',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    iconName: 'Calculator'
  },
  {
    id: 'science',
    nameAr: 'العلوم',
    nameEn: 'Science',
    color: 'bg-teal-50 text-teal-800',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    iconName: 'FlaskConical'
  },
  {
    id: 'social',
    nameAr: 'الدراسات الاجتماعية',
    nameEn: 'Social Studies',
    color: 'bg-amber-50 text-amber-900',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    iconName: 'Compass'
  },
  {
    id: 'french',
    nameAr: 'اللغة الفرنسية',
    nameEn: 'French',
    color: 'bg-rose-50 text-rose-800',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    iconName: 'Languages'
  },
  {
    id: 'ict',
    nameAr: 'تكنولوجيا المعلومات',
    nameEn: 'ICT',
    color: 'bg-cyan-50 text-cyan-800',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    iconName: 'Laptop'
  },
  {
    id: 'art',
    nameAr: 'التربية الفنية',
    nameEn: 'Art',
    color: 'bg-purple-50 text-purple-800',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    iconName: 'Palette'
  },
  {
    id: 'music',
    nameAr: 'الموسيقى',
    nameEn: 'Music',
    color: 'bg-pink-50 text-pink-800',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
    iconName: 'Music2'
  },
  {
    id: 'pe',
    nameAr: 'التربية البدنية',
    nameEn: 'PE',
    color: 'bg-orange-50 text-orange-800',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    iconName: 'Activity'
  },
  {
    id: 'ethics',
    nameAr: 'التربية الدينية والقيم',
    nameEn: 'Religion & Ethics',
    color: 'bg-lime-50 text-lime-900',
    textColor: 'text-lime-800',
    borderColor: 'border-lime-200',
    iconName: 'Heart'
  }
  ,{
    id: 'dictation',
    nameAr: 'Dictation',
    nameEn: 'Dictation',
    color: 'bg-rose-50 text-rose-800',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    iconName: 'FileText'
  }
];

export const BLOCKS = [
  { id: 'block1', nameAr: 'Block 1', weeksCount: 4, current: true },
  { id: 'block2', nameAr: 'Block 2', weeksCount: 4, current: false },
  { id: 'block3', nameAr: 'Block 3', weeksCount: 4, current: false },
  { id: 'block4', nameAr: 'Block 4', weeksCount: 4, current: false },
];

export const WEEKS = [
  { id: 'week1', nameAr: 'Week 1', isCurrent: false },
  { id: 'week2', nameAr: 'Week 2', isCurrent: true },
  { id: 'week3', nameAr: 'Week 3', isCurrent: false },
  { id: 'week4', nameAr: 'Week 4', isCurrent: false },
];

export const PERIOD_TIMES = [
  { periodNum: 1, time: '07:45 - 08:35' },
  { periodNum: 2, time: '08:35 - 09:25' },
  { periodNum: 3, time: '09:45 - 10:35' },
  { periodNum: 4, time: '10:35 - 11:25' },
  { periodNum: 5, time: '11:25 - 12:15' },
  { periodNum: 6, time: '12:15 - 13:05' },
  { periodNum: 7, time: '13:25 - 14:15' },
  { periodNum: 8, time: '14:15 - 15:05' },
];

export const INITIAL_TIMETABLES: ClassTimetable[] = [
  {
    classId: '2A',
    days: [
      {
        dayNameAr: 'الأحد',
        dayNameEn: 'Sunday',
        periods: [
          { id: 'p-2a-sun-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'pe' },
          { id: 'p-2a-sun-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'social' },
          { id: 'p-2a-sun-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'ict' },
          { id: 'p-2a-sun-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'art' },
          { id: 'p-2a-sun-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'english' },
          { id: 'p-2a-sun-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'english' },
          { id: 'p-2a-sun-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'arabic' },
          { id: 'p-2a-sun-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'math' }

        ]
      },
      {
        dayNameAr: 'الإثنين',
        dayNameEn: 'Monday',
        periods: [
          { id: 'p-2a-mon-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'music' },
          { id: 'p-2a-mon-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'math' },
          { id: 'p-2a-mon-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'pe' },
          { id: 'p-2a-mon-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'science' },
          { id: 'p-2a-mon-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'arabic' },
          { id: 'p-2a-mon-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'arabic' },
          { id: 'p-2a-mon-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'ict' },
          { id: 'p-2a-mon-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'english' }

        ]
      },
      {
        dayNameAr: 'الثلاثاء',
        dayNameEn: 'Tuesday',
        periods: [
          { id: 'p-2a-tue-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'english' },
          { id: 'p-2a-tue-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'english' },
          { id: 'p-2a-tue-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'math' },
          { id: 'p-2a-tue-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'math' },
          { id: 'p-2a-tue-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'ethics' },
          { id: 'p-2a-tue-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'french' },
          { id: 'p-2a-tue-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'art' },
          { id: 'p-2a-tue-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'arabic' }

        ]
      },
      {
        dayNameAr: 'الأربعاء',
        dayNameEn: 'Wednesday',
        periods: [
          { id: 'p-2a-wed-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'math' },
          { id: 'p-2a-wed-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'science' },
          { id: 'p-2a-wed-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'ict' },
          { id: 'p-2a-wed-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'social' },
          { id: 'p-2a-wed-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'french' },
          { id: 'p-2a-wed-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'arabic' },
          { id: 'p-2a-wed-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'english' },
          { id: 'p-2a-wed-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'english' }

        ]
      },
      {
        dayNameAr: 'الخميس',
        dayNameEn: 'Thursday',
        periods: [
          { id: 'p-2a-thu-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'english' },
          { id: 'p-2a-thu-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'music' },
          { id: 'p-2a-thu-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'ethics' },
          { id: 'p-2a-thu-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'arabic' },
          { id: 'p-2a-thu-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'french' },
          { id: 'p-2a-thu-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'math' },
          { id: 'p-2a-thu-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'social' },
          { id: 'p-2a-thu-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'science' }

        ]
      }

    ]
  },
  {
    classId: '2B',
    days: [
      {
        dayNameAr: 'الأحد',
        dayNameEn: 'Sunday',
        periods: [
          { id: 'p-2b-sun-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'french' },
          { id: 'p-2b-sun-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'math' },
          { id: 'p-2b-sun-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'arabic' },
          { id: 'p-2b-sun-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'science' },
          { id: 'p-2b-sun-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'english' },
          { id: 'p-2b-sun-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'english' },
          { id: 'p-2b-sun-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'ict' },
          { id: 'p-2b-sun-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'music' }
        ]
      },
      {
        dayNameAr: 'الإثنين',
        dayNameEn: 'Monday',
        periods: [
          { id: 'p-2b-mon-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'social' },
          { id: 'p-2b-mon-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'pe' },
          { id: 'p-2b-mon-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'english' },
          { id: 'p-2b-mon-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'english' },
          { id: 'p-2b-mon-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'math' },
          { id: 'p-2b-mon-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'math' },
          { id: 'p-2b-mon-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'arabic' },
          { id: 'p-2b-mon-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'arabic' }
        ]
      },
      {
        dayNameAr: 'الثلاثاء',
        dayNameEn: 'Tuesday',
        periods: [
          { id: 'p-2b-tue-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'math' },
          { id: 'p-2b-tue-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'ict' },
          { id: 'p-2b-tue-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'art' },
          { id: 'p-2b-tue-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'french' },
          { id: 'p-2b-tue-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'ethics' },
          { id: 'p-2b-tue-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'english' },
          { id: 'p-2b-tue-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'music' },
          { id: 'p-2b-tue-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'arabic' }
        ]
      },
      {
        dayNameAr: 'الأربعاء',
        dayNameEn: 'Wednesday',
        periods: [
          { id: 'p-2b-wed-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'english' },
          { id: 'p-2b-wed-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'social' },
          { id: 'p-2b-wed-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'pe' },
          { id: 'p-2b-wed-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'arabic' },
          { id: 'p-2b-wed-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'math' },
          { id: 'p-2b-wed-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'french' },
          { id: 'p-2b-wed-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'science' },
          { id: 'p-2b-wed-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'art' }
        ]
      },
      {
        dayNameAr: 'الخميس',
        dayNameEn: 'Thursday',
        periods: [
          { id: 'p-2b-thu-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'arabic' },
          { id: 'p-2b-thu-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'social' },
          { id: 'p-2b-thu-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'ethics' },
          { id: 'p-2b-thu-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'math' },
          { id: 'p-2b-thu-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'english' },
          { id: 'p-2b-thu-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'english' },
          { id: 'p-2b-thu-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'science' },
          { id: 'p-2b-thu-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'ict' }
        ]
      }
    ]
  },
  {
    classId: '2C',
    days: [
      {
        dayNameAr: 'الأحد',
        dayNameEn: 'Sunday',
        periods: [
          { id: 'p-2c-sun-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'math' },
          { id: 'p-2c-sun-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'math' },
          { id: 'p-2c-sun-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'french' },
          { id: 'p-2c-sun-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'english' },
          { id: 'p-2c-sun-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'ict' },
          { id: 'p-2c-sun-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'arabic' },
          { id: 'p-2c-sun-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'social' },
          { id: 'p-2c-sun-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'pe' }

        ]
      },
      {
        dayNameAr: 'الإثنين',
        dayNameEn: 'Monday',
        periods: [
          { id: 'p-2c-mon-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'arabic' },
          { id: 'p-2c-mon-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'arabic' },
          { id: 'p-2c-mon-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'social' },
          { id: 'p-2c-mon-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'english' },
          { id: 'p-2c-mon-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'science' },
          { id: 'p-2c-mon-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'art' },
          { id: 'p-2c-mon-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'french' },
          { id: 'p-2c-mon-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'math' }

        ]
      },
      {
        dayNameAr: 'الثلاثاء',
        dayNameEn: 'Tuesday',
        periods: [
          { id: 'p-2c-tue-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'pe' },
          { id: 'p-2c-tue-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'arabic' },
          { id: 'p-2c-tue-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'science' },
          { id: 'p-2c-tue-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'math' },
          { id: 'p-2c-tue-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'ethics' },
          { id: 'p-2c-tue-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'ict' },
          { id: 'p-2c-tue-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'english' },
          { id: 'p-2c-tue-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'english' }

        ]
      },
      {
        dayNameAr: 'الأربعاء',
        dayNameEn: 'Wednesday',
        periods: [
          { id: 'p-2c-wed-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'english' },
          { id: 'p-2c-wed-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'english' },
          { id: 'p-2c-wed-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'french' },
          { id: 'p-2c-wed-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'social' },
          { id: 'p-2c-wed-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'music' },
          { id: 'p-2c-wed-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'arabic' },
          { id: 'p-2c-wed-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'math' },
          { id: 'p-2c-wed-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'music' }

        ]
      },
      {
        dayNameAr: 'الخميس',
        dayNameEn: 'Thursday',
        periods: [
          { id: 'p-2c-thu-1', periodNum: 1, time: '07:45 - 08:35', subjectId: 'ict' },
          { id: 'p-2c-thu-2', periodNum: 2, time: '08:35 - 09:25', subjectId: 'science' },
          { id: 'p-2c-thu-3', periodNum: 3, time: '09:45 - 10:35', subjectId: 'ethics' },
          { id: 'p-2c-thu-4', periodNum: 4, time: '10:35 - 11:25', subjectId: 'english' },
          { id: 'p-2c-thu-5', periodNum: 5, time: '11:25 - 12:15', subjectId: 'english' },
          { id: 'p-2c-thu-6', periodNum: 6, time: '12:15 - 13:05', subjectId: 'math' },
          { id: 'p-2c-thu-7', periodNum: 7, time: '13:25 - 14:15', subjectId: 'arabic' },
          { id: 'p-2c-thu-8', periodNum: 8, time: '14:15 - 15:05', subjectId: 'art' }

        ]
      }

    ]
  }
];

export const INITIAL_WEEKLY_PLANS: WeeklyPlanItem[] = [
  // Uploaded source plans: Block 1 - Week 1 (6/9/2026 - 10/9/2026)
  {
    id: 'wp-b1-w1-english-uploaded',
    blockId: 'block1', weekId: 'week1', classId: 'all', subjectId: 'english',
    weekNumber: 1, day: 'Sunday', subject: 'English',
    unitOrTheme: 'Welcome, Orientation and Previously Taught Review',
    learningObjectives: ['Welcome and orient students', 'Complete diagnostic assessment', 'Review previously taught content'],
    resourcesNote: 'English Weekly Plan PDF - Minya - Block 1 Week 1',
    classwork: 'Welcome Day and Orientation; Diagnostic Test; Previously Taught Review.',
    homework: 'No homework on most days. Monday: From page 1 to page 3 for Class 2B. Thursday: pages 56 and 58 for Class 2B.',
    homeworkNote: 'No homework on most days. Monday: From page 1 to page 3 for Class 2B. Thursday: pages 56 and 58 for Class 2B.',
    tomorrowNote: 'Any changes may happen due to changes in schedules.',
    fileName: 'Weekly Plan English - B1 - W1 - Minia.pdf', fileType: 'pdf', fileSize: 'Uploaded source plan',
    dayContent: {
      Sunday: { classworkNote: 'Welcome Day and Orientation for classes 2A, 2B and 2C.', homeworkNote: 'No homework.', tomorrowNote: 'Any changes may happen due to changes in schedules.' },
      Monday: { classworkNote: 'Diagnostic Test for 2A and 2C; Previously Taught Review and Orientation for 2B.', homeworkNote: 'From page 1 to page 3 for Class 2B.', tomorrowNote: 'Any changes may happen due to changes in schedules.' },
      Tuesday: { classworkNote: 'Previously Taught Review: 2A pages 1-5, 2B pages 4-5, 2C pages 1-3.', homeworkNote: 'No homework.', tomorrowNote: 'Any changes may happen due to changes in schedules.' },
      Wednesday: { classworkNote: 'Previously Taught Review: pages 6-10 for classes 2A, 2B and 2C.', homeworkNote: 'No homework recorded.', tomorrowNote: 'Any changes may happen due to changes in schedules.' },
      Thursday: { classworkNote: 'Previously Taught Review: pages 10-12 for classes 2A, 2B and 2C.', homeworkNote: 'Pages 56 and 58 for Class 2B.', tomorrowNote: 'Any changes may happen due to changes in schedules.' }
    }
  },
  {
    id: 'wp-b1-w1-math-uploaded',
    blockId: 'block1', weekId: 'week1', classId: 'all', subjectId: 'math',
    weekNumber: 1, day: 'Sunday', subject: 'Math',
    unitOrTheme: 'Unit 1: Number and Place Value',
    learningObjectives: ['Count numbers up to 100', 'Understand place value', 'Compare and order numbers', 'Use 1 more and 1 less in estimation'],
    resourcesNote: 'Maths-Grade2-B1-All-Sheet1 - Main',
    classwork: 'Welcome Day; Counting numbers up to 100; Place value and partition/recombine; Comparing and ordering numbers; 1 more / 1 less estimation.',
    homework: 'Tuesday: Page 81. Thursday: Page 80 to 84, Question 1 only.',
    homeworkNote: 'Tuesday: Page 81. Thursday: Page 80 to 84, Question 1 only.',
    tomorrowNote: 'Please bring a small whiteboard, marker and 100 chart.',
    fileName: 'Weekly Plan Maths - B1 - W1 - Minia.pdf', fileType: 'pdf', fileSize: 'Uploaded source plan',
    dayContent: {
      Sunday: { classworkNote: 'Welcome Day.', homeworkNote: 'No homework recorded.', tomorrowNote: 'Please bring a small whiteboard, marker and 100 chart.' },
      Monday: { classworkNote: 'Unit 1: Counting numbers up to 100.', homeworkNote: 'No homework recorded.', tomorrowNote: 'Please bring a small whiteboard, marker and 100 chart.' },
      Tuesday: { classworkNote: 'Unit 1: Place value and partition and recombine.', homeworkNote: 'Page 81.', tomorrowNote: 'Please bring a small whiteboard, marker and 100 chart.' },
      Wednesday: { classworkNote: 'Unit 1: Comparing and ordering numbers.', homeworkNote: 'No homework recorded.', tomorrowNote: 'Please bring a small whiteboard, marker and 100 chart.' },
      Thursday: { classworkNote: 'Unit 1: 1 more / 1 less estimation.', homeworkNote: 'Page 80 to 84, Question 1 only.', tomorrowNote: 'Please bring a small whiteboard, marker and 100 chart.' }
    }
  },
  {
    id: 'wp-b1-w1-science-uploaded',
    blockId: 'block1', weekId: 'week1', classId: 'all', subjectId: 'science',
    weekNumber: 1, day: 'Sunday', subject: 'Science',
    unitOrTheme: 'Unit 1: Sound Sources',
    learningObjectives: ['Learn lab safety', 'Understand that sound is a vibration'],
    resourcesNote: 'Science Weekly Plan PDF - Minya - Block 1 Week 1',
    classwork: 'Lab Safety; Sound is a vibration.',
    homework: 'Tuesday: Page 14 for Class 2C. Wednesday: Page 14 for classes 2A-2B and page 16.',
    homeworkNote: 'Tuesday: Page 14 for Class 2C. Wednesday: Page 14 for classes 2A-2B and page 16.',
    fileName: 'Weekly Plan Science - B1 - W1 - Minia.pdf', fileType: 'pdf', fileSize: 'Uploaded source plan',
    dayContent: {
      Sunday: { classworkNote: 'Unit 1: Sound Sources - Lab Safety for Class 2B.', homeworkNote: 'No homework recorded.' },
      Monday: { classworkNote: 'Unit 1: Sound Sources - Lab Safety for classes 2A, 2B and 2C.', homeworkNote: 'No homework recorded.' },
      Tuesday: { classworkNote: 'Unit 1: Sound Sources - Sound is a vibration for Class 2C.', homeworkNote: 'Page 14 for Class 2C.' },
      Wednesday: { classworkNote: 'Unit 1: Sound Sources - Sound is a vibration for classes 2A and 2B.', homeworkNote: 'Page 14 for classes 2A-2B and page 16.' },
      Thursday: { classworkNote: 'Unit 1: Sound Sources - Sound is a vibration for classes 2A, 2B and 2C.', homeworkNote: 'No homework recorded.' }
    }
  },
  {
    id: 'wp-b1-w1-arabic-uploaded',
    blockId: 'block1', weekId: 'week1', classId: 'all', subjectId: 'arabic',
    weekNumber: 1, day: 'Sunday', subject: 'Arabic',
    unitOrTheme: 'الوحدة الأولى: العودة إلى المدرسة',
    learningObjectives: ['التعرف على قواعد الصف', 'مراجعة الحروف والتحليل الصوتي', 'التمييز بين التاء المربوطة والتاء المفتوحة والهاء', 'التدريب على الإملاء'],
    resourcesNote: 'فيديو، كراسة نشاط الوحدة الأولى، كراسة الطالب',
    classwork: 'حصة تعريفية ووضع قواعد الصف؛ مراجعة الحروف؛ مراجعة التحليل الصوتي للكلمات؛ التاء المربوطة والتاء المفتوحة والهاء؛ إملاء.',
    homework: 'الثلاثاء: كراسة الواجب المنزلي صفحة 45. باقي الأيام: لا يوجد واجب مسجل.',
    homeworkNote: 'الثلاثاء: كراسة الواجب المنزلي صفحة 45. باقي الأيام: لا يوجد واجب مسجل.',
    tomorrowNote: 'ملاحظات ومصادر: فيديو وكراسة نشاط. موضوع الأسبوع: العودة إلى المدرسة.',
    fileName: 'Weekly Plan Arabic - B1 - W1 - Minia.pdf', fileType: 'pdf', fileSize: 'Uploaded source plan',
    dayContent: {
      Sunday: { classworkNote: 'حصة تعريفية وترحيبية + وضع قواعد الصف. الوحدة الأولى: العودة إلى المدرسة.', homeworkNote: 'لا يوجد.', tomorrowNote: 'فيديو وأنشطة ترحيبية.' },
      Monday: { classworkNote: 'مراجعة الحروف. الوحدة الأولى: العودة إلى المدرسة.', homeworkNote: 'لا يوجد.', tomorrowNote: 'كراسة نشاط الوحدة الأولى ص 2-3.' },
      Tuesday: { classworkNote: 'مراجعة التحليل الصوتي للكلمات.', homeworkNote: 'كراسة الواجب المنزلي صفحة 45.', tomorrowNote: 'فيديو وكراسة نشاط الوحدة الأولى ص 4.' },
      Wednesday: { classworkNote: 'التاء المربوطة والتاء المفتوحة والهاء. الوحدة الأولى ص 5-6.', homeworkNote: 'لا يوجد.', tomorrowNote: 'فيديو وكراسة نشاط.' },
      Thursday: { classworkNote: 'إملاء. الوحدة الأولى: العودة إلى المدرسة.', homeworkNote: 'لا يوجد.', tomorrowNote: 'كراسة الطالب.' }
    }
  },
  {
    id: 'wp-b1-w1-social-uploaded',
    blockId: 'block1', weekId: 'week1', classId: 'all', subjectId: 'social',
    weekNumber: 1, day: 'Sunday', subject: 'Social Studies',
    unitOrTheme: 'الوحدة الأولى: مجتمع الصف الدراسي الثاني',
    learningObjectives: ['الترحيب بالطلاب', 'استخدام استراتيجيات التعلم النشط', 'وضع قواعد العمل مع الطلاب', 'التعريف بمنهج الصف الثاني', 'التعرف على عنوان الدرس الأول العودة إلى المدرسة'],
    resourcesNote: 'الخطة الأسبوعية للدراسات الاجتماعية - بلوك 1 - أسبوع 1',
    classwork: 'ترحيب بالطلاب واستخدام استراتيجيات التعلم النشط ووضع قواعد العمل مع الطلاب والتعريف بمنهج الصف الثاني؛ الاختبار القبلي؛ عنوان الدرس الأول: العودة إلى المدرسة.',
    homework: 'صفحة 7 يومي Wednesday وThursday.',
    homeworkNote: 'صفحة 7 يومي Wednesday وThursday.',
    tomorrowNote: 'يرجى إحضار ألوان خشبية للتلوين والرسم يومي Wednesday وThursday.',
    fileName: 'Weekly Plan Social Studies - B1 - W1 - Minia.pdf', fileType: 'pdf', fileSize: 'Uploaded source plan',
    dayContent: {
      Sunday: { classworkNote: 'ترحيب بالطلاب واستخدام استراتيجيات التعلم النشط ووضع قواعد العمل والتعريف بمنهج الصف الثاني.', homeworkNote: 'لا يوجد.', tomorrowNote: '' },
      Monday: { classworkNote: 'ترحيب بالطلاب واستخدام استراتيجيات التعلم النشط ووضع قواعد العمل والتعريف بمنهج الصف الثاني.', homeworkNote: 'لا يوجد.', tomorrowNote: '' },
      Tuesday: { classworkNote: 'الاختبار القبلي.', homeworkNote: 'لا يوجد.', tomorrowNote: '' },
      Wednesday: { classworkNote: 'الاختبار القبلي للصف 2A و2B؛ عنوان الدرس الأول العودة إلى المدرسة للصف 2C.', homeworkNote: 'صفحة 7 للصف 2C.', tomorrowNote: 'يرجى إحضار ألوان خشبية للتلوين والرسم.' },
      Thursday: { classworkNote: 'عنوان الدرس الأول العودة إلى المدرسة للصفوف 2A و2B؛ الاختبار القبلي للصف 2C.', homeworkNote: 'صفحة 7 للصفوف 2A و2B.', tomorrowNote: 'يرجى إحضار ألوان خشبية للتلوين والرسم.' }
    }
  },
  {
    id: 'wp-b1-w1-ict-uploaded',
    blockId: 'block1', weekId: 'week1', classId: 'all', subjectId: 'ict',
    weekNumber: 1, day: 'Week 1', subject: 'ICT',
    unitOrTheme: 'Unit 1: Working with Text - Introducing the Keyboard',
    learningObjectives: ['Identify keyboard parts', 'Explain QWERTY and home-row keys', 'Differentiate Arabic and English keyboard layouts', 'Discuss keyboard health and safety'],
    resourcesNote: 'ICT Grade 2 B1 All Sheet 1 - Main; video links in the uploaded plan',
    classwork: 'Session 1: Introducing the keyboard, identify keyboard parts, describe special keys, and practice enter, space bar, shift, control, backspace and caps lock/delete. Session 2: Explain QWERTY and use home-row keys to type fast. Session 3: Differentiate Arabic and English keyboard layouts, switch layouts, and discuss health and safety.',
    homework: 'Week 1 pages 10 and 12. Page 14.',
    homeworkNote: 'Week 1 pages 10 and 12. Page 14.',
    tomorrowNote: 'Video resources: keyboard and home-row links included in the uploaded ICT plan.',
    links: [
      'https://www.youtube.com/watch?v=6unZgmlAavQ',
      'https://youtu.be/Jbgv_XPoPnk?si=CGtLbxGDK1v82cB2',
      'https://youtu.be/6unZgmlAavQ?si=Dx3Oo2cXlXrqQVXS'
    ],
    fileName: 'Weekly Plan ICT - B1 - W1 - Minia.pdf', fileType: 'pdf', fileSize: 'Uploaded source plan',
    dayContent: {
      'Session 1': { classworkNote: 'Introducing the keyboard; identify keyboard parts and describe special keys including enter, space bar, shift, control, backspace and caps lock/delete.', homeworkNote: 'Week 1 pages 10 and 12.', tomorrowNote: 'Video resources included in the plan.' },
      'Session 2': { classworkNote: 'Explain the meaning of QWERTY keyboard and use the keyboard home row keys to type fast.', homeworkNote: 'Page 14.', tomorrowNote: 'Video resources included in the plan.' },
      'Session 3': { classworkNote: 'Differentiate between Arabic and English keyboard layouts, switch between layouts, and discuss health and safety aspects when using a keyboard.', homeworkNote: 'No additional homework recorded.', tomorrowNote: 'Video resources included in the plan.' }
    }
  },
  // Block 1 - Week 2
  {
    id: 'wp-b1-w2-eng',
    blockId: 'block1',
    weekId: 'week2',
    classId: 'all',
    subjectId: 'english',
    unitOrTheme: 'Unit 2: My Wonderful Community & Helpers',
    learningObjectives: [
      'Identify community helpers (firefighter, doctor, police officer, teacher)',
      'Use simple present tense to describe daily routines and jobs',
      'Phonics focus: Long "a" sound (ai, ay patterns like rain, day)',
      'Read and comprehend the story "A Day in Our Town"'
    ],
    vocabulary: ['Community', 'Helper', 'Firefighter', 'Clinic', 'Neighborhood', 'Safe'],
    resourcesNote: 'Student Book pp. 24-31 + Activity Workbook pp. 18-22',
    assessmentNote: 'Spelling dictation on Thursday & short reading comprehension check.',
    homeworkNote: 'Complete the Phonics worksheet: circle the words with (ai) and (ay). Workbook p. 20.'
  },
  {
    id: 'wp-b1-w2-arab',
    blockId: 'block1',
    weekId: 'week2',
    classId: 'all',
    subjectId: 'arabic',
    unitOrTheme: 'المحور الأول: من أكون؟ - درس "أنا أستطيع"',
    learningObjectives: [
      'قراءة قصة "أنا أستطيع" قراءة جهرية صحيحة معبرة',
      'اكتشاف معاني المفردات الجديدة من السياق (واثق، ماهر، استطاع)',
      'التمييز بين التاء المربوطة والتاء المفتوحة والهاء في أواخر الكلمات',
      'التدريب على التعبير الشفهي عن الثقة بالنفس والمحاولة دون يأس'
    ],
    vocabulary: ['واثق', 'يستطيع', 'ماهر', 'فوز', 'استعداد'],
    resourcesNote: 'كتاب اللغة العربية من صفحة 22 إلى 29 + كشكول الحصة',
    assessmentNote: 'إملاء الكلمات التي تنتهي بتاء مربوطة ومفتوحة يوم الأربعاء.',
    homeworkNote: 'Copy the first paragraph of the lesson in the homework notebook.'
  },
  {
    id: 'wp-b1-w2-math',
    blockId: 'block1',
    weekId: 'week2',
    classId: 'all',
    subjectId: 'math',
    unitOrTheme: 'Chapter 2: Two-Digit Addition with Regrouping & Place Value',
    learningObjectives: [
      'Understand regrouping (carrying over) from ones to tens column',
      'Solve two-digit word problems related to real-life shopping scenarios',
      'Use base-ten blocks (flats and rods) to model addition visually',
      'Mental math warm-up: Adding doubles (e.g. 15 + 15, 20 + 20)'
    ],
    vocabulary: ['Regrouping', 'Place Value', 'Tens', 'Ones', 'Sum', 'Addition'],
    resourcesNote: 'Cambridge Primary Math Learner Book 2, pp. 34-42',
    assessmentNote: 'Weekly Math Quiz on Thursday covering 2-digit regrouping.',
    homeworkNote: 'Solve exercises 1–6 on page 38 in the activity notebook.'
  },
  {
    id: 'wp-b1-w2-sci',
    blockId: 'block1',
    weekId: 'week2',
    classId: 'all',
    subjectId: 'science',
    unitOrTheme: 'Unit 1: Living Things and Habitats - Desert & River Nile Life',
    learningObjectives: [
      'Recognize how plants and animals adapt to survive along the River Nile and Minya environments',
      'Investigate plant parts (roots, stem, leaves, flower) and their functions',
      'Conduct hands-on experiment: Observing water movement through celery stalk'
    ],
    vocabulary: ['Habitat', 'Adaptation', 'Absorb', 'Roots', 'Nile River', 'Nutrients'],
    resourcesNote: 'Science Lab Manual + Nile Schools Cambridge Science Activity Book 2',
    assessmentNote: 'Lab journal check during class on Wednesday.'
  },
  {
    id: 'wp-b1-w2-soc',
    blockId: 'block1',
    weekId: 'week2',
    classId: 'all',
    subjectId: 'social',
    unitOrTheme: 'الوحدة الأولى: محافظتي عروس الصعيد (المنيا)',
    learningObjectives: [
      'التعرف على معالم محافظة المنيا وموقعها على نهر النيل',
      'التمييز بين البيئة الريفية والبيئة الحضرية في المحافظة',
      'رسم خريطة مبسطة لمعالم المنيا وتحديد نهر النيل'
    ],
    vocabulary: ['محافظة المنيا', 'نهر النيل', 'عروس الصعيد', 'معالم', 'خريطة'],
    resourcesNote: 'كتاب الدراسات الاجتماعية + كشكول الأنشطة صفحة 15-18',
    assessmentNote: 'نشاط تلوين خريطة المنيا ومشاركتها في الفصل.',
    homeworkNote: 'Color the Minya map and bring it to class.'
  },
  {
    id: 'wp-b1-w2-fre',
    blockId: 'block1',
    weekId: 'week2',
    classId: 'all',
    subjectId: 'french',
    unitOrTheme: 'Unité 1 : Les salutations et ma trousse d\'école',
    learningObjectives: [
      'Saluer et se présenter en français (Bonjour, Je m\'appelle...)',
      'Nommer les fournitures scolaires (le stylo, le crayon, la règle, la gomme)',
      'Utiliser les articles définis (le, la, les)'
    ],
    vocabulary: ['Bonjour', 'Le stylo', 'Le crayon', 'La gomme', 'La règle'],
    resourcesNote: 'Livre de français "Alex et Zoé 2" pp. 12-15',
    assessmentNote: 'Évaluation orale de prononciation jeudi.',
    homeworkNote: 'Memorize the pencil-case words: le stylo, le crayon, la gomme.'
  },
  {
    id: 'wp-b1-w2-ict',
    blockId: 'block1',
    weekId: 'week2',
    classId: 'all',
    subjectId: 'ict',
    unitOrTheme: 'Unit 1: Computer Hardware & Healthy Digital Habits',
    learningObjectives: [
      'Distinguish between input devices (keyboard, mouse) and output devices (screen, printer)',
      'Practice safe typing posture and mouse grip in computer lab',
      'Use Paint program to draw geometric shapes and color them'
    ],
    vocabulary: ['Hardware', 'Keyboard', 'Mouse', 'Monitor', 'Printer', 'Click'],
    resourcesNote: 'Computer Lab 1 - Practical Hands-on',
    assessmentNote: 'Practical mini-exercise in Paint program.'
  }
];

export const INITIAL_DAILY_FOLLOW_UPS: DailyFollowUp[] = [
  {
    id: 'dfu-2a-today',
    date: '2026-09-09',
    classId: '2A',
    blockId: 'block1',
    weekId: 'week2',
    dayNameAr: 'الأربعاء',
    classwork: [
      {
        id: 'cw-1',
        subjectId: 'math',
        lessonTitle: 'الجمع بإعادة التسمية (Addition with Regrouping)',
        details: 'تم شرح مفهوم تجميع العشرات عندما يزيد ناتج الآحاد عن 9، وحل التدريبات على السبورة وفي كراسة التدريبات.',
        pages: 'كتاب التلميذ ص 36 و 37'
      },
      {
        id: 'cw-2',
        subjectId: 'english',
        lessonTitle: 'Phonics: Long "a" sound & Story Reading',
        details: 'Explained long "a" (ai & ay spellings like train, day). Read the first two pages of "A Day in Our Town" with student roleplay.',
        pages: 'Student Book pp. 26-27'
      },
      {
        id: 'cw-3',
        subjectId: 'arabic',
        lessonTitle: 'قصة أنا أستطيع - قراءة وتحليل المفردات',
        details: 'قراءة النص ومناقشة فكرة عدم الاستسلام، واستخراج الكلمات التي بها مد بالألف والتاء المربوطة.',
        pages: 'كتاب الوزارة ص 24 - 25'
      },
      {
        id: 'cw-4',
        subjectId: 'science',
        lessonTitle: 'أجزاء النبات ووظائف الجذور والساق',
        details: 'تم فحص نبات حقيقي داخل الفصل وملاحظة الجذور والساق والأوراق، وشرح كيف يمتص النبات الماء.',
        pages: 'Science Workbook p. 19'
      },
      {
        id: 'cw-5',
        subjectId: 'ict',
        lessonTitle: 'التعامل مع الفأرة ووحدات الإدخال',
        details: 'تدريب عملي في معمل الحاسب على الضغط المزدوج وسحب وإفلات العناصر داخل برنامج الرسام.',
        pages: 'التدريب العملي بمعمل الحاسب'
      }
    ],
    homework: [
      {
        id: 'hw-1',
        subjectId: 'math',
        assignment: 'حل المسائل من 1 إلى 6 في كراسة الأنشطة ص 38.',
        dueDate: 'غداً الخميس',
        pages: 'ص 38 تدريب 1 إلى 6',
        instructions: 'يرجى كتابة خطوات إعادة التسمية في مربع العشرات بوضوح.'
      },
      {
        id: 'hw-2',
        subjectId: 'english',
        assignment: 'Complete the Phonics worksheet: circle the words with (ai) and (ay).',
        dueDate: 'Thursday morning',
        pages: 'Workbook p. 20',
        instructions: 'Write 2 simple sentences using the words: "rain" and "play".'
      },
      {
        id: 'hw-3',
        subjectId: 'arabic',
        assignment: 'نسخ الفقرة الأولى من درس "أنا أستطيع" في كشكول الواجب بخط النسخ الجميل.',
        dueDate: 'غداً الخميس',
        pages: 'كشكول الواجب',
        instructions: 'مراعاة وضع التشكيل والالتزام بالسطر.'
      },
      {
        id: 'hw-4',
        subjectId: 'french',
        assignment: 'حفظ كلمات أدوات المقلمة (le stylo, le crayon, la gomme) ونطقها.',
        dueDate: 'الأسبوع القادم',
        pages: 'Livre p. 13'
      }
    ],
    tomorrowPreparations: [
      {
        id: 'prep-1',
        subjectId: 'math',
        item: 'إحضار كتاب الماث (Learner Book) وكشكول المربعات ومسطرة 20 سم.',
        category: 'books',
        isImportant: true
      },
      {
        id: 'prep-2',
        subjectId: 'pe',
        item: 'ارتداء الزي الرياضي المدرسي الرسمي الخاص بمدارس النيل وكوتشي رياضي مناسب لحصة التربية البدنية (PE).',
        category: 'clothes',
        isImportant: true
      },
      {
        id: 'prep-3',
        subjectId: 'art',
        item: 'إحضار كراسة الرسم وألوان خشب ومقص أطفال غير حاد لحصة التربية الفنية.',
        category: 'tools',
        isImportant: false
      },
      {
        id: 'prep-4',
        subjectId: 'science',
        item: 'إحضار كشكول الساينس ومراجعة أسئلة ص 19 استعداداً لمناقشة تجربة امتصاص الماء.',
        category: 'books',
        isImportant: false
      }
    ]
  },
  {
    id: 'dfu-2b-today',
    date: '2026-09-09',
    classId: '2B',
    blockId: 'block1',
    weekId: 'week2',
    dayNameAr: 'الأربعاء',
    classwork: [
      {
        id: 'cw-2b-1',
        subjectId: 'math',
        lessonTitle: 'Two-Digit Addition Regrouping Practice',
        details: 'Solving problems on board and practice in workbooks with partner check.',
        pages: 'Workbook pp. 35-36'
      },
      {
        id: 'cw-2b-2',
        subjectId: 'english',
        lessonTitle: 'Reading & Vocabulary - Helpers in town',
        details: 'Matched community helpers with their vehicles and tools. Practiced dialogs.',
        pages: 'Student Book pp. 25-26'
      },
      {
        id: 'cw-2b-3',
        subjectId: 'arabic',
        lessonTitle: 'التاء المفتوحة والتاء المربوطة',
        details: 'شرح الفرق الصوتي عند الوقف وعند الوصل مع تدريبات تطبيقية.',
        pages: 'كتاب المدرسة ص 26'
      }
    ],
    homework: [
      {
        id: 'hw-2b-1',
        subjectId: 'math',
        assignment: 'Solve page 37 in Math Activity Book (Questions 1 to 5).',
        dueDate: 'غداً الخميس'
      },
      {
        id: 'hw-2b-2',
        subjectId: 'arabic',
        assignment: 'كتابة 3 كلمات بها تاء مربوطة و3 كلمات بها تاء مفتوحة في كشكول الحصة.',
        dueDate: 'غداً الخميس'
      }
    ],
    tomorrowPreparations: [
      {
        id: 'prep-2b-1',
        subjectId: 'pe',
        item: 'الالتزام بارتداء الزي الرياضي المدرسي لحصة التربية البدنية.',
        category: 'clothes',
        isImportant: true
      },
      {
        id: 'prep-2b-2',
        subjectId: 'science',
        item: 'إحضار كشكول الساينس وقلم رصاص وممحاة لمتابعة تجربة النبات.',
        category: 'books',
        isImportant: false
      }
    ]
  },
  {
    id: 'dfu-2c-today',
    date: '2026-09-09',
    classId: '2C',
    blockId: 'block1',
    weekId: 'week2',
    dayNameAr: 'الأربعاء',
    classwork: [
      {
        id: 'cw-2c-1',
        subjectId: 'arabic',
        lessonTitle: 'قراءة وتحليل قصة أنا أستطيع',
        details: 'مناقشة أهداف الدرس والكلمات الجديدة وكتابة شبكة المفردات.',
        pages: 'كتاب الوزارة ص 23-24'
      },
      {
        id: 'cw-2c-2',
        subjectId: 'math',
        lessonTitle: 'Place value & addition',
        details: 'Mental math warm up followed by double-digit regrouping exercises.',
        pages: 'Student book p. 36'
      }
    ],
    homework: [
      {
        id: 'hw-2c-1',
        subjectId: 'arabic',
        assignment: 'نسخ سطرين من القصة وقراءة ص 24 قراءة جيدة مع ولي الأمر.',
        dueDate: 'غداً الخميس'
      },
      {
        id: 'hw-2c-2',
        subjectId: 'english',
        assignment: 'Workbook page 21 sentences 1-4.',
        dueDate: 'غداً الخميس'
      }
    ],
    tomorrowPreparations: [
      {
        id: 'prep-2c-1',
        subjectId: 'pe',
        item: 'الزي الرياضي الكامل لحصة التربية البدنية.',
        category: 'clothes',
        isImportant: true
      },
      {
        id: 'prep-2c-2',
        subjectId: 'french',
        item: 'إحضار كتاب وكشكول اللغة الفرنسية.',
        category: 'books',
        isImportant: false
      }
    ]
  }
];

export const INITIAL_STUDENT_TASKS: StudentPersonalTask[] = [
  {
    id: 'task-1',
    studentName: 'عمر أحمد',
    classId: '2A',
    title: 'مراجعة جدول ضرب 2 و 3 لمسابقة الحساب الذهني',
    subjectId: 'math',
    completed: true,
    dueDate: '2026-09-10',
    createdAt: '2026-09-08'
  },
  {
    id: 'task-2',
    studentName: 'عمر أحمد',
    classId: '2A',
    title: 'تجهيز صور لرجال الإطفاء والأطباء لمشروع الإنجليزي',
    subjectId: 'english',
    completed: false,
    dueDate: '2026-09-11',
    createdAt: '2026-09-09'
  },
  {
    id: 'task-3',
    studentName: 'عمر أحمد',
    classId: '2A',
    title: 'تحضير قراءة قصة أنا أستطيع لنيل نجمة القراءة في طابور الصباح',
    subjectId: 'arabic',
    completed: false,
    dueDate: '2026-09-10',
    createdAt: '2026-09-09'
  }
];

export const INITIAL_MATERIALS: SchoolMaterialFile[] = [
  // ===================== BLOCK 1 SHEETS =====================
  {
    id: 'mat-b1-arab',
    title: 'شيت اللغة العربية',
    subjectId: 'arabic',
    classId: 'all',
    blockId: 'block1',
    fileType: 'pdf',
    fileName: 'Arabic_Sheet_Grade2_Block1.pdf',
    fileSize: '1.8 MB',
    uploadDate: '2026-09-08',
    uploadedBy: 'إدارة المدرسة',
    description: 'شيت مادة اللغة العربية لبلوك 1',
    previewSummary: `مدارس النيل المصرية الدولية - فرع المنيا
قسم اللغة العربية - الصف الثاني الابتدائي (Grade 2)
شيت تدريبات وتطبيقات: بلوك 1 (Block 1 Sheet)

المحور الأول: من أكون؟ | الدرس: قصة "أنا أستطيع"
اسم الطالب: ....................................... الفصل: 2 ( ... )

أولاً: اقرأ الفقرة ثم أجب:
"في فناء المدرسة وقف المعلم ليختار من التلاميذ فريقاً لكرة القدم. اختار المعلم التلميذ آدم. لكن آدم قال: أعتذر يا معلمي، لا أحب أن أكون سبباً في الخسارة."
1. استخرج من الفقرة:
   - كلمة بها مد بالألف: (................)
   - كلمة بها لام قمرية: (................)
   - كلمة بها تنوين بالكسر: (................)
2. لماذا اعتذر آدم للمعلم؟
   ................................................................................................

ثانياً: ميز بين التاء المربوطة (ـة / ة) والتاء المفتوحة (ت) والهاء (ـه / ه):
ضع كل كلمة في مكانها المناسب بالجدول:
(مدرسة - صوت - مياه - بيت - زهرة - وجه - حديقة - زيت)

ثالثاً: رتب الكلمات لتكون جملة مفيدة:
(ماهر - في - آدم - السلة - كرة - لاعب)
--> ................................................................................................

ختم واعتماد قسم اللغة العربية - فرع المنيا`
  },
  {
    id: 'mat-b1-math',
    title: 'Math Worksheet',
    subjectId: 'math',
    classId: 'all',
    blockId: 'block1',
    fileType: 'pdf',
    fileName: 'Math_Sheet_Grade2_Block1.pdf',
    fileSize: '2.4 MB',
    uploadDate: '2026-09-08',
    uploadedBy: 'إدارة المدرسة',
    description: 'شيت مادة الرياضيات لبلوك 1',
    previewSummary: `Nile Egyptian Schools - Minya Branch
Department of Mathematics - Grade 2 (Classes 2A, 2B, 2C)
Official Worksheet: Block 1 Practice Sheet

Student Name: __________________________ Class: 2 [    ]
Topic: 2-Digit Addition with Regrouping (Tens & Ones)

★ Section 1: Calculate the following with regrouping:
  1)   37 + 25 = [ ____ ]    (Think: 7 + 5 = 12 -> 2 in ones, 1 to tens!)
  2)   48 + 36 = [ ____ ]
  3)   59 + 17 = [ ____ ]
  4)   64 + 28 = [ ____ ]
  5)   73 + 19 = [ ____ ]

★ Section 2: Place Value Models
Color the base-ten flats (10s) blue and cubes (1s) green to represent 54 + 28.

★ Section 3: Word Problems (Critical Thinking)
Farida collected 38 Nile lotus flowers. Her brother Youssef gave her 27 more flowers.
How many flowers does Farida have altogether?
Number sentence: ______________________________________
Final Answer: [ ________ ] lotus flowers.

School Administration Signature - Nile Egyptian Schools Minya`
  },
  {
    id: 'mat-b1-eng',
    title: 'English Worksheet',
    subjectId: 'english',
    classId: 'all',
    blockId: 'block1',
    fileType: 'pdf',
    fileName: 'English_Sheet_Grade2_Block1.pdf',
    fileSize: '2.1 MB',
    uploadDate: '2026-09-08',
    uploadedBy: 'إدارة المدرسة',
    description: 'شيت مادة اللغة الإنجليزية لبلوك 1',
    previewSummary: `Nile Egyptian Schools - Minya Branch
Department of English - Grade 2 (2A, 2B, 2C)
Block 1 Worksheet: Phonics & Reading Comprehension

Student Name: _________________________ Date: ________________

★ Part 1: Phonics Detective (The Long 'a' sound)
Words with [ai] or [ay] make the long 'a' sound!
Circle only the words with the long 'a' sound:
[  train  •  cat  •  rain  •  play  •  man  •  day  •  wait  •  hat  ]

★ Part 2: Community Helpers & Tools
Fill in the blanks with: [ Firefighter / Doctor / Teacher / Policeman ]
1. The ____________ helps us stay safe and directs traffic.
2. The ____________ uses a stethoscope to listen to our heartbeat.
3. The ____________ puts out fires using a big water hose.
4. The ____________ teaches us to read, write, and explore in school.

★ Part 3: Short Story Comprehension
"Samy went to the Minya Riverbank with his family. He saw birds flying over the Nile and waved at the friendly ferry boat captain."
Question: Where did Samy go?
Answer: ____________________________________________________

Grade 2 English Dept - NES Minya Approved`
  },
  {
    id: 'mat-b1-sci',
    title: 'Science Worksheet',
    subjectId: 'science',
    classId: 'all',
    blockId: 'block1',
    fileType: 'pdf',
    fileName: 'Science_Sheet_Grade2_Block1.pdf',
    fileSize: '2.8 MB',
    uploadDate: '2026-09-07',
    uploadedBy: 'إدارة المدرسة',
    description: 'شيت مادة العلوم والساينس لبلوك 1',
    previewSummary: `Nile Egyptian Schools - Minya Branch
Cambridge Primary Science - Grade 2
Block 1 Worksheet: Plant Structures & Habitats

Student Name: __________________________ Class: 2 [    ]

★ Part 1: Plant Anatomy
Label the diagram with the following words:
[  Roots  •  Stem  •  Leaves  •  Flower  ]
1. Which part anchors the plant in the soil? [ ________________ ]
2. Which part absorbs sunlight to make plant food? [ ________________ ]
3. Which part transports water up to the leaves? [ ________________ ]

★ Part 2: The Celery Water Lab Observation
We placed a celery stalk in water colored with red food dye:
- After 2 hours: Red dots appeared inside the celery stem.
- After 24 hours: The leaves turned light red!
Conclusion: The stem contains tiny tubes (xylem) that carry water upwards against gravity.

Science Department - Nile Egyptian Schools Minya`
  },
  {
    id: 'mat-b1-soc',
    title: 'شيت الدراسات الاجتماعية',
    subjectId: 'social',
    classId: 'all',
    blockId: 'block1',
    fileType: 'pdf',
    fileName: 'Social_Studies_Sheet_Grade2_Block1.pdf',
    fileSize: '1.6 MB',
    uploadDate: '2026-09-07',
    uploadedBy: 'إدارة المدرسة',
    description: 'شيت مادة الدراسات الاجتماعية لبلوك 1',
    previewSummary: `مدارس النيل المصرية الدولية - فرع المنيا
مادة الدراسات الاجتماعية - الصف الثاني الابتدائي
شيت تدريبات بلوك 1: محافظتي عروس الصعيد

اسم الطالب: ....................................... الفصل: 2 ( ... )

السؤال الأول: ضع علامة (✓) أو (✗):
1. تقع محافظة المنيا على ضفاف نهر النيل في صعيد مصر. (   )
2. البيئة في المنيا تشمل أراضي زراعية خصبة ومناطق أثرية هامة. (   )
3. يمر نهر النيل بجوار مدرستنا في محافظة المنيا. (   )

السؤال الثاني: اكتب تحت كل صورة المعلم المناسب:
(كورنيش النيل بالمنيا - كوبري المنيا العلوي - تل العمارنة)

السؤال الثالث: نشاط تلوين:
لون مجرى نهر النيل باللون الأزرق، والأراضي الزراعية باللون الأخضر، وحدد موقع مدينتك الجميلة المنيا.`
  },
  {
    id: 'mat-b1-ict',
    title: 'ICT Worksheet',
    subjectId: 'ict',
    classId: 'all',
    blockId: 'block1',
    fileType: 'pdf',
    fileName: 'ICT_Sheet_Grade2_Block1.pdf',
    fileSize: '1.3 MB',
    uploadDate: '2026-09-06',
    uploadedBy: 'إدارة المدرسة',
    description: 'شيت مادة تكنولوجيا المعلومات والكمبيوتر لبلوك 1',
    previewSummary: `Nile Egyptian Schools - Minya Branch
Department of Information & Communication Technology (ICT)
Block 1 Worksheet: Computer Hardware Basics

Student Name: __________________________ Class: 2 [    ]

★ Exercise 1: Input vs. Output Devices
Classify each item as [ INPUT ] or [ OUTPUT ]:
1. Keyboard: [ ________________ ]
2. Computer Screen (Monitor): [ ________________ ]
3. Mouse: [ ________________ ]
4. Color Printer: [ ________________ ]

★ Exercise 2: Healthy Screen Habits
Draw a smiley face next to the good habits:
(  ) Sitting with a straight back and screen at eye level.
(  ) Taking a 5-minute break every 20 minutes.
(  ) Touching computer cables with wet hands.

NES Minya ICT Lab Approved`
  },
  {
    id: 'mat-b1-fre',
    title: 'Fiche de Français',
    subjectId: 'french',
    classId: 'all',
    blockId: 'block1',
    fileType: 'pdf',
    fileName: 'French_Sheet_Grade2_Block1.pdf',
    fileSize: '1.1 MB',
    uploadDate: '2026-09-06',
    uploadedBy: 'إدارة المدرسة',
    description: 'شيت مادة اللغة الفرنسية لبلوك 1',
    previewSummary: `Écoles Égyptiennes du Nil - Branche de Minya
Département de Français - Grade 2 (2A, 2B, 2C)
Fiche d'activités : Bloc 1

Nom de l'élève : _______________________ Classe : 2 [    ]

★ Activité 1 : Relie les salutations avec la bonne image :
1. Bonjour !               --> [ Le soleil du matin ]
2. Bonsoir !               --> [ La lune et les étoiles ]
3. Au revoir !             --> [ La main qui salue ]

★ Activité 2 : Ma trousse scolaire (Écris le mot correspondant) :
[  un stylo  •  un crayon  •  une règle  •  une gomme  ]
1. Pour effacer : ______________________
2. Pour tracer une ligne droite : ______________________
3. Pour écrire avec de l'encre bleue : ______________________

Département de français - NES Minya`
  }
];
