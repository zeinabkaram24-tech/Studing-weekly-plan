import React from 'react';
import { DAYS_LIST } from '../data/defaultData';
import { DayOfWeek, PlanTask, Subject } from '../types';
import { TaskCard } from './TaskCard';
import { X, Calendar, Plus, ExternalLink, CheckCheck } from 'lucide-react';

interface WeekDaysPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  tasks: PlanTask[];
  subjects: Subject[];
  onToggleDone: (taskId: string) => void;
  onEditTask: (task: PlanTask) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTaskForDay: (day: DayOfWeek) => void;
  onOpenFullWeeklyView: () => void;
}

export const WeekDaysPickerModal: React.FC<WeekDaysPickerModalProps> = ({
  isOpen,
  onClose,
  selectedDay,
  onSelectDay,
  tasks,
  subjects,
  onToggleDone,
  onEditTask,
  onDeleteTask,
  onAddTaskForDay,
  onOpenFullWeeklyView,
}) => {
  if (!isOpen) return null;

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.isDone).length;

  const handleSelectAndOpen = (dayKey: DayOfWeek) => {
    onSelectDay(dayKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-100 my-4 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  جميع أيام الأسبوع والمخطط الأسبوعي
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold font-sans">
                  Weekly Planner
                </span>
              </div>
              <p className="text-xs text-slate-500">
                اختر اليوم للعمل عليه أو راجع المهام المقررة لكل أيام الأسبوع (Done: {doneTasks}/{totalTasks})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullWeeklyView();
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-1 font-sans"
            >
              <span>فتح المخطط الكامل</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Selector Quick Strip */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0">انتقال سريع لليوم:</span>
          {DAYS_LIST.map((day) => {
            const dayTasks = tasks.filter((t) => t.day === day.key);
            const isDoneAll = dayTasks.length > 0 && dayTasks.every((t) => t.isDone);
            const isSelected = selectedDay === day.key;

            return (
              <button
                key={day.key}
                type="button"
                id={`modal-quick-day-${day.key}`}
                onClick={() => handleSelectAndOpen(day.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                    : isDoneAll
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
                title={`الذهاب مباشرة ليوم ${day.nameAr}`}
              >
                <span>{day.nameAr}</span>
                <span className="text-[10px] opacity-80 font-mono">({dayTasks.length})</span>
                {isDoneAll && <CheckCheck className="w-3 h-3 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* Days & Plans Grid */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 bg-slate-50/40">
          {DAYS_LIST.map((day) => {
            const dayTasks = tasks.filter((t) => t.day === day.key);
            const isSelected = selectedDay === day.key;
            const completedCount = dayTasks.filter((t) => t.isDone).length;

            if (!day.isSchoolDay && dayTasks.length === 0) {
              return null;
            }

            return (
              <div
                key={day.key}
                id={`modal-day-section-${day.key}`}
                className={`rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-white border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
                    : 'bg-white border-slate-200/90'
                }`}
              >
                {/* Day Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectAndOpen(day.key)}
                      className="text-right group"
                      title={`الذهاب مباشرة ليوم ${day.nameAr}`}
                    >
                      <span className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {day.nameAr}
                      </span>
                      <span className="text-xs text-slate-400 font-sans ms-2">({day.nameEn})</span>
                    </button>
                    {day.isSchoolDay ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-sans font-medium">
                        School Day
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-sans font-medium">
                        Weekend
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-sans text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {completedCount}/{dayTasks.length} Done
                    </span>
                    <button
                      type="button"
                      onClick={() => onAddTaskForDay(day.key)}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                      title={`إضافة مهمة ليوم ${day.nameAr}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAndOpen(day.key)}
                      className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 transition-colors"
                      title={`فتح يوم ${day.nameAr} في الشاشة الرئيسية`}
                    >
                      الذهاب لليوم ↵
                    </button>
                  </div>
                </div>

                {/* Day Tasks */}
                <div className="p-4">
                  {dayTasks.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      لا توجد مهام مسجلة لهذا اليوم حتى الآن.
                      <button
                        type="button"
                        onClick={() => onAddTaskForDay(day.key)}
                        className="text-indigo-600 font-bold ms-1 hover:underline"
                      >
                        + إضافة مهمة
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dayTasks.map((task) => {
                        const subj = subjectMap.get(task.subjectId);
                        return (
                          <TaskCard
                            key={task.id}
                            task={task}
                            subject={subj}
                            onToggleDone={onToggleDone}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            compact
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-right flex items-center justify-between">
          <span className="text-xs text-slate-500">
            يمكنك الضغط على أي يوم للتنقل إليه وبدء العمل على مهامه
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
