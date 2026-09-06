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
  WeeklyPlanArchiveEntry,
  loadWeeklyPlansArchive,
  saveWeeklyPlansArchive,
  getActiveWeeklyPlanId,
  setActiveWeeklyPlanId,
  addOrUpdateWeeklyPlanInArchive,
  deleteWeeklyPlanFromArchive,
  isAdminLoggedIn,
  setAdminLoggedIn,
  clearAdminLogin,
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
import { WeeklyPlanArchiveModal } from './components/WeeklyPlanArchiveModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { VisitorWelcomeModal } from './components/VisitorWelcomeModal';
import { VisitorStatsModal } from './components/VisitorStatsModal';
import { ClassSelectorModal } from './components/ClassSelectorModal';
import { triggerAllDoneCelebration } from './utils/celebration';
import {
  fetchVisitorStats,
  pingVisitorSession,
  registerGuestVisitor,
  getStoredVisitorName,
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

  // Admin & Security State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminLoggedIn());
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminReason, setAdminReason] = useState<{ title: string; message: string } | undefined>();

  // Weekly Plan Archive & Memory State
  const [archive, setArchive] = useState<WeeklyPlanArchiveEntry[]>(() => loadWeeklyPlansArchive());
  const [activePlanId, setActivePlanIdState] = useState<string>(() => getActiveWeeklyPlanId());
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Active Plan Metadata
  const activePlan = archive.find((p) => p.id === activePlanId) || archive[0];
  const activeBlockNumber = activePlan?.blockNumber || 1;
  const activeWeekNumber = activePlan?.weekNumber || 1;

  const [tasks, setTasks] = useState<PlanTask[]>(() => {
    const savedSec = loadSavedGradeSection() || '2A';
    const initialArchive = loadWeeklyPlansArchive();
    const activeId = getActiveWeeklyPlanId();
    const current = initialArchive.find((p) => p.id === activeId) || initialArchive[0];
    if (current?.tasksBySection?.[savedSec] && current.tasksBySection[savedSec].length > 0) {
      return current.tasksBySection[savedSec];
    }
    return loadSavedTasks(savedSec);
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
  const [weekTitle, setWeekTitle] = useState<string>(() => {
    const initialArchive = loadWeeklyPlansArchive();
    const activeId = getActiveWeeklyPlanId();
    const current = initialArchive.find((p) => p.id === activeId) || initialArchive[0];
    return current?.title || loadWeekTitle();
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPlanFile[]>(() => {
    const initialArchive = loadWeeklyPlansArchive();
    const activeId = getActiveWeeklyPlanId();
    const current = initialArchive.find((p) => p.id === activeId) || initialArchive[0];
    if (current?.uploadedFiles && current.uploadedFiles.length > 0) {
      return current.uploadedFiles;
    }
    return loadSavedUploadedFiles();
  });

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
    const storedName = getStoredVisitorName();
    const activeStudentName = savedStudentName || storedName;

    if (activeStudentName && isRemembered) {
      // Student is remembered on this browser: ping session and do not show welcome prompt
      pingVisitorSession(activeStudentName, selectedSection);
      setStudent((prev) => ({
        ...prev,
        name: activeStudentName,
      }));
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      // Automatically register guest visitor session so admin dashboard accurately counts everyone who opens the app
      registerGuestVisitor(selectedSection);
      const timer = setTimeout(() => {
        setIsWelcomeModalOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedSection]);

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

  // Admin actions
  const handleAdminSuccess = () => {
    setIsAdmin(true);
    setAdminLoggedIn(true);
    setIsAdminAuthModalOpen(false);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    clearAdminLogin();
  };

  const handleOpenAdminLogin = (title?: string, message?: string) => {
    setAdminReason(title ? { title, message: message || '' } : undefined);
    setIsAdminAuthModalOpen(true);
  };

  // Sync tasks to active plan in archive
  const syncTasksWithActivePlan = (updatedTasks: PlanTask[], targetSec: GradeSection = selectedSection) => {
    setArchive((prevArchive) => {
      const next = prevArchive.map((plan) => {
        if (plan.id === activePlanId) {
          return {
            ...plan,
            tasksBySection: {
              ...plan.tasksBySection,
              [targetSec]: updatedTasks,
            },
          };
        }
        return plan;
      });
      saveWeeklyPlansArchive(next);
      return next;
    });
  };

  // Switching & Navigating Archives
  const handleSelectPlan = (planId: string) => {
    const selected = archive.find((p) => p.id === planId);
    if (!selected) return;
    setActivePlanIdState(planId);
    setActiveWeeklyPlanId(planId);
    setWeekTitle(selected.title);
    const secTasks = selected.tasksBySection?.[selectedSection] || [];
    setTasks(secTasks);
    saveTasks(secTasks, selectedSection);
    if (selected.uploadedFiles && selected.uploadedFiles.length > 0) {
      setUploadedFiles(selected.uploadedFiles);
    }
  };

  const handleSetPlanAsCurrent = (planId: string) => {
    const updated = archive.map((p) => ({
      ...p,
      isCurrent: p.id === planId,
    }));
    saveWeeklyPlansArchive(updated);
    setArchive(updated);
    handleSelectPlan(planId);
  };

  const handleDeletePlan = (planId: string) => {
    const updated = deleteWeeklyPlanFromArchive(planId);
    setArchive(updated);
    if (activePlanId === planId) {
      const fallback = updated[0];
      if (fallback) {
        handleSelectPlan(fallback.id);
      }
    }
  };

  // Section switcher handler
  const handleSelectSection = (newSection: GradeSection) => {
    // Save current section tasks first
    saveTasks(tasks, selectedSection);
    syncTasksWithActivePlan(tasks, selectedSection);

    setSelectedSection(newSection);
    saveGradeSection(newSection);
    setStudent((prev) => ({
      ...prev,
      section: newSection,
      grade: `Grade ${newSection}`,
    }));
    const loadedTimetable = loadSavedTimetable(newSection);
    setTimetable(loadedTimetable);

    // Retrieve tasks for new section from active plan if present
    const currActive = archive.find((p) => p.id === activePlanId) || archive[0];
    if (currActive?.tasksBySection?.[newSection] && currActive.tasksBySection[newSection].length > 0) {
      setTasks(currActive.tasksBySection[newSection]);
      saveTasks(currActive.tasksBySection[newSection], newSection);
    } else {
      const loadedTasks = loadSavedTasks(newSection);
      setTasks(loadedTasks);
    }
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

      syncTasksWithActivePlan(updated);

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
      setTasks((prev) => {
        const updated = prev.map((t) =>
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
        );
        syncTasksWithActivePlan(updated);
        return updated;
      });
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
      setTasks((prev) => {
        const updated = [newTask, ...prev];
        syncTasksWithActivePlan(updated);
        return updated;
      });
    }
  };

  // Handler: Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      syncTasksWithActivePlan(updated);
      return updated;
    });
  };

  // Handler: Import Parsed Tasks from Smart Paste
  const handleImportTasks = (newTasksList: Omit<PlanTask, 'id' | 'createdAt'>[]) => {
    const formatted: PlanTask[] = newTasksList.map((item, index) => ({
      ...item,
      section: item.section || selectedSection,
      id: `task-imported-${Date.now()}-${index}`,
      createdAt: Date.now(),
    }));
    setTasks((prev) => {
      const updated = [...formatted, ...prev];
      syncTasksWithActivePlan(updated);
      return updated;
    });
  };

  // Handler: Apply New Weekly Plan from Uploaded Files (Admin Friday Workflow)
  const handleApplyNewWeeklyPlan = (
    newTasks: PlanTask[],
    newWeekTitle: string,
    mode: 'keep_pending_and_add' | 'replace' | 'append',
    newFiles: UploadedPlanFile[],
    blockNumber: number,
    weekNumber: number,
    targetSection: 'all' | GradeSection,
    setAsCurrent: boolean
  ) => {
    let finalSectionTasks: PlanTask[] = [];
    if (mode === 'keep_pending_and_add') {
      const carriedOverPendingTasks: PlanTask[] = tasks
        .filter((t) => !t.isDone)
        .map((t) => ({
          ...t,
          isCarriedOver: true,
          previousWeekNote: 'مهمة متبقية من الأسبوع الماضي لم تُنجز',
        }));
      finalSectionTasks = [...carriedOverPendingTasks, ...newTasks];
    } else if (mode === 'replace') {
      finalSectionTasks = newTasks;
    } else {
      finalSectionTasks = [...tasks, ...newTasks];
    }

    const newPlanId = `plan-b${blockNumber}-w${weekNumber}-${Date.now()}`;
    const newEntry: WeeklyPlanArchiveEntry = {
      id: newPlanId,
      blockNumber,
      weekNumber,
      title: newWeekTitle,
      createdAt: Date.now(),
      isCurrent: setAsCurrent,
      uploadedFiles: newFiles,
      tasksBySection: {
        '2A': targetSection === 'all' || targetSection === '2A' ? finalSectionTasks : (activePlan?.tasksBySection?.['2A'] || []),
        '2B': targetSection === 'all' || targetSection === '2B' ? finalSectionTasks : (activePlan?.tasksBySection?.['2B'] || []),
        '2C': targetSection === 'all' || targetSection === '2C' ? finalSectionTasks : (activePlan?.tasksBySection?.['2C'] || []),
      },
    };

    const updatedArchive = addOrUpdateWeeklyPlanInArchive(newEntry);
    setArchive(updatedArchive);

    if (setAsCurrent) {
      setActiveWeeklyPlanId(newPlanId);
      setActivePlanIdState(newPlanId);
      setWeekTitle(newWeekTitle);
      setTasks(finalSectionTasks);
      saveTasks(finalSectionTasks, selectedSection);
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
        onOpenArchiveModal={() => setIsArchiveModalOpen(true)}
        isAdmin={isAdmin}
        onOpenAdminLogin={() =>
          handleOpenAdminLogin(
            'تسجيل دخول الأدمن',
            'رفع ملفات الخطة وتعديل الجداول مقتصر على الأدمن فقط'
          )
        }
        activeBlockNumber={activeBlockNumber}
        activeWeekNumber={activeWeekNumber}
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
            onToggleDone={handleToggleDone}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTaskForDay={handleOpenAddTask}
            onOpenTimetableModal={() => setIsTimetableModalOpen(true)}
            onOpenWeekDaysModal={() => setIsWeekDaysModalOpen(true)}
            onOpenArchiveModal={() => setIsArchiveModalOpen(true)}
            activeBlockNumber={activeBlockNumber}
            activeWeekNumber={activeWeekNumber}
            activePlanTitle={activePlan?.title || weekTitle}
          />
        )}

        {currentTab === 'weekly' && (
          <WeeklyPlanView
            tasks={tasks}
            subjects={subjects}
            weekTitle={weekTitle}
            currentSection={selectedSection}
            onChangeWeekTitle={setWeekTitle}
            onToggleDone={handleToggleDone}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTaskForDay={handleOpenAddTask}
            onOpenSmartPaste={() => setIsSmartPasteOpen(true)}
            onOpenTimetableModal={() => setIsTimetableModalOpen(true)}
            onOpenArchiveModal={() => setIsArchiveModalOpen(true)}
            activeBlockNumber={activeBlockNumber}
            activeWeekNumber={activeWeekNumber}
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
            isAdmin={isAdmin}
            onOpenAdminLogin={() =>
              handleOpenAdminLogin(
                'تعديل الجدول الدراسي',
                'تعديل وتخصيص حصص الجدول الدراسي مقتصر على الأدمن فقط'
              )
            }
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

      {/* Requested Modal 3: Weekly Plan Files Uploader Modal (Admin Protected) */}
      <UploadPlanFilesModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        subjects={subjects}
        currentWeekTitle={weekTitle}
        currentTasks={tasks}
        isAdmin={isAdmin}
        onAdminUnlock={() =>
          handleOpenAdminLogin(
            'صلاحية رفع ملفات الخطة الأسبوعية',
            'إضافة ملفات الـ Weekly Plan مقتصر على المشرف (الأدمن) فقط'
          )
        }
        onApplyNewWeeklyPlan={handleApplyNewWeeklyPlan}
        savedUploadedFiles={uploadedFiles}
        suggestedBlock={activeBlockNumber}
        suggestedWeek={activeWeekNumber + 1}
      />

      {/* User Requested: Memory & Archive Modal for Blocks and Weeks */}
      <WeeklyPlanArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        archive={archive}
        activePlanId={activePlanId}
        currentSection={selectedSection}
        isAdmin={isAdmin}
        onSelectPlan={(planId) => {
          handleSelectPlan(planId);
          setIsArchiveModalOpen(false);
        }}
        onSetAsCurrent={(planId) => {
          handleSetPlanAsCurrent(planId);
        }}
        onDeletePlan={(planId) => {
          handleDeletePlan(planId);
        }}
        onOpenUploadNewPlan={() => {
          setIsArchiveModalOpen(false);
          setIsUploadModalOpen(true);
        }}
        onOpenAdminLogin={() => {
          handleOpenAdminLogin(
            'صلاحية إدارة الأرشيف',
            'إضافة الخطط وتعيين الأسبوع النشط مقتصر على الأدمن'
          )
        }}
      />

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminSuccess}
        reasonTitle={adminReason?.title}
        reasonMessage={adminReason?.message}
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
