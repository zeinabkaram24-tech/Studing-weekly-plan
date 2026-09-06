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
  LogIn,
  LogOut,
  User,
  FolderArchive,
  FolderOpen,
  ShieldCheck,
  Lock,
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
  onOpenArchiveModal: () => void;
  onOpenMaterialsModal?: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  activeBlockNumber?: number;
  activeWeekNumber?: number;
  onOpenVisitorStats: () => void;
  visitorStats: VisitorStatsSummary | null;
  onResetData: () => void;
  todayPendingCount: number;
  todayCompletedCount: number;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
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
  onOpenArchiveModal,
  onOpenMaterialsModal,
  isAdmin = false,
  onOpenAdminLogin,
  activeBlockNumber = 1,
  activeWeekNumber = 1,
  onOpenVisitorStats,
  visitorStats,
  onResetData,
  todayPendingCount,
  todayCompletedCount,
  isLoggedIn = false,
  onLogin,
  onLogout,
}) => {
  const totalToday = todayPendingCount + todayCompletedCount;
  const percentCompleted = totalToday > 0 ? Math.round((todayCompletedCount / totalToday) * 100) : 0;

  const handleUploadClick = () => {
    if (isAdmin) {
      onOpenUploadModal();
    } else if (onOpenAdminLogin) {
      onOpenAdminLogin();
    } else {
      onOpenUploadModal();
    }
  };

  return (
    <>
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-[#0F172A] flex-col border-s border-slate-800 text-slate-200 shrink-0 sticky top-0 h-screen z-30 justify-between select-none">
        {/* Top Branding */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
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

            {/* Discreet top icons for creator / admin */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Materials Button */}
              {onOpenMaterialsModal && (
                <button
                  type="button"
                  id="desktop-header-materials"
                  onClick={onOpenMaterialsModal}
                  className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 hover:text-white border border-blue-800/50 transition-colors shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
                  title="الماتيريال والشيتات (Block 1 - الشيتات الرئيسية والأسابيع)"
                >
                  <FolderOpen className="w-4 h-4 text-blue-400" />
                </button>
              )}

              {/* Upload Weekly Plan Button placed next to visitor records icon */}
              <button
                type="button"
                id="desktop-header-upload-plan"
                onClick={handleUploadClick}
                className="p-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 hover:text-white border border-indigo-800/50 transition-colors shadow-xs active:scale-95 flex items-center gap-1"
                title={isAdmin ? 'إضافة ملفات الخطة (الأدمن)' : 'إضافة ملفات الخطة مقتصر على الأدمن'}
              >
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                {!isAdmin && <Lock className="w-2.5 h-2.5 text-indigo-300" />}
              </button>

              {/* Green visitor records icon */}
              <button
                type="button"
                id="desktop-header-visitor-stats"
                onClick={onOpenVisitorStats}
                className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/50 transition-colors shadow-xs active:scale-95 cursor-pointer"
                title="تقرير تسجيل الدخول ومتابعة الطلاب والزوار (Admin)"
              >
                <Users className="w-4 h-4" />
              </button>
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

          {/* Student Status & Auth Toggle Card */}
          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isLoggedIn
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="truncate text-right">
                  <span className="font-bold text-white text-xs block truncate">
                    {isLoggedIn ? student.name : 'وضع الزائر (Guest)'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans block">
                    {isLoggedIn ? `طالب فصل ${selectedSection}` : 'غير مسجّل دخول'}
                  </span>
                </div>
              </div>

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={onOpenEditProfile}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                  title="تعديل بيانات الطالب"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dynamic Login / Logout Button */}
            {isLoggedIn ? (
              <button
                type="button"
                id="sidebar-btn-auth-logout"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition-all shadow-xs active:scale-98 cursor-pointer"
                title="تسجيل الخروج من الحساب"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>تسجيل خروج</span>
              </button>
            ) : (
              <button
                type="button"
                id="sidebar-btn-auth-login"
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm active:scale-98 cursor-pointer"
                title="تسجيل الدخول باسم الطالب"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-100" />
                <span>تسجيل دخول</span>
              </button>
            )}
          </div>
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
              ذاكرة وأرشيف الخطط (Memory & Archive)
            </span>

            {/* User Requested: Archive Navigation Button */}
            <button
              type="button"
              id="sidebar-btn-archive"
              onClick={onOpenArchiveModal}
              className="w-full bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/80 hover:to-indigo-900/80 text-purple-200 border border-purple-700/50 p-2.5 rounded-xl text-xs flex items-center justify-between transition-all font-sans group shadow-xs active:scale-98"
              title="ذاكرة وأرشيف الخطط الأسبوعية (الرجوع لأي بلوك أو أسبوع)"
            >
              <div className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">أرشيف الأسابيع والبلوكات</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-300 font-mono font-bold">
                B{activeBlockNumber} • W{activeWeekNumber}
              </span>
            </button>

            {/* User Requested: Materials Navigation Button */}
            {onOpenMaterialsModal && (
              <button
                type="button"
                id="sidebar-btn-materials"
                onClick={onOpenMaterialsModal}
                className="w-full bg-gradient-to-r from-blue-950/70 to-indigo-950/70 hover:from-blue-900/90 hover:to-indigo-900/90 text-blue-200 border border-blue-600/50 p-2.5 rounded-xl text-xs flex items-center justify-between transition-all font-sans group shadow-xs active:scale-98 cursor-pointer"
                title="الماتيريال وشيتات المذاكرة (Block 1 والشيتات الرئيسية والأسابيع)"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold">الماتيريال (Materials)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300 font-bold">
                  Block 1
                </span>
              </button>
            )}

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
          </div>

          {/* Action Tools Section */}
          <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-2">
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
            <div className="flex items-center gap-1.5">
              {/* Dynamic Login / Logout Button for Mobile */}
              {isLoggedIn ? (
                <button
                  type="button"
                  id="mobile-btn-auth-toggle"
                  onClick={onLogout}
                  className="px-2 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                  title="تسجيل خروج"
                >
                  <LogOut className="w-3 h-3 text-rose-400" />
                  <span>خروج</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="mobile-btn-auth-toggle"
                  onClick={onLogin}
                  className="px-2 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs text-[11px] font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
                  title="تسجيل دخول"
                >
                  <LogIn className="w-3 h-3 text-white" />
                  <span>دخول</span>
                </button>
              )}

              {/* Materials button on mobile */}
              {onOpenMaterialsModal && (
                <button
                  type="button"
                  id="mobile-btn-materials"
                  onClick={onOpenMaterialsModal}
                  className="p-1.5 rounded-xl bg-blue-900/70 hover:bg-blue-800 text-blue-200 border border-blue-700/60 shadow-xs text-xs cursor-pointer flex items-center gap-1"
                  title="الماتيريال والشيتات (Block 1)"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Archive button on mobile */}
              <button
                type="button"
                id="mobile-btn-archive"
                onClick={onOpenArchiveModal}
                className="p-1.5 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-700/60 shadow-xs text-xs"
                title="أرشيف وبلوكات الخطط الأسبوعية"
              >
                <FolderArchive className="w-3.5 h-3.5" />
              </button>

              {/* Admin Tools: Upload Plan Files next to Visitor Records Icon */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="p-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 text-xs flex items-center gap-0.5 active:scale-95"
                  title={isAdmin ? 'إضافة ملفات الخطة (الأدمن)' : 'إضافة ملفات الخطة مقتصر على الأدمن'}
                >
                  <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                  {!isAdmin && <Lock className="w-2 h-2 text-indigo-300" />}
                </button>

                <button
                  type="button"
                  id="mobile-btn-visitor-stats"
                  onClick={onOpenVisitorStats}
                  className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/70 text-xs flex items-center justify-center active:scale-95 cursor-pointer"
                  title="تقرير تسجيل الدخول ومتابعة الطلاب والزوار (Admin)"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
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
