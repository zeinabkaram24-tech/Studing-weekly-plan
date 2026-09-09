import { GRADE_TIMETABLES } from '../data/defaultData';
import { GradeSection, PlanTask, TaskType, Timetable } from '../types';

const SECTIONS: GradeSection[] = ['2A', '2B', '2C'];

function hasHomeworkMarker(task: PlanTask): boolean {
  const text = [task.title, task.details, task.notes, task.pages]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return /homework|home work|واجب|منزلي|منزلية|hw\b/.test(text);
}

function getPeriodsForTask(task: PlanTask, timetable: Timetable): number[] {
  return (timetable[task.day] || [])
    .filter((slot) => slot.subjectId === task.subjectId)
    .map((slot) => slot.period);
}

function getAllSubjectPeriods(subjectId: string, timetable: Timetable): number[] {
  return Object.values(timetable)
    .flat()
    .filter((slot) => slot.subjectId === subjectId)
    .map((slot) => slot.period);
}

/**
 * Builds official tasks per class from one admin-uploaded weekly plan.
 * A task belongs to a class when that class timetable has the same subject
 * on the task's day. The timetable supplies the period, so the task appears
 * in the correct classwork slot rather than being copied to every class.
 */
export function mapWeeklyPlanTasksToSections(
  tasks: PlanTask[],
  targetSection: 'all' | GradeSection = 'all',
): Record<GradeSection, PlanTask[]> {
  const sections = targetSection === 'all' ? SECTIONS : [targetSection];
  const result: Record<GradeSection, PlanTask[]> = { '2A': [], '2B': [], '2C': [] };

  tasks.forEach((task, taskIndex) => {
    const isHomework = hasHomeworkMarker(task);
    const matchingSections = sections.filter((section) => {
      const timetable = GRADE_TIMETABLES[section];
      // Classwork must match the lesson on that exact day. Homework belongs
      // to every class that studies the subject, even when it is assigned on
      // a day where that class has no lesson for the subject.
      return isHomework
        ? getAllSubjectPeriods(task.subjectId, timetable).length > 0
        : getPeriodsForTask(task, timetable).length > 0;
    });

    // Keep explicitly section-targeted tasks in that section even if the
    // uploaded plan contains a day/subject that is not present in the table.
    const fallbackSections = task.section && sections.includes(task.section)
      ? [task.section]
      : matchingSections;

    fallbackSections.forEach((section) => {
      const timetable = GRADE_TIMETABLES[section];
      const dayPeriods = getPeriodsForTask(task, timetable);
      const periods = dayPeriods.length > 0 ? dayPeriods : getAllSubjectPeriods(task.subjectId, timetable);
      const resolvedType: TaskType = isHomework ? task.type : 'classwork';
      const idSuffix = periods.length > 0 ? periods.join('-') : 'unmapped';
      result[section].push({
        ...task,
        id: `${task.id || `uploaded-${taskIndex}`}-${section}-${idSuffix}`,
        section,
        period: task.period || dayPeriods[0],
        type: resolvedType,
        isDone: false,
        createdAt: task.createdAt || Date.now(),
      });
    });
  });

  return result;
}

export function removeDuplicateSectionTasks(tasks: PlanTask[]): PlanTask[] {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    const key = [task.day, task.subjectId, task.period || '', task.type, task.title, task.pages || ''].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export { hasHomeworkMarker };
