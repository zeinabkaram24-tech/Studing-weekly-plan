/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  SchoolClass,
  UserRole,
  StudentProfile,
  StudentPersonalTask,
  DailyFollowUp,
  WeeklyPlanItem,
  ClassTimetable,
  SchoolMaterialFile
} from './types';
import {
  getStoredTimetables,
  saveStoredTimetables,
  getStoredWeeklyPlans,
  saveStoredWeeklyPlans,
  getStoredDailyFollowUps,
  saveStoredDailyFollowUps,
  getStoredStudentTasks,
  saveStoredStudentTasks,
  getStoredCompletedHw,
  saveStoredCompletedHw,
  getStoredMaterials,
  saveStoredMaterials,
  hydrateStoredFiles,
  resetAllDataToDefault
} from './lib/storage';
import { Header } from './components/Header';
import { DailyFollowUpView } from './components/DailyFollowUpView';
import { WeeklyPlanView } from './components/WeeklyPlanView';
import { TimetableView } from './components/TimetableView';
import { MaterialsView } from './components/MaterialsView';
import { StudentSpace } from './components/StudentSpace';
import { AdminPanel } from './components/AdminPanel';
import { PrintModal } from './components/PrintModal';
import { extractWeeklyPlanText, parseWeeklyPlanText, WEEKLY_PLAN_PARSER_VERSION } from './lib/weeklyPlanParser';
import { WeeklyPlanExtraction } from './lib/geminiWeeklyPlan';
import { SUBJECTS } from './data/initialData';
import {
  GraduationCap,
  ShieldCheck,
  Eye,
  User,
  Heart,
  Sparkles
} from 'lucide-react';

