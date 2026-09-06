import React, { useState } from 'react';
import { DayOfWeek, GradeSection, Subject, TimetableSlot } from '../types';
import { Palette, Dumbbell, BookOpen, CheckCircle2, Circle, Sparkles, AlertCircle, ChevronDown, ChevronUp, CheckCheck, RotateCcw } from 'lucide-react';
import { SubjectIcon } from './SubjectIcon';

interface TodayPrepCardProps {
  dayNameAr: string;
  dayNameEn: string;
  section: GradeSection;
  periods: TimetableSlot[];
  subjects: Subject[];
}

export const TodayPrepCard: React.FC<TodayPrepCardProps> = ({
  dayNameAr,
  dayNameEn,
  section,
  periods,
  subjects,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Find if today has Arts or PE
  const artPeriods = periods.filter((p) => p.subjectId === 'arts');
  const pePeriods = periods.filter((p) => p.subjectId === 'pe');
  const hasArts = artPeriods.length > 0;
  const hasPe = pePeriods.length > 0;

  // Build checklist items
  const checkableItemIds: string[] = [];

  if (hasArts) {
    checkableItemIds.push('today-art-sketchbook');
    checkableItemIds.push('today-art-colors');
    checkableItemIds.push('today-art-tools');
  }

  if (hasPe) {
    checkableItemIds.push('today-pe-uniform');
    checkableItemIds.push('today-pe-water');
  }

  // Add items for scheduled subjects
  periods.forEach((slot) => {
    if (slot.subjectId !== 'arts' && slot.subjectId !== 'pe') {
      checkableItemIds.push(`today-slot-${slot.period}-${slot.subjectId}`);
    }
  });

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckAll = () => {
    const all: Record<string, boolean> = {};
    checkableItemIds.forEach((id) => {
      all[id] = true;
    });
    setCheckedItems(all);
  };

  const handleReset = () => {
    setCheckedItems({});
  };

  const totalItems = checkableItemIds.length;
  const completedItems = checkableItemIds.filter((id) => checkedItems[id]).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isAllReady = totalItems > 0 && completedItems === totalItems;

  return (
    <div
      id="today-prep-card"
      className={`rounded-3xl border-2 transition-all p-4 sm:p-5 shadow-xs ${
        hasArts
          ? 'bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/50 border-purple-200'
          : 'bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border-indigo-200/80'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200/60">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0 ${
              hasArts ? 'bg-purple-600 shadow-purple-900/20' : 'bg-indigo-600 shadow-indigo-900/20'
            }`}
          >
            {hasArts ? <Palette className="w-5 h-5 stroke-[2.25]" /> : <BookOpen className="w-5 h-5 stroke-[2.25]" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans uppercase">
                Today's Supplies Checklist
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-sans">
                فصل Grade {section}
              </span>
              {hasArts && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 flex items-center gap-1">
                  <span>🎨 حصة رسم اليوم</span>
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <span>تجهيزات ومستلزمات حقيبة اليوم ({dayNameAr})</span>
              <span className="text-xs text-slate-400 font-sans font-normal">({dayNameEn})</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl hover:bg-purple-100 text-purple-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'توسيع' : 'طي'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-3.5 space-y-3">
          {/* SPECIAL ART HIGHLIGHT IF SCHEDULED TODAY */}
          {hasArts && (
            <div className="bg-gradient-to-r from-purple-100/80 via-pink-50 to-purple-50 p-3.5 rounded-2xl border-2 border-purple-300 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-black text-sm text-purple-950">
                  <Palette className="w-4 h-4 text-purple-700" />
                  <span>مطلوبات حصة التربية الفنية والرسم اليوم:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {artPeriods.map((p) => (
                    <span
                      key={p.period}
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-purple-700 text-white shadow-2xs"
                    >
                      الحصة P{p.period} ({p.timeRange})
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-purple-800 font-medium mb-2.5 leading-relaxed">
                📌 حصة الرسم لا تتضمن واجبات منزلية في قائمة التاسكات، بل تتطلب إحضار الأدوات الفنية التالية في الحقيبة:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div
                  onClick={() => toggleItem('today-art-sketchbook')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    checkedItems['today-art-sketchbook']
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-white/90 hover:bg-white border-purple-200 text-purple-900 font-semibold'
                  }`}
                >
                  {checkedItems['today-art-sketchbook'] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                  <span className="text-xs">كراسة الرسم الفنية الكبيرة</span>
                </div>

                <div
                  onClick={() => toggleItem('today-art-colors')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    checkedItems['today-art-colors']
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-white/90 hover:bg-white border-purple-200 text-purple-900 font-semibold'
                  }`}
                >
                  {checkedItems['today-art-colors'] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                  <span className="text-xs">علبة ألوان خشب / فلوماستر</span>
                </div>

                <div
                  onClick={() => toggleItem('today-art-tools')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    checkedItems['today-art-tools']
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-white/90 hover:bg-white border-purple-200 text-purple-900 font-semibold'
                  }`}
                >
                  {checkedItems['today-art-tools'] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                  <span className="text-xs">مسطرة الأشكال، رصاص وممحاة</span>
                </div>
              </div>
            </div>
          )}

          {/* PE HIGHLIGHT IF SCHEDULED TODAY */}
          {hasPe && (
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs font-bold text-emerald-950">
                  حصة التربية الرياضية (PE) اليوم:
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  {pePeriods.map((p) => `P${p.period}`).join(', ')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  onClick={() => toggleItem('today-pe-uniform')}
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                    checkedItems['today-pe-uniform']
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-white text-emerald-900 border-emerald-300 font-medium'
                  }`}
                >
                  {checkedItems['today-pe-uniform'] ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span>الزي الرياضي والحذاء</span>
                </div>

                <div
                  onClick={() => toggleItem('today-pe-water')}
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                    checkedItems['today-pe-water']
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-white text-emerald-900 border-emerald-300 font-medium'
                  }`}
                >
                  {checkedItems['today-pe-water'] ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span>زجاجة ماء إضافية</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Progress Bar & Action Buttons */}
          <div className="bg-white/80 p-2.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>جاهزية حقيبة اليوم:</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {completedItems} / {totalItems} ({progressPercent}%)
              </span>
              {isAllReady && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                  الحقيبة جاهزة تماماً ✅
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCheckAll}
                className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>تحديد الكل جاهز</span>
              </button>
              {completedItems > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
