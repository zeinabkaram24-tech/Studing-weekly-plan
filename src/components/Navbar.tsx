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
    onOpenUploadModal();
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

            {/* Top Quick Actions: Unified Admin Button */}
            <div className="flex items-center shrink-0">
              {/* Single Unified Admin Button (Protected by password) */}
              <button
                type="button"
                id="desktop-header-admin-btn"
                onClick={handleUploadClick}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-800/60 transition-all shadow-xs active:scale-95 flex items-center gap-1.5 font-bold text-xs cursor-pointer"
                title="أدمن: تحميل ومسح الشيتات وإحصائيات المستخدمين والزوار"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>أدمن</span>
                {!isAdmin && <Lock className="w-2.5 h-2.5 text-indigo-300" />}
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

          {/* 4. Library / Materials Section */}
          {onOpenMaterialsModal && (
            <button
              type="button"
              id="tab-library-desktop"
              onClick={onOpenMaterialsModal}
              className="w-full flex items-center justify-between p-3 rounded-2xl transition-all text-xs sm:text-sm font-bold text-slate-400 hover:bg-slate-800/80 hover:text-blue-300 border border-transparent hover:border-blue-900/50 cursor-pointer"
              title="مكتبة الشيتات والماتيريال الرسمية (عرض وتصفح وطباعة)"
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4 text-blue-400" />
                <span>المكتبة والشيتات (Materials)</span>
              </div>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                عرض
              </span>
            </button>
          )}

          {/* 5. Unified Admin Menu Item in Navigation */}
          <button
            type="button"
            id="tab-admin-desktop"
            onClick={handleUploadClick}
            className="w-full flex items-center justify-between p-3 rounded-2xl transition-all text-xs sm:text-sm font-bold text-slate-400 hover:bg-slate-800/80 hover:text-indigo-300 border border-slate-800/80 hover:border-indigo-800/60 cursor-pointer"
            title="دخول لوحة تحكم الأدمن (تحميل ومسح الشيتات وإحصائيات الزوار والمستخدمين)"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>أدمن (Admin)</span>
            </div>
            {!isAdmin ? (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Lock className="w-3 h-3 text-indigo-400/80" />
                <span>1940</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                نشط
              </span>
            )}
          </button>

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

              {/* Single Unified Admin Button for Mobile */}
              <button
                type="button"
                id="mobile-btn-admin"
                onClick={handleUploadClick}
                className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 text-xs flex items-center gap-1 active:scale-95 cursor-pointer font-bold"
                title="أدمن: تحميل ومسح الشيتات وحساب عدد الزوار والمستخدمين"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>أدمن</span>
                {!isAdmin && <Lock className="w-2.5 h-2.5 text-indigo-300" />}
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
