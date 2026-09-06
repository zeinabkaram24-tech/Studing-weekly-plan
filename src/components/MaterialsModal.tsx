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
  Upload,
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
import {
  getMaterialPdfUrl,
  downloadMaterialPdf,
  printMaterialPdf,
} from '../utils/pdfGenerator';

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
  const [newPageRange, setNewPageRange] = useState<string>('');
  const [newPageCount, setNewPageCount] = useState<string>('');
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
      pageRange: newPageRange.trim() || undefined,
      pageCount: newPageCount ? Number(newPageCount) : undefined,
      notes: newNotes.trim() || undefined,
      section: newSection,
    });

    setMaterials((prev) => [added, ...prev]);
    setIsAddOpen(false);
    setNewTitle('');
    setNewFileName('');
    setNewFileUrl('');
    setNewPageRange('');
    setNewPageCount('');
    setNewNotes('');
    if (['main_sheets', 'week1', 'week2', 'week3'].includes(newCategory)) {
      setActiveCategory(newCategory as TabCategory);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewFileUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (!window.confirm(`هل أنتِ متأكدة من حذف هذا الشيت: "${title}"؟`)) return;
    deleteMaterialItem(id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCopyLink = (item: MaterialItem) => {
    const text = `${item.title}\nالمادة: ${getSubjectName(item.subjectId)}\nالتقسيم: بلوك ${item.blockNumber} - ${item.categoryLabel || item.category}\n${item.pageRange ? 'الصفحات: ' + item.pageRange + '\n' : ''}${item.notes ? 'ملاحظات: ' + item.notes : ''}`;
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
    downloadMaterialPdf(item);
  };

  const handlePrintSheet = (item: MaterialItem) => {
    printMaterialPdf(item);
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

                          {item.pageRange && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300">
                              {item.pageRange}
                            </span>
                          )}

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
      {/* MODAL 2: SHEET PDF VIEWER (Direct Authentic PDF View)                     */}
      {/* ========================================================================= */}
      {viewingSheet && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[94vh] max-h-[920px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-right animate-scaleUp">
            
            {/* Viewer Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <FileText className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-white">{viewingSheet.title}</h3>
                    {viewingSheet.pageRange && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {viewingSheet.pageRange}
                      </span>
                    )}
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
                  onClick={() => window.open(getMaterialPdfUrl(viewingSheet), '_blank')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="فتح في نافذة كاملة جديدة"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نافذة كاملة</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintSheet(viewingSheet)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="طباعة الشيت PDF فوراً"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الشيت</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet(viewingSheet)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="تحميل ملف PDF الأصلي"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingSheet(null)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body: Direct Native PDF embed */}
            <div className="flex-1 bg-slate-100 p-2 sm:p-3 overflow-hidden flex flex-col">
              <iframe
                src={getMaterialPdfUrl(viewingSheet)}
                className="w-full flex-1 border-0 rounded-2xl bg-white shadow-inner"
                title={viewingSheet.title}
              />
            </div>

            {/* Viewer Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>شيت PDF رسمي معتمد لمدارس النيل المصرية الدولية {viewingSheet.pageRange ? `(${viewingSheet.pageRange})` : ''}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSheet(viewingSheet)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الشيت</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet(viewingSheet)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingSheet(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
                >
                  إغلاق العرض
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
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 p-5 sm:p-6 text-slate-800 space-y-4 animate-scaleUp text-right my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">إضافة ماتيريال / شيت PDF جديد</h3>
                  <p className="text-xs text-slate-500">تحميل شيت PDF مع تحديد الصفحات والمادة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
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
                  placeholder="مثال: شيت مراجعة الأسبوع الأول، Unit 1 Study Sheet..."
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

              {/* Page Range & Page Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نطاق الصفحات (من صفحة كذا لكذا):
                  </label>
                  <input
                    type="text"
                    value={newPageRange}
                    onChange={(e) => setNewPageRange(e.target.value)}
                    placeholder="مثال: من صفحة 4 إلى 12"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs font-bold outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عدد الصفحات الإجمالي:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newPageCount}
                    onChange={(e) => setNewPageCount(e.target.value)}
                    placeholder="مثال: 9"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs font-bold outline-hidden shadow-2xs"
                  />
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

              {/* Direct PDF File Upload */}
              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200">
                <label className="block text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>تحميل ملف PDF مباشرة من جهازك (موصى به):</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="w-full text-xs text-slate-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                {newFileName && (
                  <div className="mt-1.5 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>تم تحديد: {newFileName}</span>
                  </div>
                )}
              </div>

              {/* External File URL fallback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  أو أدخل رابط الملف الإلكتروني (URL):
                </label>
                <input
                  type="text"
                  value={newFileUrl && !newFileUrl.startsWith('data:') ? newFileUrl : ''}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  placeholder="https://... رابط الشيت"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs outline-hidden shadow-2xs font-mono text-left"
                  dir="ltr"
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
                  placeholder="أي ملاحظات إضافية على الشيت..."
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
