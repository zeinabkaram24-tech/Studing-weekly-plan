import React, { useState } from 'react';
import { DAYS_LIST } from '../data/defaultData';
import { DayOfWeek, PlanTask, Subject, TaskType } from '../types';
import { X, Sparkles, Check } from 'lucide-react';

interface SmartPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTasks: (tasks: Omit<PlanTask, 'id' | 'createdAt'>[]) => void;
  subjects: Subject[];
  defaultDay: DayOfWeek;
}

export const SmartPasteModal: React.FC<SmartPasteModalProps> = ({
  isOpen,
  onClose,
  onImportTasks,
  subjects,
  defaultDay,
}) => {
  const [inputText, setInputText] = useState('');
  const [targetDay, setTargetDay] = useState<DayOfWeek>(defaultDay);
  const [parsedPreview, setParsedPreview] = useState<Omit<PlanTask, 'id' | 'createdAt'>[]>([]);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!inputText.trim()) return;
    const lines = inputText.split('\n').map((l) => l.trim()).filter(Boolean);
    const newTasks: Omit<PlanTask, 'id' | 'createdAt'>[] = [];
    let currentDay = targetDay;

    for (const line of lines) {
      const lower = line.toLowerCase();
      // Detect day in Arabic or English
      if (lower.includes('الأحد') || lower.includes('sunday')) currentDay = 'sunday';
      else if (lower.includes('الإثنين') || lower.includes('الاثنين') || lower.includes('monday')) currentDay = 'monday';
      else if (lower.includes('الثلاثاء') || lower.includes('tuesday')) currentDay = 'tuesday';
      else if (lower.includes('الأربعاء') || lower.includes('الاربعاء') || lower.includes('wednesday')) currentDay = 'wednesday';
      else if (lower.includes('الخميس') || lower.includes('thursday')) currentDay = 'thursday';

      // Match Subject
      let matchedSubject = subjects.find((s) => s.id === 'math');
      let taskType: TaskType = 'homework';

      if (lower.includes('math') || lower.includes('رياضيات') || lower.includes('حساب')) {
        matchedSubject = subjects.find((s) => s.id === 'math');
      } else if (lower.includes('english') || lower.includes('انجليزي') || lower.includes('إنجليزي') || lower.includes('connect')) {
        matchedSubject = subjects.find((s) => s.id === 'english');
      } else if (lower.includes('science') || lower.includes('علوم') || lower.includes('discover')) {
        matchedSubject = subjects.find((s) => s.id === 'science');
      } else if (lower.includes('français') || lower.includes('francais') || lower.includes('french') || lower.includes('فرنساوي') || lower.includes('فرنسي')) {
        matchedSubject = subjects.find((s) => s.id === 'french');
      } else if (lower.includes('arabic') || lower.includes('عربي') || lower.includes('لغة عربية')) {
        matchedSubject = subjects.find((s) => s.id === 'arabic');
      } else if (lower.includes('social') || lower.includes('دراسات')) {
        matchedSubject = subjects.find((s) => s.id === 'social_studies');
      } else if (lower.includes('دين') || lower.includes('religion') || lower.includes('تربية دينية') || lower.includes('islamic')) {
        matchedSubject = subjects.find((s) => s.id === 'religion');
      } else if (lower.includes('ict') || lower.includes('computer') || lower.includes('حاسب') || lower.includes('تكنولوجيا')) {
        matchedSubject = subjects.find((s) => s.id === 'ict');
      } else if (lower.includes('art') || lower.includes('رسم') || lower.includes('فنية')) {
        matchedSubject = subjects.find((s) => s.id === 'arts');
      } else if (lower.includes('music') || lower.includes('موسيقى')) {
        matchedSubject = subjects.find((s) => s.id === 'music');
      } else if (lower.includes('pe') || lower.includes('رياضة') || lower.includes('بدنية')) {
        matchedSubject = subjects.find((s) => s.id === 'pe');
      }

      // Check task type
      if (lower.includes('إملاء') || lower.includes('املاء') || lower.includes('spelling') || lower.includes('dictation')) {
        taskType = 'dictation';
      } else if (lower.includes('مذاكرة') || lower.includes('حفظ') || lower.includes('study') || lower.includes('قراءة')) {
        taskType = 'study';
      } else if (lower.includes('كويز') || lower.includes('امتحان') || lower.includes('quiz') || lower.includes('test')) {
        taskType = 'quiz';
      } else if (lower.includes('أدوات') || lower.includes('احضار') || lower.includes('supplies') || lower.includes('white board')) {
        taskType = 'supplies';
      } else if (lower.includes('classwork') || lower.includes('شرح') || lower.includes('داخل الفصل') || lower.includes('fiche de classe')) {
        taskType = 'classwork';
      }

      // Extract pages
      const pageMatch = line.match(/(?:p\.|page|صفحة|ص|pages)\s*([0-9\u0660-\u0669]+(?:\s*[-–toإلى]\s*[0-9\u0660-\u0669]+)?)/i);
      const pages = pageMatch ? pageMatch[0] : undefined;

      // Clean Title
      let title = line;
      if (line.includes(':')) {
        const parts = line.split(':');
        title = parts.slice(1).join(':').trim();
      } else if (line.includes('-')) {
        const parts = line.split('-');
        if (parts.length > 1 && parts[0].length < 20) {
          title = parts.slice(1).join('-').trim();
        }
      }

      if (title.length > 2 && !title.startsWith('الخطة') && !title.startsWith('Weekly Plan')) {
        newTasks.push({
          day: currentDay,
          subjectId: matchedSubject?.id || 'math',
          type: taskType,
          title: title.slice(0, 90),
          details: line,
          pages,
          isDone: false,
        });
      }
    }
    setParsedPreview(newTasks);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length > 0) {
      onImportTasks(parsedPreview);
      onClose();
    }
  };

  const sampleTemplate = `Sunday:
English: Connect Plus Unit 1 - Welcome reading
Arabic: درس عائلتي - قراءة ص 15
Monday:
Social Studies: مدرستي الجميلة - نشاط 1
Religion: قراءة سورة الفلق
Tuesday:
ICT: Parts of the computer - Mouse & Keyboard
English: Spelling words (cat, mat, bat)
Wednesday:
Arabic: واجب ص 18 تدريب 1 و 2`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                لصق ذكي للخطة الأسبوعية (Smart Paste)
              </h3>
              <p className="text-xs text-slate-500">
                انسخ رسائل المدرسة أو الواتساب هنا ليتم استخراج خطط المواد تلقائياً
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                نص رسالة الخطة الأسبوعية:
              </label>
              <button
                type="button"
                onClick={() => setInputText(sampleTemplate)}
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                تجربة نص توضيحي
              </button>
            </div>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="الصق نص الخطة الأسبوعية هنا (مثلاً: English: Unit 2 p. 14 / واجب عربي ص 20)..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-medium text-slate-900 leading-relaxed font-mono"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">اليوم الافتراضي:</span>
              <select
                value={targetDay}
                onChange={(e) => setTargetDay(e.target.value as DayOfWeek)}
                className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
              >
                {DAYS_LIST.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.nameAr} ({d.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleParse}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs transition-all flex items-center gap-1.5 font-sans"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تحليل النص واستخراج المهام</span>
            </button>
          </div>

          {/* Preview Parsed Tasks */}
          {parsedPreview.length > 0 && (
            <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-2 max-h-56 overflow-y-auto">
              <div className="text-xs font-bold text-purple-900 flex items-center justify-between">
                <span>تم التعرف على ({parsedPreview.length}) مهام:</span>
              </div>
              <div className="space-y-1.5">
                {parsedPreview.map((pt, idx) => {
                  const sub = subjects.find((s) => s.id === pt.subjectId);
                  const dayObj = DAYS_LIST.find((d) => d.key === pt.day);
                  return (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded-xl border border-purple-100 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-purple-700 px-1.5 py-0.5 bg-purple-100 rounded-md text-[10px]">
                          {dayObj?.nameAr}
                        </span>
                        <span className="font-bold text-slate-800 truncate font-sans">{sub?.nameEn}</span>
                        <span className="text-slate-600 truncate">{pt.title}</span>
                      </div>
                      {pt.pages && (
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{pt.pages}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            {parsedPreview.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-6 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all font-sans"
              >
                <Check className="w-3.5 h-3.5" />
                <span>إضافة ({parsedPreview.length}) مهام إلى الخطة</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
