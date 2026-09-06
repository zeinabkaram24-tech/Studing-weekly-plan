import React, { useState } from 'react';
import { DAYS_LIST } from '../data/defaultData';
import { DayOfWeek, GradeSection, PlanTask, Subject, Timetable } from '../types';
import { SubjectIcon } from './SubjectIcon';
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface TomorrowPrepCardProps {
  currentDay: DayOfWeek;
  tasks: PlanTask[];
  subjects: Subject[];
  timetable: Timetable;
  section?: GradeSection;
  onSelectDay: (day: DayOfWeek) => void;
}

// Subject-specific book, notebook, and kit requirements
const SUBJECT_REQUIREMENTS: Record<string, { booksAr: string; booksEn: string; kitAr?: string }> = {
  math: {
    booksAr: 'كتاب الرياضيات (Maths Book) + كشكول الرياضيات',
    booksEn: 'Math Student Book & Notebook',
    kitAr: 'السبورة البيضاء الصغيرة والماركر ومخطط الـ 100',
  },
  english: {
    booksAr: 'كتاب Connect Plus (Student Book & Activity Book) + كشكول الإنجليزي',
    booksEn: 'Connect Plus Student & Activity Book + Notebook',
  },
  arabic: {
    booksAr: 'كتاب اللغة العربية + كشكول الحصة والإملاء',
    booksEn: 'Arabic Book & Class Notebook',
  },
  science: {
    booksAr: 'كتاب العلوم (Science Book) + كشكول الملاحظات والتجارب',
    booksEn: 'Science Student Book & Notebook',
    kitAr: 'متابعة أدوات التجارب المعملية المطلوبة',
  },
  french: {
    booksAr: 'مذكرة وكشكول اللغة الفرنسية (Fiche de classe)',
    booksEn: 'French Class Sheet & Notebook',
  },
  social_studies: {
    booksAr: 'كتاب الدراسات الاجتماعية + كتاب الأنشطة',
    booksEn: 'Social Studies Book & Activities',
  },
  religion: {
    booksAr: 'كتاب التربية الدينية',
    booksEn: 'Religion Book',
  },
  ict: {
    booksAr: 'كشكول مادة الحاسب الآلي (ICT)',
    booksEn: 'ICT Notebook',
    kitAr: 'الالتزام بقواعد السلامة داخل معمل الحاسب الآلي',
  },
  pe: {
    booksAr: 'الترنج والزي الرياضي المدرسي الكامل + الحذاء الرياضي',
    booksEn: 'PE Sportswear Kit & Running Shoes',
    kitAr: 'زجاجة مياه إضافية لممارسة التمارين الرياضية',
  },
  arts: {
    booksAr: 'كراسة الرسم الفنية الكبيرة',
    booksEn: 'Drawing Sketchbook',
    kitAr: 'علبة ألوان خشب / فلوماستر ومسطرة الأشكال',
  },
  music: {
    booksAr: 'كشكول التربية الموسيقية',
    booksEn: 'Music Notebook',
  },
};

