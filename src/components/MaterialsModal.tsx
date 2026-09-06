import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  FileText,
  BookOpen,
  Layers,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  Search,
  Check,
  Copy,
  X,
  Sparkles,
  Calendar,
  AlertCircle,
  GraduationCap,
  FileDown,
  Clock,
  Filter,
  Eye,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { MaterialItem, Subject, GradeSection } from '../types';
import { DEFAULT_SUBJECTS } from '../data/defaultData';
import { SubjectIcon } from './SubjectIcon';
import {
  getSavedMaterials,
  addMaterialItem,
  deleteMaterialItem,
  resetToDefaultMaterials,
} from '../utils/materialsStorage';

interface MaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects?: Subject[];
  currentSection?: GradeSection;
  isAdmin?: boolean;
}

type TabCategory = 'main_sheets' | 'week1' | 'week2' | 'week3' | 'all';

export const MaterialsModal: React.FC<MaterialsModalProps> = ({
  isOpen,
  onClose,
  subjects = DEFAULT_SUBJECTS,
  currentSection,
  isAdmin = false,
}) => {
  // Filter out religion completely as requested
  const activeSubjects = subjects.filter((s) => s.id !== 'religion');

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<TabCategory>('main_sheets');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In-app sheet content viewer
  const [viewingSheet, setViewingSheet] = useState<MaterialItem | null>(null);
  const [solvedExercises, setSolvedExercises] = useState<Record<string, boolean>>({});

  // Add material dialog state
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubjectId, setNewSubjectId] = useState<string>('science');
  const [newCategory, setNewCategory] = useState<string>('week1');
  const [newBlock, setNewBlock] = useState<number>(1);
  const [newItemType, setNewItemType] = useState<MaterialItem['itemType']>('sheet');
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileUrl, setNewFileUrl] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newSection, setNewSection] = useState<'all' | GradeSection>('all');

  // Load materials on open
  useEffect(() => {
    if (isOpen) {
      setMaterials(getSavedMaterials());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Add Item
  const handleAddNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let categoryLabel = 'الشيتات الرئيسية';
    if (newCategory === 'week1') categoryLabel = 'ويك 1';
    else if (newCategory === 'week2') categoryLabel = 'ويك 2';
    else if (newCategory === 'week3') categoryLabel = 'ويك 3';

    const added = addMaterialItem({
      title: newTitle.trim(),
      subjectId: newSubjectId,
      blockNumber: newBlock,
      category: newCategory,
      categoryLabel,
      itemType: newItemType,
      fileName: newFileName.trim() || undefined,
      fileUrl: newFileUrl.trim() || undefined,
      notes: newNotes.trim() || undefined,
      section: newSection,
    });

    setMaterials((prev) => [added, ...prev]);
    setIsAddOpen(false);
    setNewTitle('');
    setNewFileName('');
    setNewFileUrl('');
    setNewNotes('');
    if (['main_sheets', 'week1', 'week2', 'week3'].includes(newCategory)) {
      setActiveCategory(newCategory as TabCategory);
    }
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (!window.confirm(`هل أنتِ متأكدة من حذف هذا الشيت: "${title}"؟`)) return;
    deleteMaterialItem(id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCopyLink = (item: MaterialItem) => {
    const text = `${item.title}\nالمادة: ${getSubjectName(item.subjectId)}\nالتقسيم: بلوك ${item.blockNumber} - ${item.categoryLabel || item.category}\n${item.notes ? 'ملاحظات: ' + item.notes : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSubjectName = (subjectId: string) => {
    const s = activeSubjects.find((sub) => sub.id === subjectId);
    return s ? `${s.nameAr} (${s.nameEn})` : subjectId;
  };

  const getSubjectObj = (subjectId: string) => {
    return activeSubjects.find((sub) => sub.id === subjectId);
  };

  const handleDownloadSheet = (item: MaterialItem) => {
    if (item.fileUrl) {
      window.open(item.fileUrl, '_blank');
      return;
    }
    const previewItems =
      item.contentPreview?.items?.map((it, idx) => `[سؤال ${idx + 1}] ${it}`).join('\n\n') ||
      item.notes ||
      'الشيت جاهز للحل.';
    const content = `=====================================================
مدارس النيل المصرية الدولية - NILE EGYPTIAN INTERNATIONAL SCHOOLS
الصف الثاني الابتدائي (Grade 2) • Block ${item.blockNumber}
المادة: ${getSubjectName(item.subjectId)}
عنوان الشيت: ${item.title}
الوحدة / القسم: ${item.unitTitle || item.categoryLabel || item.category}
عدد الصفحات الأصلية: ${item.pageCount ? item.pageCount + ' صفحة' : 'شيت معتمد'}
=====================================================

محتوى وأسئلة الشيت (Exercises & Practice Questions):
-----------------------------------------------------
${previewItems}

-----------------------------------------------------
تاريخ الإدراج: ${new Date(item.createdAt).toLocaleDateString('ar-EG')}
الفصل المستهدف: ${item.section === 'all' ? 'جميع الفصول (2A, 2B, 2C)' : item.section}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.fileName || `${item.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSheet = (item: MaterialItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const previewHtml =
      item.contentPreview?.items
        ?.map(
          (it, idx) => `
      <div style="margin-bottom: 16px; padding: 14px; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc;">
        <div style="color: #1e3a8a; font-weight: bold; font-size: 15px;">السؤال ${idx + 1}:</div>
        <div style="margin-top: 6px; color: #0f172a; font-size: 14px; line-height: 1.6;">${it}</div>
      </div>`
        )
        .join('') || `<p style="font-size: 14px; line-height: 1.6;">${item.notes || 'الشيت جاهز للحل والمذاكرة.'}</p>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>${item.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", sans-serif; padding: 30px; color: #0f172a; direction: rtl; }
          .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 24px; }
          .school { font-size: 16px; font-weight: 800; color: #1e3a8a; }
          .title { font-size: 22px; font-weight: 900; margin-top: 8px; color: #0f172a; }
          .badge { display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #3730a3; border-radius: 8px; font-size: 12px; font-weight: bold; margin-left: 8px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school">مدارس النيل المصرية الدولية • Nile Egyptian International Schools</div>
          <div class="title">${item.title}</div>
          <div>
            <span class="badge">${getSubjectName(item.subjectId)}</span>
            <span class="badge">Block ${item.blockNumber}</span>
            ${item.unitTitle ? `<span class="badge">${item.unitTitle}</span>` : ''}
            ${item.pageCount ? `<span class="badge">${item.pageCount} صفحة</span>` : ''}
          </div>
        </div>
        <div>
          ${previewHtml}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const toggleSolved = (key: string) => {
    setSolvedExercises((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    // Exclude religion items
    if (m.subjectId === 'religion') return false;

    // 1. Block filter
    if (m.blockNumber !== selectedBlock) return false;

    // 2. Category filter
    if (activeCategory !== 'all' && m.category !== activeCategory) {
      return false;
    }

    // 3. Subject filter
    if (selectedSubjectId !== 'all' && m.subjectId !== selectedSubjectId) {
      return false;
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchNotes = m.notes ? m.notes.toLowerCase().includes(q) : false;
      const matchSubject = getSubjectName(m.subjectId).toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchSubject) return false;
    }

    return true;
  });

  // Counts
  const block1Materials = materials.filter((m) => m.blockNumber === 1 && m.subjectId !== 'religion');
  const mainSheetsCount = block1Materials.filter((m) => m.category === 'main_sheets').length;
  const week1Count = block1Materials.filter((m) => m.category === 'week1').length;
  const week2Count = block1Materials.filter((m) => m.category === 'week2').length;
  const week3Count = block1Materials.filter((m) => m.category === 'week3').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] max-h-[900px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-right animate-scaleUp">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">ماتيريال وشيتات المواد (Materials)</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Block {selectedBlock}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                الشيتات الرسمية والتدريبات المباشرة لجميع المواد بدون شروحات زائدة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة ماتيريال</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Control Bar: Blocks & Categories */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto select-none py-0.5">
            <button
              type="button"
              onClick={() => setActiveCategory('main_sheets')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'main_sheets'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الشيتات الرئيسية للبلوك</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === 'main_sheets' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {mainSheetsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('week1')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'week1'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>ماتيريال ويك 1</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === 'week1' ? 'bg-amber-800 text-amber-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {week1Count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('week2')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'week2'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>ماتيريال ويك 2</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === 'week2' ? 'bg-purple-800 text-purple-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {week2Count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('week3')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'week3'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>ماتيريال ويك 3</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === 'week3' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {week3Count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              الكل ({block1Materials.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الشيتات والأسئلة..."
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden font-bold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Subject Filter Pills - strictly activeSubjects (religion excluded) */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto select-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">المادة:</span>
          <button
            type="button"
            onClick={() => setSelectedSubjectId('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSubjectId === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع المواد
          </button>
          {activeSubjects.map((sub) => {
            const countForSub = materials.filter(
              (m) => m.blockNumber === selectedBlock && m.subjectId === sub.id
            ).length;
            if (countForSub === 0 && selectedSubjectId !== sub.id) return null;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedSubjectId === sub.id
                    ? `${sub.color.bg} text-white shadow-xs`
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <SubjectIcon iconName={sub.iconName} className="w-3.5 h-3.5" />
                <span>{sub.nameAr}</span>
                <span className="text-[10px] opacity-75 font-mono">({countForSub})</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Week 1 Notice banner when week1 is active and empty */}
          {activeCategory === 'week1' && week1Count === 0 && (
            <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-5 text-right space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>ماتيريال الأسبوع الأول (Week 1)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                لم يتم تنزيل أي شيتات مخصصة للأسبوع الأول حتى الآن. وعند إرسال أي شيت جديد سيتم إدراجه هنا مباشرة.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewCategory('week1');
                    setIsAddOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة شيت جديد لـ ويك 1 الآن</span>
                </button>
              </div>
            </div>
          )}

          {/* Week 2 Notice banner when week2 is active and empty */}
          {activeCategory === 'week2' && week2Count === 0 && (
            <div className="bg-purple-50/70 rounded-2xl border border-purple-200 p-5 text-right space-y-2">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                <Calendar className="w-5 h-5 text-purple-600 shrink-0" />
                <span>ماتيريال الأسبوع الثاني (Week 2)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                قسم شيتات الأسبوع الثاني جاهز ومخصص لتنزيل شيتات مواد ويك 2 فور صدورها.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewCategory('week2');
                    setIsAddOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة شيت جديد لـ ويك 2</span>
                </button>
              </div>
            </div>
          )}

          {/* Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500 text-xs sm:text-sm space-y-2">
              <FolderOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">لا توجد ملفات أو شيتات في هذا القسم حالياً</p>
              <p className="text-slate-400 text-xs">
                يمكنك الضغط على زر &quot;إضافة ماتيريال&quot; لإدراج أي شيت أو بوكليت جديد.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredMaterials.map((item) => {
                const subObj = getSubjectObj(item.subjectId);
                const isMainSheet = item.category === 'main_sheets';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {subObj ? (
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${subObj.color.lightBg} ${subObj.color.text} border ${subObj.color.border} flex items-center gap-1.5`}
                            >
                              <SubjectIcon iconName={subObj.iconName} className="w-3.5 h-3.5" />
                              <span>{subObj.nameAr}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {item.subjectId}
                            </span>
                          )}

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isMainSheet
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {item.categoryLabel || item.category}
                          </span>

                          {item.pageCount && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              {item.pageCount} صفحة
                            </span>
                          )}

                          {item.unitTitle && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[140px]">
                              {item.unitTitle}
                            </span>
                          )}
                        </div>

                        {/* Delete button (admins or creators) */}
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id, item.title)}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors opacity-80 hover:opacity-100 cursor-pointer"
                          title="حذف هذا الشيت"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-900 transition-colors leading-snug">
                        {item.title}
                      </h4>

                      {/* Clean page range badge */}
                      {item.pageRangeLabel && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-100">
                          <span>{item.pageRangeLabel}</span>
                        </div>
                      )}

                      {/* File Name Tag */}
                      {item.fileName && (
                        <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[280px]">{item.fileName}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.createdAt).toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Copy details */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="نسخ تفاصيل الشيت"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Print */}
                        <button
                          type="button"
                          onClick={() => handlePrintSheet(item)}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="طباعة الشيت"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Download */}
                        <button
                          type="button"
                          onClick={() => handleDownloadSheet(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer active:scale-95"
                          title="تحميل الشيت"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">تحميل</span>
                        </button>

                        {/* Direct View Sheet Button */}
                        <button
                          type="button"
                          onClick={() => setViewingSheet(item)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                          title="عرض شيت المادة والأسئلة مباشرة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض الشيت</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              جميع شيتات المواد الرسمية متاحة للعرض والتحميل والطباعة مباشرة.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('هل تريد استعادة قائمة الشيتات الافتراضية لبلوك 1؟')) {
                  const def = resetToDefaultMaterials();
                  setMaterials(def);
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-600 font-bold transition-colors cursor-pointer text-xs"
            >
              استعادة الافتراضي
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 2: SHEET CONTENT VIEWER (Direct view of real sheet exercises)       */}
      {/* ========================================================================= */}
      {viewingSheet && (
        <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] max-h-[850px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-right animate-scaleUp">
            
            {/* Viewer Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-white">{viewingSheet.title}</h3>
                    {viewingSheet.pageCount && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-300/30">
                        {viewingSheet.pageCount} صفحة
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {getSubjectName(viewingSheet.subjectId)} • Block {viewingSheet.blockNumber} •{' '}
                    {viewingSheet.unitTitle || viewingSheet.categoryLabel || viewingSheet.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSheet(viewingSheet)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="طباعة الشيت"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">طباعة الشيت</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet(viewingSheet)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="تحميل الشيت"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تحميل الملف</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingSheet(null)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
              
              {/* Sheet Metadata Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-700 font-bold">
                  <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    مدارس النيل المصرية الدولية (Nile Schools)
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600">
                    Grade 2 - Block {viewingSheet.blockNumber}
                  </span>
                  {viewingSheet.fileName && (
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {viewingSheet.fileName}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  تمارين وأسئلة الشيت الرسمية
                </div>
              </div>

              {/* Exercises / Topics List */}
              {viewingSheet.contentPreview?.items && viewingSheet.contentPreview.items.length > 0 ? (
                <div className="space-y-3">
                  {viewingSheet.contentPreview.items.map((itemText, idx) => {
                    const exerciseKey = `${viewingSheet.id}-q-${idx}`;
                    const isSolved = !!solvedExercises[exerciseKey];

                    return (
                      <div
                        key={exerciseKey}
                        className={`bg-white rounded-2xl border transition-all p-4 shadow-2xs flex items-start justify-between gap-3 ${
                          isSolved ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                              فقرة / سؤال {idx + 1}
                            </span>
                            {isSolved && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>تمت المذاكرة / الحل</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                            {itemText}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSolved(exerciseKey)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                            isSolved
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-400 hover:text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                          title={isSolved ? 'إلغاء علامة الحل' : 'تحديد كتم الحل'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-600">
                  <p className="text-sm font-bold">{viewingSheet.notes || 'الشيت جاهز للحل والمذاكرة.'}</p>
                </div>
              )}
            </div>

            {/* Viewer Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewingSheet(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                رجوع لقائمة الماتيريال
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSheet(viewingSheet)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الشيت</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet(viewingSheet)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل كملف</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL: Add Material Form                                              */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 p-5 sm:p-6 text-slate-800 space-y-4 animate-scaleUp text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">إضافة ماتيريال / شيت جديد</h3>
                  <p className="text-xs text-slate-500">إدراج شيت للمادة المختارة والأسبوع المحدد</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewMaterial} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الشيت / عنوان الماتيريال: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: شيت مراجعة الأسبوع الأول، أو بوكليت الوحدة الثانية..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs font-bold outline-hidden shadow-2xs"
                />
              </div>

              {/* Subject & Division */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المادة:
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs font-bold outline-hidden bg-white"
                  >
                    {activeSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.nameAr} ({sub.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    التقسيم / التبويب:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs font-bold outline-hidden bg-white"
                  >
                    <option value="main_sheets">الشيتات الرئيسية (Block 1)</option>
                    <option value="week1">ماتيريال ويك 1 (Week 1)</option>
                    <option value="week2">ماتيريال ويك 2 (Week 2)</option>
                    <option value="week3">ماتيريال ويك 3 (Week 3)</option>
                  </select>
                </div>
              </div>

              {/* Block & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البلوك:
                  </label>
                  <select
                    value={newBlock}
                    onChange={(e) => setNewBlock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs font-bold outline-hidden bg-white"
                  >
                    <option value={1}>Block 1 (الحالي)</option>
                    <option value={2}>Block 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الفصل المستهدف:
                  </label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value as 'all' | GradeSection)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs font-bold outline-hidden bg-white"
                  >
                    <option value="all">جميع الفصول (2A, 2B, 2C)</option>
                    <option value="2A">فصل 2A فقط</option>
                    <option value="2B">فصل 2B فقط</option>
                    <option value="2C">فصل 2C فقط</option>
                  </select>
                </div>
              </div>

              {/* File Info */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الملف أو رابط الملف (اختياري):
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="مثال: Science_Week1_Sheet.pdf أو رابط الشيت"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs outline-hidden shadow-2xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات أو توجيهات الشيت (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="مثال: يرجى حل التمارين من الصفحة 1 إلى 3..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs outline-hidden shadow-2xs resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وإدراج الشيت</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
