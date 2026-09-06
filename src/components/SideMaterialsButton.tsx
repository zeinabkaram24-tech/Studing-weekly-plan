import React from 'react';
import { FolderOpen, Sparkles, BookOpen } from 'lucide-react';

interface SideMaterialsButtonProps {
  onClick: () => void;
  count?: number;
}

export const SideMaterialsButton: React.FC<SideMaterialsButtonProps> = ({
  onClick,
  count = 8,
}) => {
  return (
    <div className="fixed right-0 top-[42%] -translate-y-1/2 z-40 select-none group">
      <button
        type="button"
        id="side-btn-materials"
        onClick={onClick}
        className="flex items-center gap-2 bg-gradient-to-l from-blue-700 via-indigo-700 to-blue-800 text-white pl-3 pr-2.5 py-2.5 rounded-l-2xl shadow-xl shadow-indigo-950/40 border-y border-l border-blue-400/40 hover:pl-4 hover:shadow-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 cursor-pointer active:scale-95"
        title="فتح قسم الماتيريال والشيتات (Block 1)"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/25 shadow-inner">
            <FolderOpen className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
          </div>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center shadow-xs">
              {count}
            </span>
          )}
        </div>

        <div className="flex flex-col text-right pr-0.5">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black tracking-wide">الماتيريال</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
          </div>
          <span className="text-[9px] font-bold text-blue-200 font-sans">
            شيتات Block 1
          </span>
        </div>
      </button>
    </div>
  );
};
