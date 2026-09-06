import React, { useState, useRef } from 'react';
import { DAYS_LIST } from '../data/defaultData';
import { DayOfWeek, PlanTask, Subject, TaskType, UploadedPlanFile } from '../types';
import { SubjectIcon } from './SubjectIcon';
import {
  X,
  UploadCloud,
  FileText,
  FileImage,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Calendar,
  Layers,
  FileCheck,
  History,
  AlertCircle,
} from 'lucide-react';

interface UploadPlanFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  currentWeekTitle: string;
  currentTasks: PlanTask[];
  onApplyNewWeeklyPlan: (
    newTasks: PlanTask[],
    newWeekTitle: string,
    mode: 'keep_pending_and_add' | 'replace' | 'append',
    uploadedFiles: UploadedPlanFile[]
  ) => void;
  savedUploadedFiles: UploadedPlanFile[];
}

export const UploadPlanFilesModal: React.FC<UploadPlanFilesModalProps> = ({
  isOpen,
  onClose,
  subjects,
  currentWeekTitle,
  currentTasks,
  onApplyNewWeeklyPlan,
  savedUploadedFiles,
}) => {
  const [weekTitle, setWeekTitle] = useState(() => {
    // Generate next suggested week
    if (currentWeekTitle.includes('1')) {
      return currentWeekTitle.replace('1', '2').replace('الأول', 'الثاني');
    }
    return 'خطة الأسبوع الجديد (New Weekly Plan)';
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [updateMode, setUpdateMode] = useState<'keep_pending_and_add' | 'replace' | 'append'>('keep_pending_and_add');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFilesList, setUploadedFilesList] = useState<UploadedPlanFile[]>([]);
  const [generatedTasks, setGeneratedTasks] = useState<Omit<PlanTask, 'id' | 'createdAt'>[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Previous week tasks breakdown
  const pendingLastWeekTasks = currentTasks.filter((t) => !t.isDone);
  const completedLastWeekTasks = currentTasks.filter((t) => t.isDone);

  // Handle files selection
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedPlanFile[] = [];
    const newGeneratedTasks: Omit<PlanTask, 'id' | 'createdAt'>[] = [];

    Array.from(files).forEach((file, index) => {
      const fileId = `file-${Date.now()}-${index}`;
      const fileNameLower = file.name.toLowerCase();

      // Guess subject from file name
      let guessedSubjectId = selectedSubjectId !== 'all' ? selectedSubjectId : 'math';
      if (fileNameLower.includes('math') || fileNameLower.includes('حساب') || fileNameLower.includes('رياضيات')) {
        guessedSubjectId = 'math';
      } else if (fileNameLower.includes('sci') || fileNameLower.includes('علوم') || fileNameLower.includes('discover')) {
        guessedSubjectId = 'science';
      } else if (fileNameLower.includes('fr') || fileNameLower.includes('فرنسي') || fileNameLower.includes('french')) {
        guessedSubjectId = 'french';
      } else if (fileNameLower.includes('eng') || fileNameLower.includes('انجليزي') || fileNameLower.includes('connect')) {
        guessedSubjectId = 'english';
      } else if (fileNameLower.includes('arab') || fileNameLower.includes('عربي')) {
        guessedSubjectId = 'arabic';
      } else if (fileNameLower.includes('soc') || fileNameLower.includes('دراسات')) {
        guessedSubjectId = 'social_studies';
      } else if (fileNameLower.includes('rel') || fileNameLower.includes('دين') || fileNameLower.includes('islam')) {
        guessedSubjectId = 'religion';
      } else if (fileNameLower.includes('ict') || fileNameLower.includes('comp') || fileNameLower.includes('حاسب')) {
        guessedSubjectId = 'ict';
      }

      newFiles.push({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        uploadDate: Date.now(),
        subjectId: guessedSubjectId,
        weekName: weekTitle,
      });

      // Automatically generate draft tasks for the school days (Sun - Thu) for this subject
      const schoolDays: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
      schoolDays.forEach((day, dayIndex) => {
        newGeneratedTasks.push({
          day,
          subjectId: guessedSubjectId,
          type: dayIndex % 2 === 0 ? 'classwork' : 'homework',
          title: `درس الأسبوع الجديد - ${file.name.replace(/\.[^/.]+$/, '')} (${DAYS_LIST.find((d) => d.key === day)?.shortAr})`,
          details: `تم الاستخراج من ملف: ${file.name}`,
          pages: dayIndex % 2 === 1 ? 'صفحة واجب' : undefined,
          isDone: false,
        });
      });
    });

    setUploadedFilesList((prev) => [...newFiles, ...prev]);
    setGeneratedTasks((prev) => [...newGeneratedTasks, ...prev]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveTask = (index: number) => {
    setGeneratedTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    const formatted: PlanTask[] = generatedTasks.map((t, idx) => ({
      ...t,
      id: `task-uploaded-${Date.now()}-${idx}`,
      createdAt: Date.now(),
    }));

    onApplyNewWeeklyPlan(formatted, weekTitle, updateMode, uploadedFilesList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 my-4 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <UploadCloud className="w-5 h-5 stroke-[2.25]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  رفع ملفات الـ Weekly Plan للأسبوع الجديد
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold font-sans">
                  Files Uploader
                </span>
              </div>
              <p className="text-xs text-slate-500">
                أضيفي ملفات الخطط الأسبوعية (PDF أو صور) كل يوم جمعة أو في أي وقت لتحديث مهام الأسبوع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center text-xs font-bold font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'upload' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                رفع ملفات
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'history' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                أرشيف الملفات ({savedUploadedFiles.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'upload' ? (
          <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
            {/* Week Title & Update Mode Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم / عنوان الأسبوع الجديد:
                </label>
                <input
                  type="text"
                  value={weekTitle}
                  onChange={(e) => setWeekTitle(e.target.value)}
                  placeholder="مثال: خطة الأسبوع الثاني (Block 1 - Week 2)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  طريقة تحديث الخطة:
                </label>
                <select
                  value={updateMode}
                  onChange={(e) => setUpdateMode(e.target.value as 'keep_pending_and_add' | 'replace' | 'append')}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-300 bg-white text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="keep_pending_and_add">
                    ⭐ ترحيل المهام غير المنجزة من الأسبوع الماضي + الخطة الجديدة
                  </option>
                  <option value="replace">استبدال مهام الأسبوع بالكامل (بدء أسبوع جديد)</option>
                  <option value="append">إضافة إلى كافة المهام الحالية دون حذف</option>
                </select>
              </div>
            </div>

            {/* Explanation / Preview of Carried-Over Pending Tasks */}
            {updateMode === 'keep_pending_and_add' && (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-700 stroke-[2.25]" />
                    <span className="text-xs font-black text-amber-950">
                      المهام غير المنجزة المحمولة من الأسبوع الماضي ({pendingLastWeekTasks.length} مهام)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    ستحمل علامة: مهمة قديمة ⚠️
                  </span>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed">
                  {pendingLastWeekTasks.length > 0
                    ? `سيتم الحفاظ على هذه المهام (${pendingLastWeekTasks.length}) التي لم يتم تعليمها كـ Done ونقلها معك للأسبوع الجديد مع تمييزها بعلامة "مهمة قديمة من الأسبوع الماضي" لتكمليها، بينما يتم مسح المهام التي اكتملت (${completedLastWeekTasks.length}).`
                    : 'ممتاز! لا توجد أي مهام معلقة من الأسبوع السابق، ستبدأ الخطة الجديدة بمهام الأسبوع الجديد بالكامل.'}
                </p>

                {pendingLastWeekTasks.length > 0 && (
                  <div className="mt-2 max-h-28 overflow-y-auto space-y-1.5 pe-1">
                    {pendingLastWeekTasks.map((t) => {
                      const subj = subjectMap.get(t.subjectId);
                      return (
                        <div
                          key={t.id}
                          className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs flex items-center justify-between shadow-2xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="font-bold text-slate-800 truncate">{t.title}</span>
                          </div>
                          <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono shrink-0">
                            {subj?.nameEn || t.subjectId} • {t.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Drag & Drop Zone (Per Usability Patterns: Supports drag-and-drop and manual selection) */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/70 scale-101'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <UploadCloud className="w-7 h-7 stroke-[2]" />
              </div>

              <h4 className="text-base font-black text-slate-900">
                اسحبي وأفلتي ملفات الـ Weekly Plan هنا، أو اضغطي لاختيارها من جهازك
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                يدعم ملفات الـ PDF، صور الجداول والخطط (JPG/PNG)، ومستندات Word
              </p>

              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-indigo-700 shadow-2xs font-sans">
                <span>Browse Files (اختيار الملفات)</span>
              </div>
            </div>

            {/* Uploaded Files Strip */}
            {uploadedFilesList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>الملفات التي تم إرفاقها ({uploadedFilesList.length}):</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFilesList([]);
                      setGeneratedTasks([]);
                    }}
                    className="text-rose-600 hover:underline text-[11px]"
                  >
                    مسح الكل
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {uploadedFilesList.map((file) => {
                    const sub = subjects.find((s) => s.id === file.subjectId);
                    return (
                      <div
                        key={file.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 truncate">
                            <span className="text-xs font-bold text-slate-900 truncate block">
                              {file.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-sans">
                              {Math.round(file.size / 1024)} KB • {sub?.nameEn || 'All Subjects'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                          جاهز
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Generated / Parsed Tasks Preview & Editor */}
            {generatedTasks.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>المهام الناتجة عن الملفات ({generatedTasks.length} مهمة جاهزة للجدول):</span>
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {generatedTasks.map((t, idx) => {
                    const sub = subjects.find((s) => s.id === t.subjectId);
                    const dayObj = DAYS_LIST.find((d) => d.key === t.day);
                    return (
                      <div
                        key={idx}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded-md shrink-0 font-sans">
                            {dayObj?.nameAr}
                          </span>
                          <span className="font-bold text-slate-800 shrink-0 font-sans">
                            {sub?.nameEn}
                          </span>
                          <span className="text-slate-600 truncate">{t.title}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTask(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف هذه المهمة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Archive / History Tab */
          <div className="overflow-y-auto p-6 space-y-4 flex-1">
            <h4 className="text-sm font-black text-slate-900">
              الملفات السابقة التي تم رفعها لحفظ الخطط الأسبوعية:
            </h4>

            {savedUploadedFiles.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                لا توجد ملفات سابقة محفوظة بعد. يمكنك رفع ملفات الأسبوع الجديد من تبويب "رفع ملفات".
              </div>
            ) : (
              <div className="space-y-2">
                {savedUploadedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{f.name}</span>
                        <span className="text-[11px] text-slate-400 font-sans">
                          {f.weekName || 'خطة الأسبوع'} • {new Date(f.uploadDate).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold font-sans text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Archived
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 text-right flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {generatedTasks.length > 0
              ? `سيتم تطبيق ${generatedTasks.length} مهمة على الخطة الأسبوعية`
              : 'ارفعي الملفات ليتم تجهيز وتحديث الخطة فورياً'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>

            {generatedTasks.length > 0 && (
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-2 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all font-sans"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>تطبيق وتحديث الخطة للأسبوع الجديد</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
