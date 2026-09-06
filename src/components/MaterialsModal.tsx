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
  saveMaterials,
  addMaterialItem,
  deleteMaterialItem,
  clearDefaultMaterials,
  clearAllMaterials,
  resetToDefaultMaterials,
} from '../utils/materialsStorage';
import {
  getMaterialPdfUrl,
  downloadMaterialPdf,
  printMaterialPdf,
  printMaterialSheet,
  downloadMaterialSheet,
  ensureBlobOrHttpUrl,
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
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  // In-app deletion and prompt states (100% reliable inside iframes)
  const [sheetToDelete, setSheetToDelete] = useState<MaterialItem | null>(null);
  const [clearConfirmation, setClearConfirmation] = useState<{
    title: string;
    message: string;
    confirmBtnText: string;
    action: () => void;
  } | null>(null);

  // Helper: Format category names cleanly in English Week 1, Week 2, Week 3, Main Sheets
  const formatCategoryLabel = (cat?: string, label?: string): string => {
    if (cat === 'week1' || label === 'ويك 1' || label === 'Week 1') return 'Week 1';
    if (cat === 'week2' || label === 'ويك 2' || label === 'Week 2') return 'Week 2';
    if (cat === 'week3' || label === 'ويك 3' || label === 'Week 3') return 'Week 3';
    if (cat === 'main_sheets' || label === 'الشيتات الرئيسية' || label === 'Main Sheets') return 'Main Sheets';
    return label || cat || '';
  };

  // In-app sheet content viewer
  const [viewingSheet, setViewingSheet] = useState<MaterialItem | null>(null);
  const [printingItem, setPrintingItem] = useState<MaterialItem | null>(null);
  const [solvedExercises, setSolvedExercises] = useState<Record<string, boolean>>({});

  // Add material dialog state
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubjectId, setNewSubjectId] = useState<string>('science');
  const [newCategory, setNewCategory] = useState<string>('main_sheets');
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
      const saved = getSavedMaterials();
      setMaterials(saved);

      // Also sync from backend
      fetch('/api/materials')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.materials)) {
            const valid = data.materials.filter((m: any) => m.subjectId !== 'religion');
            if (valid.length > 0) {
              setMaterials(valid);
              saveMaterials(valid);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Add Item
  const handleAddNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let categoryLabel = 'Main Sheets';
    if (newCategory === 'week1') categoryLabel = 'Week 1';
    else if (newCategory === 'week2') categoryLabel = 'Week 2';
    else if (newCategory === 'week3') categoryLabel = 'Week 3';

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

    setPrintNotice(`✅ تم حفظ وإضافة الشيت بنجاح: "${newTitle.trim()}"`);
    setTimeout(() => setPrintNotice(null), 3500);

    // Also persist uploaded file to server storage if base64
    if (newFileUrl.startsWith('data:')) {
      fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          subjectId: newSubjectId,
          blockNumber: newBlock,
          category: newCategory,
          categoryLabel,
          itemType: newItemType,
          fileName: newFileName.trim() || undefined,
          fileBase64: newFileUrl,
          pageRange: newPageRange.trim() || undefined,
          pageCount: newPageCount ? Number(newPageCount) : undefined,
          notes: newNotes.trim() || undefined,
          section: newSection,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.material?.fileUrl) {
            setMaterials((prev) =>
              prev.map((m) => (m.id === added.id ? { ...m, fileUrl: data.material.fileUrl } : m))
            );
          }
        })
        .catch(() => {});
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFileName(file.name);
    if (!newTitle.trim()) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewFileUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Direct 1-Click Upload for any subject
  const handleDirectFileUpload = (
    subjectId: string,
    category: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    let catLabel = 'Main Sheets';
    if (category === 'week1') catLabel = 'Week 1';
    else if (category === 'week2') catLabel = 'Week 2';
    else if (category === 'week3') catLabel = 'Week 3';

    setPrintNotice(`جاري رفع ملف الـ PDF: "${file.name}"...`);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;

      const added = addMaterialItem({
        title: cleanTitle,
        subjectId,
        blockNumber: selectedBlock,
        category,
        categoryLabel: catLabel,
        itemType: 'sheet',
        fileName: file.name,
        fileUrl: base64Data,
        fileSize: sizeMb,
        section: 'all',
      });

      setMaterials((prev) => [added, ...prev.filter((m) => m.id !== added.id)]);
      setPrintNotice(`✅ تم تحميل الشيت بنجاح لـ ${getSubjectName(subjectId)}`);
      setTimeout(() => setPrintNotice(null), 3500);

      try {
        const res = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: cleanTitle,
            subjectId,
            blockNumber: selectedBlock,
            category,
            categoryLabel: catLabel,
            itemType: 'sheet',
            fileName: file.name,
            fileBase64: base64Data,
            fileSize: sizeMb,
            section: 'all',
          }),
        });
        const data = await res.json();
        if (data?.material?.fileUrl) {
          setMaterials((prev) =>
            prev.map((m) => (m.id === added.id ? { ...m, fileUrl: data.material.fileUrl } : m))
          );
        }
      } catch (err) {
        console.warn('Server sync error:', err);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const executeDeleteItem = (id: string, title?: string) => {
    deleteMaterialItem(id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    if (viewingSheet?.id === id) {
      setViewingSheet(null);
    }
    setSheetToDelete(null);
    setPrintNotice(`🗑️ تم مسح الشيت بنجاح ${title ? `"${title}"` : ''}`);
    setTimeout(() => setPrintNotice(null), 3000);
  };

  const handleDeleteItem = (id: string, title: string) => {
    const item = materials.find((m) => m.id === id);
    if (item) {
      setSheetToDelete(item);
    } else {
      executeDeleteItem(id, title);
    }
  };

  const handleClearDefaultSheets = () => {
    setClearConfirmation({
      title: 'تفريغ كافة الشيتات',
      message: 'هل تريدين بالتأكيد تفريغ كافة الشيتات والبدء من جديد برفع شيتاتكِ المعتمدة؟',
      confirmBtnText: 'نعم، تفريغ الشيتات',
      action: () => {
        clearAllMaterials();
        setMaterials([]);
        setClearConfirmation(null);
        setPrintNotice('تم تفريغ كافة الشيتات بنجاح. القائمة جاهزة لاستقبال ملفاتكِ.');
        setTimeout(() => setPrintNotice(null), 3500);
      },
    });
  };

  const handleClearAllSheets = () => {
    setClearConfirmation({
      title: 'مسح جميع الشيتات بالكامل',
      message: 'تحذير: هل أنتِ متأكدة من مسح جميع الشيتات تماماً وتفريغ القائمة بالكامل؟',
      confirmBtnText: 'نعم، مسح الكل',
      action: () => {
        clearAllMaterials();
        setMaterials([]);
        setClearConfirmation(null);
        setPrintNotice('تم مسح جميع الشيتات بنجاح.');
        setTimeout(() => setPrintNotice(null), 3500);
      },
    });
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
    setPrintNotice(`جاري تنزيل ملف الشيت: "${item.title}"...`);
    setTimeout(() => setPrintNotice(null), 3000);
    downloadMaterialSheet(item);
  };

  const handlePrintSheet = (item: MaterialItem) => {
    setPrintNotice(`🖨️ تم تشغيل أمر الطباعة للشيت: "${item.title}"`);
    setTimeout(() => setPrintNotice(null), 4000);

    // If viewing the PDF in iframe, also attempt to focus & print
    const iframe = document.getElementById('pdf-viewer-iframe') as HTMLIFrameElement | null;
    if (viewingSheet?.id === item.id && iframe?.contentWindow) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch {
        // ignore
      }
    }

    printMaterialSheet(item);
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
              onClick={handleClearDefaultSheets}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="تفريغ كافة الشيتات والبدء من جديد"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-300" />
              <span className="hidden sm:inline">تفريغ الشيتات</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
              title="رفع ملف PDF جديد"
            >
              <Upload className="w-4 h-4" />
              <span>رفع شيت PDF للمادة</span>
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

        {/* Live Notification Bar (Print & Upload feedback) */}
        {printNotice && (
          <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-inner animate-fadeIn border-b border-indigo-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{printNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setPrintNotice(null)}
              className="text-white/80 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
              <span>Main Sheets</span>
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
              <span>Week 1</span>
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
              <span>Week 2</span>
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
              <span>Week 3</span>
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
              All ({block1Materials.length})
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
                <span>شيتات وماتيريال Week 1</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                قسم شيتات Week 1 جاهز لاستقبال ملفاتكِ بصيغة PDF كاملة. اختاري المادة واضغطي تحميل.
              </p>
            </div>
          )}

          {/* Week 2 Notice banner when week2 is active and empty */}
          {activeCategory === 'week2' && week2Count === 0 && (
            <div className="bg-purple-50/70 rounded-2xl border border-purple-200 p-5 text-right space-y-2">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                <Calendar className="w-5 h-5 text-purple-600 shrink-0" />
                <span>شيتات وماتيريال Week 2</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                قسم شيتات Week 2 مخصص لتنزيل شيتات مواد Week 2 فور صدورها.
              </p>
            </div>
          )}

          {/* Materials Grid or Subject Upload Hub */}
          {filteredMaterials.length === 0 ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 rounded-3xl border border-indigo-100 p-6 sm:p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  لوحة رفع وتحميل شيتات المواد (ملف PDF كامل)
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                  تم تفريغ كافة الشيتات الافتراضية. يمكنكِ الآن رفع الشيت المعتمد لكل مادة بصيغة PDF كاملة مباشرة عبر الضغط على زر التحميل الخاص بالمادة.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة شيت مخصص بتفاصيل إضافية</span>
                  </button>
                </div>
              </div>

              {/* Grid of Subjects with Direct Upload Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(selectedSubjectId === 'all'
                  ? activeSubjects
                  : activeSubjects.filter((s) => s.id === selectedSubjectId)
                ).map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${sub.color.lightBg} ${sub.color.text} border ${sub.color.border} flex items-center gap-1.5`}
                        >
                          <SubjectIcon iconName={sub.iconName} className="w-4 h-4" />
                          <span>{sub.nameAr}</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                          {sub.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {sub.nameEn} • {activeCategory === 'week1' ? 'Week 1' : activeCategory === 'week2' ? 'Week 2' : activeCategory === 'week3' ? 'Week 3' : 'Main Sheets'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <label className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>تحميل شيت PDF لـ {sub.nameAr}</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDirectFileUpload(
                              sub.id,
                              activeCategory === 'all' ? 'main_sheets' : activeCategory,
                              e
                            )
                          }
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setNewSubjectId(sub.id);
                          setNewCategory(activeCategory === 'all' ? 'main_sheets' : activeCategory);
                          setIsAddOpen(true);
                        }}
                        className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-indigo-600 py-1 transition-colors cursor-pointer"
                      >
                        + تخصيص العنوان ورقم الصفحات
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                            {formatCategoryLabel(item.category, item.categoryLabel)}
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

                        {/* Delete button (Always active and clickable) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id, item.title);
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition-all cursor-pointer shadow-2xs active:scale-90 flex items-center justify-center shrink-0"
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
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.createdAt).toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id, item.title)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer active:scale-95"
                          title="حذف هذا الشيت"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>

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
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-blue-200 transition-colors cursor-pointer active:scale-95"
                          title="طباعة الشيت فوراً"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة</span>
                        </button>

                        {/* Download */}
                        <button
                          type="button"
                          onClick={() => handleDownloadSheet(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer active:scale-95"
                          title="تحميل ملف الـ PDF كاملاً"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل PDF</span>
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
              onClick={handleClearAllSheets}
              className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold transition-colors cursor-pointer text-xs"
              title="مسح كافة الشيتات بدون استثناء"
            >
              مسح الكل
            </button>
            <button
              type="button"
              onClick={() => {
                setClearConfirmation({
                  title: 'استعادة الشيتات الافتراضية',
                  message: 'هل تريدين بالتأكيد استعادة قائمة الشيتات الافتراضية لبلوك 1؟',
                  confirmBtnText: 'نعم، استعادة الافتراضي',
                  action: () => {
                    const def = resetToDefaultMaterials();
                    setMaterials(def);
                    setClearConfirmation(null);
                    setPrintNotice('تمت استعادة الشيتات الافتراضية بنجاح.');
                    setTimeout(() => setPrintNotice(null), 3000);
                  },
                });
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
      {/* MODAL 2: SHEET VIEWER (Exact Authentic Nile Schools Sheet Content)        */}
      {/* ========================================================================= */}
      {viewingSheet && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[94vh] max-h-[920px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-right animate-scaleUp">
            
            {/* Viewer Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800 shrink-0">
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
                    {viewingSheet.unitTitle || formatCategoryLabel(viewingSheet.category, viewingSheet.categoryLabel)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Delete Sheet inside Viewer */}
                <button
                  type="button"
                  onClick={() => {
                    setSheetToDelete(viewingSheet);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                  title="حذف هذا الشيت نهائياً"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الشيت</span>
                </button>

                {viewingSheet.fileUrl && (
                  <a
                    href={ensureBlobOrHttpUrl(viewingSheet.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="فتح الرابط / الملف المرفق مباشرة في نافذة كاملة"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">نافذة كاملة</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handlePrintSheet(viewingSheet)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="طباعة الشيت فوراً"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الشيت</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet(viewingSheet)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="تحميل الشيت كما هو بالملي"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الشيت</span>
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

            {/* Viewer Body: Direct PDF or Authentic Sheet Content */}
            {viewingSheet.fileUrl ? (
              <div className="flex-1 bg-slate-900 flex flex-col overflow-hidden relative">
                {/* Secondary Info Bar */}
                <div className="bg-slate-800 text-slate-300 px-4 py-2 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-white">
                      {viewingSheet.fileName || viewingSheet.title}
                    </span>
                    {viewingSheet.pageRange && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700 text-slate-200">
                        {viewingSheet.pageRange}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={ensureBlobOrHttpUrl(viewingSheet.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 hover:text-white font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح الشيت في تبويب جديد</span>
                    </a>
                  </div>
                </div>

                {/* Embedded PDF iframe */}
                <div className="flex-1 w-full h-full p-2 bg-slate-900 flex flex-col">
                  <iframe
                    src={ensureBlobOrHttpUrl(viewingSheet.fileUrl)}
                    className="w-full flex-1 border-0 rounded-xl bg-white shadow-lg min-h-[520px]"
                    title={viewingSheet.title}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-slate-100 p-3 sm:p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
                  {/* Official School Header */}
                  <div className="border-b-2 border-blue-900 pb-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-blue-900 leading-tight">
                        مدارس النيل المصرية الدولية • NILE EGYPTIAN INTERNATIONAL SCHOOLS
                      </h2>
                      <p className="text-xs text-slate-500 font-bold mt-1">
                        الصف الثاني الابتدائي (Grade 2) • العام الدراسي 2026/2027 • فرع المنيا
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs font-black">
                        {getSubjectName(viewingSheet.subjectId)}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                        Block {viewingSheet.blockNumber}
                      </span>
                    </div>
                  </div>

                  {/* Sheet Title & Metadata */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">{viewingSheet.title}</h3>
                      {viewingSheet.pageRange && (
                        <span className="px-3 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black">
                          {viewingSheet.pageRange}
                        </span>
                      )}
                      {viewingSheet.unitTitle && (
                        <span className="px-3 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                          {viewingSheet.unitTitle}
                        </span>
                      )}
                    </div>

                    {/* Student Header Lines */}
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bold text-slate-600 mt-4">
                      <span>اسم الطالب/ـة: ............................................................................</span>
                      <span>الفصل: 2 {viewingSheet.section === 'all' ? '(A / B / C)' : viewingSheet.section}</span>
                      <span>التاريخ: ...... / ...... / 2026</span>
                    </div>
                  </div>

                  {/* Direct file URL Notice if provided */}
                  {viewingSheet.fileUrl && (
                    <div className="mb-6 p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-blue-900">رابط الملف الأصلي للشيت متاح</div>
                          <div className="text-[11px] text-blue-700 mt-0.5">
                            {viewingSheet.fileName || 'ملف PDF خارجي مرفق'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.open(viewingSheet.fileUrl, '_blank')}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>فتح الرابط الأصلي مباشرة</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Questions / Exercises list */}
                  {viewingSheet.contentPreview?.items && viewingSheet.contentPreview.items.length > 0 ? (
                    <div className="space-y-3.5 mb-6">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                        تمارين وأسئلة الشيت المعتمدة:
                      </h4>
                      {viewingSheet.contentPreview.items.map((itemText, idx) => {
                        const itemKey = `${viewingSheet.id}-item-${idx}`;
                        const isDone = !!solvedExercises[itemKey];

                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all ${
                              isDone
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="text-xs font-black text-indigo-900 mb-1 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-black">
                                    {idx + 1}
                                  </span>
                                  <span>سؤال / فقرة {idx + 1}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 leading-relaxed pr-8">
                                  {itemText}
                                </p>
                                <div className="mt-3 border-b border-dotted border-slate-200 h-6"></div>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleSolved(itemKey)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isDone ? 'تم الحل والمذاكرة' : 'تحديد كمنجز'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-600 text-xs font-bold mb-6">
                      {viewingSheet.notes || 'الشيت جاهز للعرض والمذاكرة والطباعة.'}
                    </div>
                  )}

                  {/* Key Concepts / Sections */}
                  {viewingSheet.contentPreview?.sections && viewingSheet.contentPreview.sections.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        المحاور والمفاهيم الرئيسية:
                      </h4>
                      {viewingSheet.contentPreview.sections.map((sec, sidx) => (
                        <div key={sidx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <h5 className="text-xs font-black text-slate-900 mb-2">{sec.title}</h5>
                          <ul className="list-disc pr-5 text-xs font-medium text-slate-700 space-y-1.5">
                            {sec.points.map((pt, pidx) => (
                              <li key={pidx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {viewingSheet.notes && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900 mb-6">
                      <span className="font-bold">ملاحظات:</span> {viewingSheet.notes}
                    </div>
                  )}

                  {/* Footer Signature Bar */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>مدارس النيل المصرية الدولية • Nile Egyptian International Schools</span>
                    <span>{viewingSheet.fileName || viewingSheet.title}</span>
                    <span>تاريخ الإدراج: {new Date(viewingSheet.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Viewer Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>شيت معتمد لمدارس النيل المصرية الدولية {viewingSheet.pageRange ? `(${viewingSheet.pageRange})` : ''}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSheet(viewingSheet)}
                  className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-700" />
                  <span>طباعة الشيت الآن</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet(viewingSheet)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الشيت</span>
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
                    <option value="main_sheets">Main Sheets (Block 1)</option>
                    <option value="week1">Week 1</option>
                    <option value="week2">Week 2</option>
                    <option value="week3">Week 3</option>
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

      {/* ========================================================================= */}
      {/* IN-PAGE DEDICATED PRINT CONTAINER (Triggered on window.print())           */}
      {/* ========================================================================= */}
      {printingItem && (
        <div id="printable-sheet-container" className="hidden print:block bg-white text-slate-950 p-6">
          <div className="border-b-2 border-blue-900 pb-3 mb-4">
            <div className="text-xl font-black text-blue-900">
              مدارس النيل المصرية الدولية • NILE EGYPTIAN INTERNATIONAL SCHOOLS
            </div>
            <div className="text-sm font-bold text-slate-600 mt-1">
              الصف الثاني الابتدائي (Grade 2) • العام الدراسي 2026/2027 • فرع المنيا
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {printingItem.title}
            </div>
            <div className="flex gap-2 flex-wrap mt-2 text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {getSubjectName(printingItem.subjectId)}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                Block {printingItem.blockNumber}
              </span>
              {printingItem.pageRange && (
                <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {printingItem.pageRange}
                </span>
              )}
              {printingItem.pageCount && (
                <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                  {printingItem.pageCount} صفحة
                </span>
              )}
              {printingItem.unitTitle && (
                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                  {printingItem.unitTitle}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center bg-slate-50 border border-dashed border-slate-400 p-2.5 rounded-lg text-xs font-bold text-slate-700 mb-5">
            <span>اسم الطالب/ـة: ............................................................................</span>
            <span>الفصل: 2 {printingItem.section === 'all' ? '(A / B / C)' : printingItem.section}</span>
            <span>التاريخ: ...... / ...... / 2026</span>
          </div>

          {printingItem.contentPreview?.items && printingItem.contentPreview.items.length > 0 && (
            <div className="space-y-3 mb-5">
              {printingItem.contentPreview.items.map((itemText, idx) => (
                <div key={idx} className="p-3 border border-slate-300 rounded-lg bg-white">
                  <div className="text-xs font-black text-blue-900 mb-1">
                    سؤال / فقرة {idx + 1}:
                  </div>
                  <div className="text-sm font-bold text-slate-900 leading-relaxed">
                    {itemText}
                  </div>
                  <div className="mt-2 border-b border-dotted border-slate-300 h-6"></div>
                </div>
              ))}
            </div>
          )}

          {printingItem.contentPreview?.sections && printingItem.contentPreview.sections.length > 0 && (
            <div className="space-y-3 mb-5">
              {printingItem.contentPreview.sections.map((sec, idx) => (
                <div key={idx} className="p-3 border border-slate-300 rounded-lg bg-slate-50">
                  <div className="text-xs font-black text-slate-900 mb-1">{sec.title}</div>
                  <ul className="list-disc pr-5 text-xs text-slate-800 space-y-1">
                    {sec.points.map((pt, pidx) => (
                      <li key={pidx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {printingItem.notes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mb-5">
              <strong>ملاحظات:</strong> {printingItem.notes}
            </div>
          )}

          <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-500">
            <span>مدارس النيل المصرية الدولية • Nile Egyptian International Schools</span>
            <span>{printingItem.fileName || printingItem.title}</span>
            <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</span>
          </div>
        </div>
      )}

      {/* 1. Custom In-App Delete Sheet Confirmation Modal (100% reliable inside iframes) */}
      {sheetToDelete && (
        <div className="fixed inset-0 z-70 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">تأكيد حذف الشيت</h4>
                <p className="text-xs text-slate-500 mt-0.5">هل تريدين بالتأكيد حذف هذا الشيت نهائياً من القائمة؟</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs font-black text-slate-900">{sheetToDelete.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span>{getSubjectName(sheetToDelete.subjectId)}</span>
                <span>•</span>
                <span className="font-bold text-indigo-700">{formatCategoryLabel(sheetToDelete.category, sheetToDelete.categoryLabel)}</span>
                {sheetToDelete.pageRange && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-emerald-700 font-bold">{sheetToDelete.pageRange}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSheetToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => executeDeleteItem(sheetToDelete.id, sheetToDelete.title)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، احذف الشيت</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Custom In-App Action Confirmation Modal */}
      {clearConfirmation && (
        <div className="fixed inset-0 z-70 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">{clearConfirmation.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{clearConfirmation.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setClearConfirmation(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={clearConfirmation.action}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md cursor-pointer active:scale-95"
              >
                {clearConfirmation.confirmBtnText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
