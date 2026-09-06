import React, { useState, useEffect } from 'react';
import {
  DayOfWeek,
  GradeSection,
  PlanTask,
  StudentProfile,
  Subject,
  Timetable,
  UploadedPlanFile,
} from './types';
import {
  getTodayDayOfWeek,
  loadSavedGradeSection,
  loadSavedStudent,
  loadSavedSubjects,
  loadSavedTasks,
  loadSavedTimetable,
  loadSavedUploadedFiles,
  loadWeekTitle,
  resetAllDataToDefault,
  saveGradeSection,
  saveStudent,
  saveTasks,
  saveTimetable,
  saveUploadedFiles,
  saveWeekTitle,
  isStudentRemembered,
  getSavedStudentName,
  isUserLoggedIn,
  clearStudentLogin,
} from './utils/storage';
import { DEFAULT_TIMETABLE, GRADE_TIMETABLES } from './data/defaultData';
import { Navbar } from './components/Navbar';
import { TodayView } from './components/TodayView';
import { WeeklyPlanView } from './components/WeeklyPlanView';
import { TimetableView } from './components/TimetableView';
import { TaskModal } from './components/TaskModal';
import { SmartPasteModal } from './components/SmartPasteModal';
import { EditProfileModal } from './components/EditProfileModal';
import { QuickTimetableModal } from './components/QuickTimetableModal';
import { WeekDaysPickerModal } from './components/WeekDaysPickerModal';
import { UploadPlanFilesModal } from './components/UploadPlanFilesModal';
import { VisitorWelcomeModal } from './components/VisitorWelcomeModal';
import { VisitorStatsModal } from './components/VisitorStatsModal';
import { ClassSelectorModal } from './components/ClassSelectorModal';
import { triggerAllDoneCelebration } from './utils/celebration';
import {
  fetchVisitorStats,
  pingVisitorSession,
  getStoredVisitorEmail,
} from './utils/visitorTracker';
import { VisitorStatsSummary } from './types';