export const TomorrowPrepCard: React.FC<TomorrowPrepCardProps> = ({
  currentDay,
  tasks,
  subjects,
  timetable,
  section = '2A',
  onSelectDay,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Determine tomorrow & next school day
  const dayCycle: Record<DayOfWeek, { nextDay: DayOfWeek; isWeekendTomorrow: boolean; nextSchoolDay: DayOfWeek }> = {
    sunday: { nextDay: 'monday', isWeekendTomorrow: false, nextSchoolDay: 'monday' },
    monday: { nextDay: 'tuesday', isWeekendTomorrow: false, nextSchoolDay: 'tuesday' },
    tuesday: { nextDay: 'wednesday', isWeekendTomorrow: false, nextSchoolDay: 'wednesday' },
    wednesday: { nextDay: 'thursday', isWeekendTomorrow: false, nextSchoolDay: 'thursday' },
    thursday: { nextDay: 'friday', isWeekendTomorrow: true, nextSchoolDay: 'sunday' },
    friday: { nextDay: 'saturday', isWeekendTomorrow: true, nextSchoolDay: 'sunday' },
    saturday: { nextDay: 'sunday', isWeekendTomorrow: false, nextSchoolDay: 'sunday' },
  };

  const { nextDay, isWeekendTomorrow, nextSchoolDay } = dayCycle[currentDay] || {
    nextDay: 'sunday',
    isWeekendTomorrow: false,
    nextSchoolDay: 'sunday',
  };

  // Target day for school preparations
  const prepTargetDay = isWeekendTomorrow ? nextSchoolDay : nextDay;
  const targetDayInfo = DAYS_LIST.find((d) => d.key === prepTargetDay) || DAYS_LIST[0];

  // Tomorrow's timetable periods for the current class section
  const targetPeriods = timetable[prepTargetDay] || [];

  // Group periods by subject for tomorrow to show exact period slots
  const subjectPeriodsMap = new Map<string, number[]>();
  targetPeriods.forEach((slot) => {
    const existing = subjectPeriodsMap.get(slot.subjectId) || [];
    existing.push(slot.period);
    subjectPeriodsMap.set(slot.subjectId, existing);
  });

  const uniqueSubjectIds = Array.from(subjectPeriodsMap.keys());

  // Tasks scheduled for tomorrow filtered by section
  const targetTasks = tasks.filter(
    (t) => t.day === prepTargetDay && (!t.section || t.section === section)
  );
  const targetHomeworks = targetTasks.filter((t) => t.type === 'homework');
  const targetSupplies = targetTasks.filter((t) => t.type === 'supplies');
  const targetQuizzes = targetTasks.filter((t) => t.type === 'quiz' || t.type === 'dictation');

  // Build checklist items
  const checkableItemIds: string[] = [];

  // 1. Each scheduled subject's books & materials
  uniqueSubjectIds.forEach((subjId) => {
    checkableItemIds.push(`subject-book-${subjId}`);
  });

  // 2. Homework submissions if any
  targetHomeworks.forEach((hw) => {
    checkableItemIds.push(`hw-${hw.id}`);
  });

  // 3. Special tools & supplies
  targetSupplies.forEach((supp) => {
    checkableItemIds.push(`supp-${supp.id}`);
  });

  if (uniqueSubjectIds.includes('pe')) {
    checkableItemIds.push('pe-kit-reminder');
  }
  if (uniqueSubjectIds.includes('math')) {
    checkableItemIds.push('math-tools-reminder');
  }

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePackAll = () => {
    const allChecked: Record<string, boolean> = {};
    checkableItemIds.forEach((id) => {
      allChecked[id] = true;
    });
    setCheckedItems(allChecked);
  };

  const handleReset = () => {
    setCheckedItems({});
  };

  const totalCheckItems = checkableItemIds.length;
  const completedCheckItems = checkableItemIds.filter((id) => checkedItems[id]).length;
  const prepProgress = totalCheckItems > 0 ? Math.round((completedCheckItems / totalCheckItems) * 100) : 0;
  const isAllReady = totalCheckItems > 0 && completedCheckItems === totalCheckItems;

  return (
    <div
      id="tomorrow-prep-card"
      className="bg-gradient-to-br from-amber-50/90 via-white to-indigo-50/40 rounded-3xl border-2 border-amber-200/90 p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-amber-300"
    >
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-900/20 shrink-0">
            <Briefcase className="w-5 h-5 stroke-[2.25]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-sans uppercase tracking-wider">
                Tomorrow's Prep & School Bag
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-sans">
                فصل Grade {section}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {isWeekendTomorrow ? `تحضيرات يوم ${targetDayInfo.nameAr}` : `تحضيرات غداً (${targetDayInfo.nameAr})`}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              تجهيز حقيبة ومطلوبات الغد{' '}
              <span className="text-amber-700 font-sans font-bold">
                ({targetDayInfo.nameEn})
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onSelectDay(prepTargetDay)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 font-sans"
            title={`الانتقال إلى خطة يوم ${targetDayInfo.nameAr}`}
          >
            <span>خطة {targetDayInfo.shortAr}</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl hover:bg-amber-100 text-amber-800 transition-colors"
            title={isCollapsed ? 'توسيع المربع' : 'طي المربع'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-4 space-y-4">
          {/* Schedule Highlights for Tomorrow */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>حصص جدول يوم {targetDayInfo.nameAr} المقررة في المدرسة (فصل {section}):</span>
              </span>
              <span className="text-slate-500 font-sans font-normal text-[11px]">
                {targetPeriods.length} حصص مقررة
              </span>
            </div>

            {/* Periods Scrollable Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {targetPeriods.map((slot) => {
                const sub = subjectMap.get(slot.subjectId);
                return (
                  <div
                    key={slot.period}
                    className={`shrink-0 px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                      sub?.color.lightBg || 'bg-white'
                    } ${sub?.color.border || 'border-slate-200'}`}
                  >
                    <span className="text-[10px] font-mono text-slate-500 font-normal">P{slot.period}</span>
                    <SubjectIcon name={sub?.iconName || 'BookOpen'} className={`w-3.5 h-3.5 ${sub?.color.text}`} />
                    <span className={`font-sans ${sub?.color.text}`}>{sub?.nameEn || slot.subjectId}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Pack All / Progress Header */}
          <div className="bg-amber-100/60 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 border border-amber-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>نسبة تجهيز الحقيبة لغداً:</span>
              </span>
              <span className="text-xs font-mono font-black text-amber-800 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                {completedCheckItems} / {totalCheckItems} ({prepProgress}%)
              </span>
              {isAllReady && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                  جاهز تماماً! 🎉
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePackAll}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1 transition-colors"
                title="تحديد كل الكتب والأدوات جاهزة"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>تحديد الكل جاهز</span>
              </button>
              {completedCheckItems > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-xs border border-slate-200 flex items-center gap-1 transition-colors"
                  title="إلغاء التحديد"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              )}
            </div>
          </div>

          {/* 1. Subject-by-Subject Books & Notebooks Checklist */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>الكتب والكشاكيل المطلوبة لحصص جدول غداً (فصل {section}):</span>
              </span>
              <span className="text-[11px] font-sans text-slate-400">
                {uniqueSubjectIds.length} مواد مقررة غداً
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {uniqueSubjectIds.map((subjId) => {
                const subj = subjectMap.get(subjId);
                const req = SUBJECT_REQUIREMENTS[subjId];
                const periods = subjectPeriodsMap.get(subjId) || [];
                const itemId = `subject-book-${subjId}`;
                const isChecked = !!checkedItems[itemId];

                return (
                  <div
                    key={subjId}
                    onClick={() => toggleItem(itemId)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all duration-150 ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <SubjectIcon name={subj?.iconName || 'BookOpen'} className={`w-3.5 h-3.5 ${subj?.color.text}`} />
                        <span className="font-bold text-xs text-slate-900 font-sans">
                          {subj?.nameEn}
                          <span className="text-slate-400 font-normal ms-1">({subj?.nameAr})</span>
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold ms-auto shrink-0">
                          {periods.length === 1 ? `الحصة P${periods[0]}` : `الحصص P${periods.join(', P')}`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700 leading-snug">
                        {req?.booksAr || 'كتاب المادة وكشكول الفصل'}
                      </div>
                      {req?.kitAr && (
                        <div className="text-[10px] text-amber-800 font-medium mt-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block">
                          💡 {req.kitAr}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Homework to Submit Tomorrow (if any) */}
          {targetHomeworks.length > 0 && (
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>الواجبات والتكليفات المطلوب تسليمها غداً ({targetHomeworks.length} واجب):</span>
                </span>
              </div>

              <div className="space-y-1.5">
                {targetHomeworks.map((hw) => {
                  const s = subjectMap.get(hw.subjectId);
                  const itemId = `hw-${hw.id}`;
                  const isChecked = !!checkedItems[itemId];
                  return (
                    <div
                      key={hw.id}
                      onClick={() => toggleItem(itemId)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50/50 hover:bg-amber-100/60 border-amber-200 text-slate-800'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-950 font-sans">{s?.nameEn}:</span>
                          <span className="font-medium text-slate-900">{hw.title}</span>
                          {hw.pages && (
                            <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-200 text-amber-800">
                              {hw.pages}
                            </span>
                          )}
                        </div>
                        {hw.details && (
                          <p className="text-[11px] text-slate-600 mt-0.5">{hw.details}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Upcoming Quizzes or Dictation notice */}
          {targetQuizzes.length > 0 && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <strong>تنبيه اختبار / إملاء غداً في المدرسة:</strong>{' '}
                {targetQuizzes.map((q) => `${q.title}`).join(' ، ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
