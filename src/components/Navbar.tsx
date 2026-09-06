import React from 'react';
import { GradeSection, StudentProfile } from '../types';
import {
  Calendar,
  Clock,
  Edit2,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Printer,
  RotateCcw,
  ListTodo,
  UploadCloud,
  Users,
  School,
  ChevronDown,
} from 'lucide-react';
import { VisitorStatsSummary } from '../types';

interface NavbarProps {
  currentTab: 'today' | 'weekly' | 'timetable';
  onSelectTab: (tab: 'today' | 'weekly' | 'timetable') => void;
  student: StudentProfile;
  selectedSection: GradeSection;
  onSelectSection: (section: GradeSection) => void;
  onOpenClassSelector: () => void;
  onOpenEditProfile: () => void;
  onOpenAddTask: () => void;
  onOpenSmartPaste: () => void;
  onOpenTimetableModal: () => void;
  onOpenWeekDaysModal: () => void;
  onOpenUploadModal: () => void;
  onOpenVisitorStats: () => void;
  visitorStats: VisitorStatsSummary | null;
  onResetData: () => void;
  todayPendingCount: number;
  todayCompletedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  student,
  selectedSection,
  onSelectSection,
  onOpenClassSelector,
  onOpenEditProfile,
  onOpenAddTask,
  onOpenSmartPaste,
  onOpenTimetableModal,
  onOpenWeekDaysModal,
  onOpenUploadModal,
  onOpenVisitorStats,
  visitorStats,
  onResetData,
  todayPendingCount,
  todayCompletedCount,
}) => {
  const totalToday = todayPendingCount + todayCompletedCount;
  const percentCompleted = totalToday > 0 ? Math.round((todayCompletedCount / totalToday) * 100) : 0;

  return (
    <>
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-[#0F172A] flex-col border-s border-slate-800 text-slate-200 shrink-0 sticky top-0 h-screen z-30 justify-between select-none">
        {/* Top Branding */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-950 ring-2 ring-indigo-400/30">
              {selectedSection}
            </div>
            <div>
              <h1 className="text-white text-base font-black tracking-tight leading-tight font-sans">
                Studying Weekly Plan
              </h1>
              <span className="text-[11px] text-indigo-400 font-sans font-bold block">
                Nile Schools • Grade 2 ({selectedSection})
              </span>
            </div>
          </div>

          {/* Requested Feature: Class Section Switcher (2A / 2B / 2C) */}
          <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 mb-3 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2 px-1">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <School className="w-3.5 h-3.5" />
                <span>الفصل الدراسي:</span>
              </span>
              <button
                type="button"
                onClick={onOpenClassSelector}
                className="text-xs text-indigo-400 hover:text-indigo-200 flex items-center gap-0.5 transition-colors font-medium"
              >
                <span>تغيير</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
              {(['2A', '2B', '2C'] as GradeSection[]).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onSelectSection(sec)}
                  className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedSection === sec
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEditProfile}
            className="w-full group flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs hover:border-slate-700 transition-colors text-right"
            title="تعديل بيانات الفصل والطالب"
          >
            <div className="truncate">
              <span className="font-bold text-white block truncate">{student.name}</span>
              <span className="text-[11px] text-slate-400 font-sans">{student.grade}</span>
            </div>
            <Edit2 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-indigo-400 shrink-0" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {/* 1. Today's Tasks */}
          <button
            type="button"
            id="tab-today-desktop"
            onClick={() => onSelectTab('today')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-xs sm:text-sm font-bold ${
              currentTab === 'today'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4" />
              <span>خطة اليوم (Daily View)</span>
            </div>
            {todayPendingCount > 0 ? (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                {todayPendingCount}
              </span>
            ) : (
              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                Done
              </span>
            )}
          </button>

          {/* 2. Full Weekly Schedule */}
          <button
            type="button"
            id="tab-weekly-desktop"
            onClick={() => onSelectTab('weekly')}
            className={`w-full flex items-center gap-2.5 p-3 rounded-2xl transition-all text-xs sm:text-sm font-bold ${
              currentTab === 'weekly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>المخطط الأسبوعي الكامل</span>
          </button>

          {/* 3. School Timetable */}
          <button
            type="button"
            id="tab-timetable-desktop"
            onClick={() => onSelectTab('timetable')}
            className={`w-full flex items-center gap-2.5 p-3 rounded-2xl transition-all text-xs sm:text-sm font-bold ${
              currentTab === 'timetable'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>جدول حصص فصل {selectedSection}</span>
          </button>

          {/* SPECIAL QUICK POPUP SHORTCUTS AS REQUESTED */}
          <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block font-sans">
              Quick Popups (أيقونات الفتح السريع)
            </span>

            {/* Timetable popup shortcut */}
            <button
              type="button"
              onClick={onOpenTimetableModal}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              <span>نافذة الجدول الدراسي السريعة</span>
            </button>

            {/* Weekdays popup shortcut */}
            <button
              type="button"
              onClick={onOpenWeekDaysModal}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 transition-colors"
            >
              <ListTodo className="w-4 h-4 text-purple-400" />
              <span>عرض كل أيام الأسبوع والمخطط</span>
            </button>

            {/* Visitor / Email Stats Button */}
            <button
              type="button"
              id="sidebar-visitor-stats"
              onClick={onOpenVisitorStats}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 transition-all shadow-xs"
              title="عرض عدد وإحصائيات الإيميلات التي استخدمت التطبيق"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>إحصائيات وإيميلات الزوار</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {visitorStats ? `${visitorStats.totalUniqueEmails} إيميل` : '...'}
              </span>
            </button>
          </div>

          {/* Action Tools Section */}
          <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-2">
            {/* Primary Requested Upload Button */}
            <button
              type="button"
              id="sidebar-upload-plan-files"
              onClick={onOpenUploadModal}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/80 transition-all active:scale-98 font-sans"
              title="رفع ملفات الخطة الأسبوعية (PDFs والصور)"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.5]" />
              <span>📁 رفع ملفات الـ Weekly Plan</span>
            </button>

            <button
              type="button"
              id="sidebar-add-task"
              onClick={onOpenAddTask}
              className="w-full bg-slate-900 hover:bg-slate-800 text-indigo-300 font-bold p-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-800 transition-colors font-sans"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Weekly Plan Task</span>
            </button>

            <button
              type="button"
              id="sidebar-smart-paste"
              onClick={onOpenSmartPaste}
              className="w-full bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold p-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-800 transition-colors font-sans"
              title="لصق رسائل المدرسة الذكية"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Smart Paste (لصق ذكي)</span>
            </button>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs p-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
                title="طباعة الخطة"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة</span>
              </button>

              <button
                type="button"
                onClick={onResetData}
                className="flex-1 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400 text-xs p-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
                title="إعادة تعيين واستعادة البيانات الأصلية"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة البيانات</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Today's Goal Box (English Done status) */}
        <div className="p-5 mt-auto border-t border-slate-800/80">
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-xs font-semibold">إنجاز اليوم (Progress)</span>
              <span className="text-indigo-400 text-xs font-bold font-sans">{percentCompleted}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentCompleted}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex justify-between font-sans">
              <span className="text-emerald-400 font-bold">{todayCompletedCount} Done</span>
              <span className="text-amber-400 font-bold">{todayPendingCount} Pending</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE TOP BAR & QUICK ACTIONS */}
      <header className="md:hidden bg-[#0F172A] border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm ring-1 ring-indigo-400/40">
                {selectedSection}
              </div>
              <div>
                <h1 className="text-xs font-bold text-white leading-tight">
                  Studying Weekly Plan
                </h1>
                <span className="text-[10px] text-indigo-300 font-sans block">
                  Grade 2 • فصل {selectedSection}
                </span>
              </div>
            </div>

            {/* Quick Class Switcher for Mobile */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['2A', '2B', '2C'] as GradeSection[]).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onSelectSection(sec)}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${
                    selectedSection === sec
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {/* Quick Actions for Mobile */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs text-xs"
                title="رفع ملفات الخطة الأسبوعية"
              >
                <UploadCloud className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                id="mobile-btn-visitor-stats"
                onClick={onOpenVisitorStats}
                className="p-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs flex items-center gap-1"
                title="إحصائيات وإيميلات المستخدمين"
              >
                <Users className="w-3.5 h-3.5" />
                {visitorStats && (
                  <span className="text-[9px] font-mono font-bold">{visitorStats.totalUniqueEmails}</span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              id="tab-today-mobile"
              onClick={() => onSelectTab('today')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'today'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>اليوم ({todayPendingCount})</span>
            </button>

            <button
              type="button"
              id="tab-weekly-mobile"
              onClick={() => onSelectTab('weekly')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>المخطط</span>
            </button>

            <button
              type="button"
              id="tab-timetable-mobile"
              onClick={() => onSelectTab('timetable')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'timetable'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>الجدول {selectedSection}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