export default function App() {
  const [selectedSection, setSelectedSection] = useState<GradeSection>(() => {
    const saved = loadSavedGradeSection();
    if (saved) return saved;
    const studentSec = loadSavedStudent().section;
    if (studentSec === '2A' || studentSec === '2B' || studentSec === '2C') return studentSec;
    return '2A';
  });

  const [tasks, setTasks] = useState<PlanTask[]>(() => {
    const savedSec = loadSavedGradeSection();
    return loadSavedTasks(savedSec || '2A');
  });
  const [timetable, setTimetable] = useState<Timetable>(() => {
    const savedSec = loadSavedGradeSection();
    return loadSavedTimetable(savedSec || '2A');
  });
  const [subjects] = useState<Subject[]>(() => loadSavedSubjects());
  const [student, setStudent] = useState<StudentProfile>(() => {
    const s = loadSavedStudent();
    const savedSec = loadSavedGradeSection();
    if (savedSec) {
      return { ...s, section: savedSec, grade: `Grade ${savedSec}` };
    }
    return s;
  });
  const [weekTitle, setWeekTitle] = useState<string>(() => loadWeekTitle());
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPlanFile[]>(() => loadSavedUploadedFiles());

  // Class Selection Modal (Initial first-entry prompt or triggered from button)
  const [isClassSelectorOpen, setIsClassSelectorOpen] = useState(false);
  const [showInitialClassPrompt, setShowInitialClassPrompt] = useState(() => {
    return loadSavedGradeSection() === null;
  });

  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<'today' | 'weekly' | 'timetable'>('today');

  // Today Day & Selected Day in TodayView
  const todayDay = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    // School week in Egypt begins Sunday. If today is Friday/Saturday, default to Sunday
    if (todayDay === 'friday' || todayDay === 'saturday') return 'sunday';
    return todayDay;
  });

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlanTask | null>(null);
  const [modalDefaultDay, setModalDefaultDay] = useState<DayOfWeek>(selectedDay);
  const [modalDefaultSubjectId, setModalDefaultSubjectId] = useState<string | undefined>();
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Requested dedicated popups
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isWeekDaysModalOpen, setIsWeekDaysModalOpen] = useState(false);

  // Visitor & Email Tracking States
  const [isVisitorStatsOpen, setIsVisitorStatsOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [visitorStats, setVisitorStats] = useState<VisitorStatsSummary | null>(null);

  // Authentication & Visitor Mode State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isUserLoggedIn());

  const handleLogin = () => {
    setIsWelcomeModalOpen(true);
  };

  const handleLogout = () => {
    clearStudentLogin();
    setIsLoggedIn(false);
    setStudent((prev) => ({
      ...prev,
      name: 'زائر',
    }));
  };

  // Sync visitor stats & session tracking
  useEffect(() => {
    const refreshStats = () => {
      fetchVisitorStats().then((data) => {
        if (data) setVisitorStats(data);
      });
    };
    refreshStats();

    // Check if student login is remembered
    const isRemembered = isStudentRemembered();
    const savedStudentName = getSavedStudentName();
    const storedEmail = getStoredVisitorEmail();

    if (savedStudentName && isRemembered) {
      // Student is remembered on this browser: ping session and do not show welcome prompt
      pingVisitorSession(savedStudentName);
      setStudent((prev) => ({
        ...prev,
        name: savedStudentName,
      }));
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      if (storedEmail) {
        pingVisitorSession(storedEmail);
      } else {
        // First visit / not remembered: Show student welcome registration modal
        const timer = setTimeout(() => {
          setIsWelcomeModalOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    saveTasks(tasks, selectedSection);
  }, [tasks, selectedSection]);

  useEffect(() => {
    saveTimetable(timetable, selectedSection);
  }, [timetable, selectedSection]);

  useEffect(() => {
    saveStudent(student);
  }, [student]);

  useEffect(() => {
    saveWeekTitle(weekTitle);
  }, [weekTitle]);

  useEffect(() => {
    saveUploadedFiles(uploadedFiles);
  }, [uploadedFiles]);

  // Section switcher handler
  const handleSelectSection = (newSection: GradeSection) => {
    // Save current section tasks first
    saveTasks(tasks, selectedSection);

    setSelectedSection(newSection);
    saveGradeSection(newSection);
    setStudent((prev) => ({
      ...prev,
      section: newSection,
      grade: `Grade ${newSection}`,
    }));
    const loadedTimetable = loadSavedTimetable(newSection);
    setTimetable(loadedTimetable);
    const loadedTasks = loadSavedTasks(newSection);
    setTasks(loadedTasks);
    setShowInitialClassPrompt(false);
    setIsClassSelectorOpen(false);
  };

  // Handler: Toggle Task Done / Not Done (English Done)
  const handleToggleDone = (taskId: string) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === taskId) {
          const nextDone = !t.isDone;
          return {
            ...t,
            isDone: nextDone,
            completedAt: nextDone ? Date.now() : undefined,
          };
        }
        return t;
      });

      // Check if all tasks of the selected day are now completed
      const dayTasks = updated.filter((t) => t.day === selectedDay);
      if (dayTasks.length > 0 && dayTasks.every((t) => t.isDone)) {
        setTimeout(() => triggerAllDoneCelebration(), 250);
      }

      return updated;
    });
  };

  // Handler: Save or Update Task
  const handleSaveTask = (taskData: Omit<PlanTask, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit existing
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                day: taskData.day,
                subjectId: taskData.subjectId,
                type: taskData.type,
                title: taskData.title,
                details: taskData.details,
                pages: taskData.pages,
                isDone: taskData.isDone,
                completedAt: taskData.completedAt,
              }
            : t
        )
      );
    } else {
      // Add new
      const newTask: PlanTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        day: taskData.day,
        subjectId: taskData.subjectId,
        section: taskData.section || selectedSection,
        period: taskData.period,
        type: taskData.type,
        title: taskData.title,
        details: taskData.details,
        pages: taskData.pages,
        isDone: taskData.isDone,
        createdAt: Date.now(),
        completedAt: taskData.isDone ? Date.now() : undefined,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  // Handler: Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Handler: Import Parsed Tasks from Smart Paste
  const handleImportTasks = (newTasksList: Omit<PlanTask, 'id' | 'createdAt'>[]) => {
    const formatted: PlanTask[] = newTasksList.map((item, index) => ({
      ...item,
      section: item.section || selectedSection,
      id: `task-imported-${Date.now()}-${index}`,
      createdAt: Date.now(),
    }));
    setTasks((prev) => [...formatted, ...prev]);
  };

  // Handler: Apply New Weekly Plan from Uploaded Files
  const handleApplyNewWeeklyPlan = (
    newTasks: PlanTask[],
    newWeekTitle: string,
    mode: 'keep_pending_and_add' | 'replace' | 'append',
    newFiles: UploadedPlanFile[]
  ) => {
    setWeekTitle(newWeekTitle);
    if (mode === 'keep_pending_and_add') {
      // Carry over only unfinished tasks from the previous week and mark them as old/carried-over
      const carriedOverPendingTasks: PlanTask[] = tasks
        .filter((t) => !t.isDone)
        .map((t) => ({
          ...t,
          isCarriedOver: true,
          previousWeekNote: 'مهمة متبقية من الأسبوع الماضي لم تُنجز',
        }));
      setTasks([...carriedOverPendingTasks, ...newTasks]);
    } else if (mode === 'replace') {
      setTasks(newTasks);
    } else {
      setTasks((prev) => [...newTasks, ...prev]);
    }
    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...newFiles, ...prev]);
    }
    setTimeout(() => triggerAllDoneCelebration(), 200);
  };

  // Open Task Modal for a specific day and optional subject
  const handleOpenAddTask = (day?: DayOfWeek, subjectId?: string) => {
    setEditingTask(null);
    setModalDefaultDay(day || selectedDay);
    setModalDefaultSubjectId(subjectId);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: PlanTask) => {
    setEditingTask(task);
    setModalDefaultDay(task.day);
    setModalDefaultSubjectId(task.subjectId);
    setIsTaskModalOpen(true);
  };

  // Reset to original defaults for current section
  const handleResetData = () => {
    if (
      window.confirm(
        `هل تريد بالتأكيد استعادة بيانات فصل ${selectedSection} الأصلية وخطط المواد المسجلة؟`
      )
    ) {
      resetAllDataToDefault();
      window.location.reload();
    }
  };

  const handleResetTimetable = () => {
    if (window.confirm(`هل تريد استعادة جدول الحصص الأسبوعي الرسمي لفصل ${selectedSection}؟`)) {
      const original = GRADE_TIMETABLES[selectedSection] || DEFAULT_TIMETABLE;
      setTimetable(original);
    }
  };

  // Counts for today badge
  const todayTasks = tasks.filter((t) => t.day === selectedDay && (!t.section || t.section === selectedSection));
  const todayPendingCount = todayTasks.filter((t) => !t.isDone).length;
  const todayCompletedCount = todayTasks.filter((t) => t.isDone).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar (Desktop) / Header (Mobile) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        student={student}
        selectedSection={selectedSection}
        onSelectSection={handleSelectSection}
        onOpenClassSelector={() => setIsClassSelectorOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenAddTask={() => handleOpenAddTask(selectedDay)}
        onOpenSmartPaste={() => setIsSmartPasteOpen(true)}
        onOpenTimetableModal={() => setIsTimetableModalOpen(true)}
        onOpenWeekDaysModal={() => setIsWeekDaysModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenVisitorStats={() => setIsVisitorStatsOpen(true)}
        visitorStats={visitorStats}
        onResetData={handleResetData}
        todayPendingCount={todayPendingCount}
        todayCompletedCount={todayCompletedCount}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-10 relative overflow-y-auto w-full max-w-7xl mx-auto">
        {currentTab === 'today' && (
          <TodayView
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            todayDay={todayDay}
            tasks={tasks}
            subjects={subjects}
            timetable={timetable}
            student={student}
            selectedSection={selectedSection}
            onSelectSection={handleSelectSection}
            onOpenClassSelector={() => setIsClassSelectorOpen(true)}
            onToggleDone={handleToggleDone}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTaskForDay={handleOpenAddTask}
            onOpenTimetableModal={() => setIsTimetableModalOpen(true)}
            onOpenWeekDaysModal={() => setIsWeekDaysModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenVisitorStats={() => setIsVisitorStatsOpen(true)}
            onOpenLoginModal={() => setIsWelcomeModalOpen(true)}
            visitorStats={visitorStats}
            onNavigateToTab={setCurrentTab}
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'weekly' && (
          <WeeklyPlanView
            tasks={tasks}
            subjects={subjects}
            weekTitle={weekTitle}
            currentSection={selectedSection}
            onSelectSection={handleSelectSection}
            onChangeWeekTitle={setWeekTitle}
            onToggleDone={handleToggleDone}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTaskForDay={handleOpenAddTask}
            onOpenSmartPaste={() => setIsSmartPasteOpen(true)}
            onOpenTimetableModal={() => setIsTimetableModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        )}

        {currentTab === 'timetable' && (
          <TimetableView
            timetable={timetable}
            subjects={subjects}
            currentSection={selectedSection}
            onSelectSection={handleSelectSection}
            onUpdateTimetable={setTimetable}
            onResetTimetable={handleResetTimetable}
          />
        )}
      </main>

      {/* Class Selector Modal */}
      <ClassSelectorModal
        isOpen={isClassSelectorOpen || showInitialClassPrompt}
        currentSection={selectedSection}
        onSelectSection={handleSelectSection}
        onClose={() => {
          setIsClassSelectorOpen(false);
          setShowInitialClassPrompt(false);
        }}
        isInitialSelection={showInitialClassPrompt}
      />

      {/* Modals & Popups */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        defaultDay={modalDefaultDay}
        defaultSubjectId={modalDefaultSubjectId}
        subjects={subjects}
      />

      <SmartPasteModal
        isOpen={isSmartPasteOpen}
        onClose={() => setIsSmartPasteOpen(false)}
        onImportTasks={handleImportTasks}
        subjects={subjects}
        defaultDay={selectedDay}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        student={student}
        onSave={(updated) => {
          setStudent(updated);
          if (updated.section && updated.section !== selectedSection) {
            handleSelectSection(updated.section);
          }
        }}
      />

      {/* Requested Modal 1: Quick Timetable Modal */}
      <QuickTimetableModal
        isOpen={isTimetableModalOpen}
        onClose={() => setIsTimetableModalOpen(false)}
        timetable={timetable}
        subjects={subjects}
        currentSection={selectedSection}
        onSelectSection={handleSelectSection}
        onOpenFullTimetable={() => setCurrentTab('timetable')}
      />

      {/* Requested Modal 2: All Week Days & Planner Picker Modal */}
      <WeekDaysPickerModal
        isOpen={isWeekDaysModalOpen}
        onClose={() => setIsWeekDaysModalOpen(false)}
        selectedDay={selectedDay}
        onSelectDay={(day) => {
          setSelectedDay(day);
          setCurrentTab('today');
          setIsWeekDaysModalOpen(false);
        }}
        tasks={tasks}
        subjects={subjects}
        onToggleDone={handleToggleDone}
        onEditTask={handleOpenEditTask}
        onDeleteTask={handleDeleteTask}
        onAddTaskForDay={handleOpenAddTask}
        onOpenFullWeeklyView={() => setCurrentTab('weekly')}
      />

      {/* Requested Modal 3: Weekly Plan Files Uploader Modal */}
      <UploadPlanFilesModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        subjects={subjects}
        currentWeekTitle={weekTitle}
        currentTasks={tasks}
        onApplyNewWeeklyPlan={handleApplyNewWeeklyPlan}
        savedUploadedFiles={uploadedFiles}
      />

      {/* Visitor Welcome Registration Modal (Student Name-Only Login with Remember Feature) */}
      <VisitorWelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        selectedSection={selectedSection}
        onSectionChange={handleSelectSection}
        currentStudentName={student.name}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onRegistered={(vis) => {
          if (vis.name) {
            setStudent((prev) => ({ ...prev, name: vis.name }));
          }
          setIsLoggedIn(true);
          fetchVisitorStats().then((data) => {
            if (data) setVisitorStats(data);
          });
        }}
      />

      {/* Visitor & Emails Stats Admin Modal */}
      <VisitorStatsModal
        isOpen={isVisitorStatsOpen}
        onClose={() => setIsVisitorStatsOpen(false)}
        summaryStats={visitorStats}
        onRefreshStats={() => {
          fetchVisitorStats().then((data) => {
            if (data) setVisitorStats(data);
          });
        }}
      />
    </div>
  );
}