export default function App() {
  // State Initialization
  const [currentRole, setCurrentRole] = useState<UserRole>('visitor');
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('2A');
  const [selectedBlock, setSelectedBlock] = useState<string>('block1');
  const [selectedWeek, setSelectedWeek] = useState<string>('week2');
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nile_minya_cur_student');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'timetable' | 'materials' | 'student' | 'admin' | 'tasks'>('daily');

  const [timetables, setTimetables] = useState<ClassTimetable[]>(getStoredTimetables);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlanItem[]>(getStoredWeeklyPlans);
  const [dailyFollowUps, setDailyFollowUps] = useState<DailyFollowUp[]>(getStoredDailyFollowUps);
  const [studentTasks, setStudentTasks] = useState<StudentPersonalTask[]>(getStoredStudentTasks);
  const [completedHwMap, setCompletedHwMap] = useState<Record<string, boolean>>(getStoredCompletedHw);
  const [materials, setMaterials] = useState<SchoolMaterialFile[]>(getStoredMaterials);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Binary attachments live in IndexedDB so refreshing the app cannot lose
  // files when localStorage reaches its small quota.
  useEffect(() => {
    void Promise.all([
      hydrateStoredFiles(timetables),
      hydrateStoredFiles(weeklyPlans),
      hydrateStoredFiles(materials)
    ]).then(([storedTimetables, storedWeeklyPlans, storedMaterials]) => {
      setTimetables(storedTimetables);
      setWeeklyPlans(storedWeeklyPlans);
      setMaterials(storedMaterials);
    });
    // Hydrate only the initial snapshot; subsequent edits are already in state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pending = weeklyPlans.filter((plan) =>
      (plan.fileType === 'pdf' || plan.fileType === 'word' || plan.fileType === 'doc' || plan.fileType === 'image') &&
      plan.fileDataUrl && plan.extractionVersion !== WEEKLY_PLAN_PARSER_VERSION
    );
    if (!pending.length) return;
    let cancelled = false;
    void Promise.all(pending.map(async (plan) => {
      try {
        const extracted = parseWeeklyPlanText(await extractWeeklyPlanText(plan.fileDataUrl!, plan.fileType));
        return { ...plan, extractedText: extracted.extractedText, extractionVersion: WEEKLY_PLAN_PARSER_VERSION, classworkNote: extracted.classworkNote, homeworkNote: extracted.homeworkNote, tomorrowNote: extracted.tomorrowNote, dayContent: extracted.dayContent };
      } catch {
        return { ...plan, extractionVersion: WEEKLY_PLAN_PARSER_VERSION };
      }
    })).then((processed) => {
      if (cancelled) return;
      const byId = new Map(processed.map((plan) => [plan.id, plan]));
      setWeeklyPlans((current) => current.map((plan) => byId.get(plan.id) || plan));
    });
    return () => { cancelled = true; };
  }, [weeklyPlans]);

  // Sync to Storage
  useEffect(() => {
    saveStoredTimetables(timetables);
  }, [timetables]);

  useEffect(() => {
    saveStoredWeeklyPlans(weeklyPlans);
  }, [weeklyPlans]);

  useEffect(() => {
    saveStoredDailyFollowUps(dailyFollowUps);
  }, [dailyFollowUps]);

  useEffect(() => {
    saveStoredStudentTasks(studentTasks);
  }, [studentTasks]);

  useEffect(() => {
    saveStoredCompletedHw(completedHwMap);
  }, [completedHwMap]);

  useEffect(() => {
    saveStoredMaterials(materials);
  }, [materials]);

  // Instant multi-tab and cross-window sync listener
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      try {
        if ((e.key === 'nile_minya_timetables_v3' || e.key === 'nile_minya_timetables_v2') && e.newValue) {
          setTimetables(JSON.parse(e.newValue));
        } else if (e.key === 'nile_minya_weekly_plans_v1' && e.newValue) {
          setWeeklyPlans(JSON.parse(e.newValue));
        } else if (e.key === 'nile_minya_daily_follow_ups_v1' && e.newValue) {
          setDailyFollowUps(JSON.parse(e.newValue));
        } else if ((e.key === 'nile_minya_materials_v4' || e.key === 'nile_minya_materials_v3' || e.key === 'nile_minya_materials_v2' || e.key === 'nile_minya_materials_v1') && e.newValue) {
          setMaterials(JSON.parse(e.newValue));
        } else if (e.key === 'nile_minya_student_tasks_v1' && e.newValue) {
          setStudentTasks(JSON.parse(e.newValue));
        } else if (e.key === 'nile_minya_completed_hw_v1' && e.newValue) {
          setCompletedHwMap(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Storage sync error', err);
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  useEffect(() => {
    if (studentProfile) {
      localStorage.setItem('nile_minya_cur_student', JSON.stringify(studentProfile));
    } else {
      localStorage.removeItem('nile_minya_cur_student');
    }
  }, [studentProfile]);

  // Handlers for Student Tasks
  const handleAddStudentTask = (task: Omit<StudentPersonalTask, 'id' | 'createdAt'>) => {
    const newTask: StudentPersonalTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setStudentTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleStudentTask = (taskId: string) => {
    setStudentTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteStudentTask = (taskId: string) => {
    setStudentTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Toggle Completed Homework
  const handleToggleHwCompletion = (hwId: string) => {
    setCompletedHwMap((prev) => ({
      ...prev,
      [hwId]: !prev[hwId]
    }));
  };

  const handleWeeklyPlanPdfParsed = (parsed: WeeklyPlanExtraction) => {
    const weekNumber = Number(selectedWeek.replace(/\D/g, '')) || 1;
    const normalize = (value: string) => value.toLowerCase().replace(/[\s_-]+/g, '').trim();
    const dayAliases: Record<string, string> = {
      sunday: 'Sunday', sun: 'Sunday', 'الأحد': 'Sunday', الاحد: 'Sunday',
      monday: 'Monday', mon: 'Monday', 'الإثنين': 'Monday', الاثنين: 'Monday',
      tuesday: 'Tuesday', tue: 'Tuesday', 'الثلاثاء': 'Tuesday',
      wednesday: 'Wednesday', wed: 'Wednesday', 'الأربعاء': 'Wednesday', الاربعاء: 'Wednesday',
      thursday: 'Thursday', thu: 'Thursday', 'الخميس': 'Thursday'
    };
    const resolveSubject = (value: string) => SUBJECTS.find((subject) =>
      [subject.id, subject.nameAr, subject.nameEn].some((name) => normalize(name) === normalize(value))
    ) || SUBJECTS[0];
    const nextPlans = [...weeklyPlans];
    parsed.items.forEach((item, index) => {
      const subjectInfo = resolveSubject(item.subject);
      const day = dayAliases[normalize(item.day)] || item.day || 'Sunday';
      const existingIndex = nextPlans.findIndex((plan) =>
        plan.weekId === selectedWeek && plan.day === day && plan.subjectId === subjectInfo.id &&
        (plan.classId === 'all' || plan.classId === selectedClass)
      );
      const previous = existingIndex >= 0 ? nextPlans[existingIndex] : undefined;
      const updatedPlan: WeeklyPlanItem = {
        ...(previous || {
          id: `wp-gemini-${Date.now()}-${index}`,
          blockId: selectedBlock,
          weekId: selectedWeek,
          classId: 'all',
          subjectId: subjectInfo.id,
          unitOrTheme: 'Gemini Weekly Plan Import',
          learningObjectives: ['تم استخراج محتوى الخطة الأسبوعية بواسطة Gemini']
        }),
        weekNumber,
        day,
        subject: item.subject || subjectInfo.nameEn,
        classwork: item.classWork,
        homework: item.homeWork,
        classworkNote: item.classWork || undefined,
        homeworkNote: item.homeWork || undefined,
        tomorrowNote: item.notes || undefined,
        extractedText: [item.classWork, item.homeWork, item.notes].filter(Boolean).join('\n'),
        extractionVersion: WEEKLY_PLAN_PARSER_VERSION
      };
      if (existingIndex >= 0) nextPlans[existingIndex] = updatedPlan;
      else nextPlans.unshift(updatedPlan);
    });
    setWeeklyPlans(nextPlans);
    alert(`تمت قراءة الملف بواسطة Gemini وتوزيع ${parsed.items.length} سجلًا على Classwork وHomework وTomorrow.`);
  };

  // Reset to default
  const handleResetData = () => {
    resetAllDataToDefault();
    setTimetables(getStoredTimetables());
    setWeeklyPlans(getStoredWeeklyPlans());
    setDailyFollowUps(getStoredDailyFollowUps());
    setStudentTasks(getStoredStudentTasks());
    setMaterials(getStoredMaterials());
    setCompletedHwMap({});
    alert('تمت استعادة البيانات الافتراضية بنجاح.');
  };

  // Import JSON backup
  const handleImportData = (json: any) => {
    if (json.timetables) setTimetables(json.timetables);
    if (json.weeklyPlans) setWeeklyPlans(json.weeklyPlans);
    if (json.dailyFollowUps) setDailyFollowUps(json.dailyFollowUps);
    if (json.studentTasks) setStudentTasks(json.studentTasks);
    if (json.materials) setMaterials(json.materials);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* App Header & Navigation */}
      <Header
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
        selectedBlock={selectedBlock}
        onSelectBlock={setSelectedBlock}
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
        studentProfile={studentProfile}
        onUpdateStudentProfile={setStudentProfile}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenPrint={() => setIsPrintModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Tab 1: Daily Follow-up */}
        {(activeTab === 'daily' || activeTab === 'tasks') && (
          <DailyFollowUpView
            currentRole={currentRole}
            selectedClass={selectedClass}
            selectedBlock={selectedBlock}
            selectedWeek={selectedWeek}
            dailyFollowUps={dailyFollowUps}
            onUpdateDailyFollowUps={setDailyFollowUps}
            completedHwMap={completedHwMap}
            onToggleHwCompletion={handleToggleHwCompletion}
            studentName={studentProfile?.name}
            onOpenPrint={() => setIsPrintModalOpen(true)}
            timetables={timetables}
            weeklyPlans={weeklyPlans}
            onUpdateWeeklyPlans={setWeeklyPlans}
            materials={materials}
          />
        )}

        {/* Tab 2: Weekly Plan */}
        {activeTab === 'weekly' && (
          <WeeklyPlanView
            currentRole={currentRole}
            selectedClass={selectedClass}
            selectedBlock={selectedBlock}
            onSelectBlock={setSelectedBlock}
            selectedWeek={selectedWeek}
            onSelectWeek={setSelectedWeek}
            weeklyPlans={weeklyPlans}
            onUpdateWeeklyPlans={setWeeklyPlans}
            onOpenPrint={() => setIsPrintModalOpen(true)}
            onPlanParsed={handleWeeklyPlanPdfParsed}
          />
        )}

        {/* Tab 3: Timetable */}
        {activeTab === 'timetable' && (
          <TimetableView
            currentRole={currentRole}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            timetables={timetables}
            onUpdateTimetables={setTimetables}
            onOpenPrint={() => setIsPrintModalOpen(true)}
          />
        )}

        {/* Tab 4: Materials & Books Library (الماتيريال والمذكرات المدرسية) */}
        {activeTab === 'materials' && (
          <MaterialsView
            currentRole={currentRole}
            selectedClass={selectedClass}
            selectedBlock={selectedBlock}
            selectedWeek={selectedWeek}
            materials={materials}
            onUpdateMaterials={setMaterials}
          />
        )}

        {/* Tab 5: Student Space */}
        {activeTab === 'student' && (
          <StudentSpace
            studentProfile={studentProfile}
            onUpdateStudentProfile={setStudentProfile}
            tasks={studentTasks}
            onAddTask={handleAddStudentTask}
            onToggleTask={handleToggleStudentTask}
            onDeleteTask={handleDeleteStudentTask}
            dailyFollowUps={dailyFollowUps}
            completedHwMap={completedHwMap}
            onToggleHwCompletion={handleToggleHwCompletion}
          />
        )}

        {/* Tab 5: Admin Panel (Only if admin role) */}
        {activeTab === 'admin' && currentRole === 'admin' && (
          <AdminPanel
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            selectedBlock={selectedBlock}
            selectedWeek={selectedWeek}
            onNavigateToTab={setActiveTab}
            onResetData={handleResetData}
            onImportData={handleImportData}
            dailyFollowUps={dailyFollowUps}
            weeklyPlans={weeklyPlans}
            onUpdateWeeklyPlans={setWeeklyPlans}
            timetables={timetables}
            onUpdateTimetables={setTimetables}
            materials={materials}
            onUpdateMaterials={setMaterials}
          />
        )}
      </main>

      {/* Official Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800">
              مدارس النيل المصرية الدولية - فرع المنيا
            </span>
            <span>•</span>
            <span>نظام المتابعة المدرسية لجريد 2 (2A - 2B - 2C)</span>
          </div>

          <div className="flex items-center gap-4">
            <span>البلوكات والأسابيع الدراسية المعتمدة</span>
            <span>•</span>
            <span>العام الدراسي 2026 / 2027</span>
          </div>
        </div>
      </footer>

      {/* Printable Report Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedClass={selectedClass}
        selectedBlock={selectedBlock}
        selectedWeek={selectedWeek}
        dailyFollowUps={dailyFollowUps}
        weeklyPlans={weeklyPlans}
        timetables={timetables}
      />
    </div>
  );
}
