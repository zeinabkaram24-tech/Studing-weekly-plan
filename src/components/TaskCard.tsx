import React from 'react';
import { PlanTask, Subject } from '../types';
import { SubjectIcon } from './SubjectIcon';
import { TaskTypeBadge } from './SubjectBadge';
import { playChimeSound, triggerTaskDoneConfetti } from '../utils/celebration';
import { Edit3, Trash2, BookOpen, Clock, Check, Circle, History } from 'lucide-react';

interface TaskCardProps {
  task: PlanTask;
  subject?: Subject;
  onToggleDone: (taskId: string) => void;
  onEdit: (task: PlanTask) => void;
  onDelete: (taskId: string) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  subject,
  onToggleDone,
  onEdit,
  onDelete,
  compact = false,
}) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !task.isDone;
    if (nextState) {
      triggerTaskDoneConfetti();
      playChimeSound(true);
    } else {
      playChimeSound(false);
    }
    onToggleDone(task.id);
  };

  const iconBg = subject?.color.lightBg || 'bg-indigo-50';
  const iconColor = subject?.color.text || 'text-indigo-600';
  const borderColor = subject?.color.border || 'border-slate-100';

  return (
    <div
      id={`task-card-${task.id}`}
      className={`relative rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-xs ${
        compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'
      } ${
        task.isDone
          ? 'bg-emerald-50/30 border-emerald-300 hover:border-emerald-400'
          : task.isCarriedOver
          ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400 ring-1 ring-amber-200'
          : 'bg-white border-slate-200 hover:border-indigo-300'
      }`}
    >
      {/* Subject Icon & Task Details */}
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
        <div
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 border ${iconBg} ${iconColor} ${borderColor} shadow-2xs group-hover:scale-105 transition-transform`}
        >
          <SubjectIcon name={subject?.iconName || 'BookOpen'} className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            {subject && (
              <span className="text-[12px] font-bold text-slate-800 font-sans">
                {subject.nameEn}
                <span className="text-slate-400 font-normal ms-1 font-sans">({subject.nameAr})</span>
              </span>
            )}
            {task.period !== undefined && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-sans">
                <span>الحصة {task.period}</span>
                <span className="text-indigo-500 text-[10px] font-mono">P{task.period}</span>
              </span>
            )}
            <TaskTypeBadge type={task.type} />
            {task.isCarriedOver ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-sans shadow-2xs">
                <History className="w-3 h-3 text-amber-700 stroke-[2.5]" />
                <span>مهمة قديمة (الأسبوع الماضي) ⚠️</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans">
                <span>جديد 🆕</span>
              </span>
            )}
            {task.pages && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono font-medium">
                <BookOpen className="w-3 h-3 text-slate-400" />
                <span>{task.pages}</span>
              </span>
            )}
          </div>

          <h3
            className={`font-bold text-sm sm:text-base leading-snug transition-colors ${
              task.isDone
                ? 'text-slate-500 line-through decoration-emerald-500/70'
                : 'text-slate-900'
            }`}
          >
            {task.title}
          </h3>

          {task.details && (
            <p
              className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                task.isDone ? 'line-through text-slate-400' : 'text-slate-600'
              }`}
            >
              {task.details}
            </p>
          )}

          {task.isDone && task.completedAt && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-mono font-medium">
              <Clock className="w-3 h-3" />
              <span>
                Done at {new Date(task.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls & Done in English */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <div className="flex items-center gap-1">
          <button
            type="button"
            id={`edit-task-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="تعديل المهمة"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            id={`delete-task-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="حذف المهمة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* English "Done" button per user requirement */}
        <button
          type="button"
          id={`toggle-task-${task.id}`}
          onClick={handleToggle}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-sans flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-2xs ${
            task.isDone
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600'
              : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-700 border border-slate-300'
          }`}
          title={task.isDone ? 'Mark as Not Done' : 'Mark as Done'}
          aria-label={task.isDone ? 'Done' : 'Mark as Done'}
        >
          {task.isDone ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Circle className="w-3.5 h-3.5 text-slate-400" />
              <span>Mark Done</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
