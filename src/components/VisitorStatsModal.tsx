import React, { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  Calendar,
  Clock,
  Download,
  Copy,
  Check,
  Search,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  X,
  Smartphone,
  Eye,
} from 'lucide-react';
import { VisitorItem, VisitorStatsSummary } from '../types';
import {
  fetchAllVisitorsAdmin,
  deleteVisitorRecord,
  getStoredVisitorEmail,
  getStoredAdminPin,
  setStoredAdminPin,
} from '../utils/visitorTracker';

interface VisitorStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryStats: VisitorStatsSummary | null;
  onRefreshStats: () => void;
}

export const VisitorStatsModal: React.FC<VisitorStatsModalProps> = ({
  isOpen,
  onClose,
  summaryStats,
  onRefreshStats,
}) => {
  const [visitors, setVisitors] = useState<VisitorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Check admin status when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const userEmail = getStoredVisitorEmail()?.toLowerCase();
    const savedPin = getStoredAdminPin();

    const isAuthorizedByDefault =
      userEmail === 'zeinabkaram909@gmail.com' ||
      userEmail === 'zeinabkaram24@gmail.com' ||
      savedPin === '2026' ||
      savedPin === 'admin';

    if (isAuthorizedByDefault) {
      setIsUnlocked(true);
      loadVisitorsList(savedPin || '2026', userEmail);
    } else {
      setIsUnlocked(false);
      setShowAdminLogin(false);
      setError(null);
    }
  }, [isOpen]);

  const loadVisitorsList = async (pin?: string, email?: string) => {
    setLoading(true);
    setError(null);
    const res = await fetchAllVisitorsAdmin(pin, email);
    setLoading(false);

    if (res.authorized) {
      setIsUnlocked(true);
      setVisitors(res.visitors);
      if (pin) setStoredAdminPin(pin);
    } else {
      setError(res.error || 'يرجى إدخال رمز المرور أو بريد المسؤول لعرض قائمة الإيميلات');
    }
  };

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    loadVisitorsList(pinInput.trim(), getStoredVisitorEmail() || undefined);
  };

  const handleDeleteVisitor = async (id: string, email: string) => {
    if (!window.confirm(`هل أنتِ متأكدة من حذف هذا السجل (${email})؟`)) return;

    const success = await deleteVisitorRecord(id);
    if (success) {
      setVisitors((prev) => prev.filter((v) => v.id !== id));
      onRefreshStats();
    } else {
      alert('تعذر حذف السجل');
    }
  };

  const handleCopyAllEmails = () => {
    const emailList = visitors.map((v) => v.email).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (visitors.length === 0) return;

    const headers = 'ID,البريد الإلكتروني,الاسم,الصف,تاريخ أول دخول,تاريخ آخر دخول,عدد الزيارات,الجهاز\n';
    const rows = visitors
      .map((v) => {
        const first = new Date(v.firstSeenAt).toLocaleString('ar-EG');
        const last = new Date(v.lastSeenAt).toLocaleString('ar-EG');
        return `"${v.id}","${v.email}","${v.name || ''}","${v.studentGrade || ''}","${first}","${last}",${v.visitCount},"${v.device || ''}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `visitors_emails_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  // 1. COMPACT DIALOG FOR NON-ADMIN USERS (Requested: Short notice indicating Admin-Only)
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md shadow-2xl border border-slate-200/80 p-6 text-center text-slate-800 space-y-4 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>مخصصة للمسؤول فقط (Admin Only)</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 font-sans pt-1">
              لوحة المتابعة وإحصائيات الطلاب
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans px-2">
              عذراً، هذه الإحصائيات وسجل المتابعة مخصصة فقط لمنشئ التطبيق وإدارة الخطة المدرسية، وليست متاحة للطلاب والزوار حفاظاً على الخصوصية.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-98"
            >
              حسناً، فهمت
            </button>
          </div>

          {/* Admin Login for creator */}
          <div className="pt-3 border-t border-slate-100">
            {!showAdminLogin ? (
              <button
                type="button"
                onClick={() => setShowAdminLogin(true)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline transition-colors cursor-pointer"
              >
                هل أنت منشئ التطبيق؟ تسجيل الدخول كمسؤول
              </button>
            ) : (
              <form onSubmit={handleUnlockWithPin} className="space-y-2.5 pt-1">
                <p className="text-[11px] text-slate-500 font-medium">
                  أدخل رمز المرور السري للمسؤول:
                </p>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="رمز المرور (2026)"
                  autoFocus
                  className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-sm font-bold font-mono outline-hidden"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{loading ? 'جارٍ التحقق...' : 'دخول المسؤول'}</span>
                </button>
                {error && (
                  <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. FULL UNLOCKED DASHBOARD FOR ADMIN
  const filteredVisitors = visitors.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      v.email.toLowerCase().includes(q) ||
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.studentGrade && v.studentGrade.toLowerCase().includes(q))
    );
  });

  const totalUnique = summaryStats?.totalUniqueEmails || visitors.length;
  const totalVisits = summaryStats?.totalVisits || visitors.reduce((a, b) => a + (b.visitCount || 1), 0);
  const todayVisits = summaryStats?.todayVisits || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden text-slate-800 my-auto">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-sans">
                  إحصائيات واستخدام المنصة والإيميلات
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  لوحة المتابعة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                معرفة عدد الإيميلات الفعلية التي سجلت واستخدمت الخطة وتفاصيل زياراتهم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onRefreshStats();
                loadVisitorsList(getStoredAdminPin() || undefined, getStoredVisitorEmail() || undefined);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 sm:p-6 bg-slate-50 border-b border-slate-200">
          {/* Total Unique Emails */}
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">
                إجمالي الإيميلات الفريدة المسجلة
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-indigo-700 font-sans">
                  {totalUnique}
                </span>
                <span className="text-xs font-bold text-slate-500">إيميل فعلي</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          {/* Total Usage Sessions */}
          <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">
                إجمالي مرات الاستخدام والفتح
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-purple-700 font-sans">
                  {totalVisits}
                </span>
                <span className="text-xs font-bold text-slate-500">زيارة</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Active in last 24 hours */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">
                النشاط خلال آخر 24 ساعة
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-sans">
                  {todayVisits}
                </span>
                <span className="text-xs font-bold text-slate-500">مستخدم نشط</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="space-y-4">
            {/* Controls bar: Search & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في الإيميلات أو الأسماء..."
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs font-sans outline-hidden"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleCopyAllEmails}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    title="نسخ جميع الإيميلات إلى الحافظة"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>نسخ كل الإيميلات</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-indigo-200 transition-colors"
                    title="تصدير جدول Excel / CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير CSV</span>
                  </button>
                </div>
              </div>

              {/* Table / List */}
              {filteredVisitors.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  لا توجد إيميلات مسجلة تطابق بحثك حالياً.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-right text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 select-none">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">البريد الإلكتروني (Email)</th>
                        <th className="p-3">الاسم / الصف</th>
                        <th className="p-3">تاريخ أول دخول</th>
                        <th className="p-3">آخر استخدام</th>
                        <th className="p-3 text-center">مرات الفتح</th>
                        <th className="p-3 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredVisitors.map((vis, idx) => {
                        const isOwner = vis.email.toLowerCase() === 'zeinabkaram909@gmail.com';
                        const firstDate = new Date(vis.firstSeenAt).toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                        });
                        const lastDate = new Date(vis.lastSeenAt).toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <tr
                            key={vis.id}
                            className={`hover:bg-indigo-50/40 transition-colors ${
                              isOwner ? 'bg-amber-50/40' : ''
                            }`}
                          >
                            <td className="p-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 select-all" dir="ltr">
                                  {vis.email}
                                </span>
                                {isOwner && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                    المسؤول 👑
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{vis.name || '—'}</div>
                              <div className="text-[10px] text-slate-400">{vis.studentGrade || 'Grade 2B'}</div>
                            </td>
                            <td className="p-3 text-slate-500 font-sans">{firstDate}</td>
                            <td className="p-3 text-slate-600 font-sans font-medium">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{lastDate}</span>
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 font-mono font-bold text-indigo-700 text-xs">
                                {vis.visitCount || 1}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {!isOwner && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVisitor(vis.id, vis.email)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="حذف هذا السجل"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>يتم تخزين وتحديث بيانات الإيميلات تلقائياً في خادم التطبيق السحابي.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
