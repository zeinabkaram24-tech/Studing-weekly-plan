import React, { useState } from 'react';
import { Mail, User, Sparkles, CheckCircle2, ShieldCheck, X, School } from 'lucide-react';
import { registerVisitorEmail } from '../utils/visitorTracker';
import { GradeSection, VisitorItem } from '../types';
import { GRADE_SECTIONS } from '../data/defaultData';

interface VisitorWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (visitor: VisitorItem) => void;
  selectedSection: GradeSection;
  onSectionChange: (section: GradeSection) => void;
}

export const VisitorWelcomeModal: React.FC<VisitorWelcomeModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
  selectedSection,
  onSectionChange,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('يرجى كتابة بريد إلكتروني صحيح (مثال: name@example.com)');
      return;
    }

    setLoading(true);
    const res = await registerVisitorEmail(cleanEmail, name, `Grade ${selectedSection}`);
    setLoading(false);

    if (res.success && res.visitor) {
      onRegistered(res.visitor);
      onClose();
    } else {
      setError(res.error || 'تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSkip = () => {
    // Register as quick guest so we still track that a guest entered
    const guestEmail = `guest_${Date.now().toString(36)}@g2-guest.app`;
    registerVisitorEmail(guestEmail, 'زائر سريع', `Grade ${selectedSection}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden relative text-slate-800 my-auto">
        {/* Decorative Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-6 text-white text-right relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>خطة المذاكرة الأسبوعية • Grade 2</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-1.5">
            مرحباً بك في Studying Weekly Plan 📚
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            يرجى تحديد فصلك الدراسي وتسجيل بريدك الإلكتروني لحفظ خطتك ومتابعة مهام الأسبوع ومطلوبات الغد.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-indigo-600" />
                <span>اختر الفصل الدراسي (Class Section) *</span>
              </span>
              <span className="text-[11px] text-indigo-600 font-bold">فصل {selectedSection}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADE_SECTIONS.map((sec) => {
                const isSelected = selectedSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => onSectionChange(sec.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-black shadow-xs ring-2 ring-indigo-200'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-base font-sans font-black">{sec.id}</span>
                    <span className="text-[11px] text-slate-500">{sec.nameAr.replace('فصل ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>البريد الإلكتروني (Email) *</span>
              <span className="text-[11px] text-slate-400 font-normal">مطلوب للتسجيل والمتابعة</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                dir="ltr"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm font-sans outline-hidden text-left"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>اسم الطالب أو ولي الأمر</span>
              <span className="text-[11px] text-slate-400 font-normal">اختياري</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مريم / والدة الطالب"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm outline-hidden text-right"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>خصوصية وسهولة تامة:</span>
            </div>
            <p>يتم تسجيل بريدك وفصلك لحفظ جدول الحصص اليومي ومطلوبات الغد بدقة.</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-900/20 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'جاري التسجيل...' : 'تسجيل ودخول للمنصة'}</span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              تخطي كزائر
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

