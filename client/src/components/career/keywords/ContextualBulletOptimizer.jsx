import { useState } from 'react';
import {
  FileEdit, Sparkles, CheckCircle2, AlertCircle,
  Copy, Check, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ContextualBulletOptimizer = ({ contextualBulletImprovements = [] }) => {
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Template copied to clipboard!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!contextualBulletImprovements || contextualBulletImprovements.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Contextual Bullet Structure Optimizer</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              High-impact bullets follow the 5-point formula: Action + Tool + Task + Outcome + Quantified Metrics.
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-500 italic hidden sm:inline">
          Ethical guidance: Fill bracketed placeholders with your actual facts.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {contextualBulletImprovements.map((item, idx) => (
          <div
            key={item.keyword + idx}
            className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-400" />
                <span>Keyword Focus: {item.keyword}</span>
              </span>
              <span className="text-[11px] text-amber-400/90 font-medium">
                {item.assessment}
              </span>
            </div>

            {/* Current vs Suggested */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Current Bullet */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Current Resume Phrasing</div>
                <p className="text-slate-300 italic text-[11px] leading-relaxed">
                  "{item.currentBullet}"
                </p>
              </div>

              {/* Improved Structure */}
              <div className="p-3 bg-primary-950/20 border border-primary-800/30 rounded-lg space-y-1 relative group">
                <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-primary-400">
                  <span>Improved Outcome-Driven Template</span>
                  <button
                    onClick={() => handleCopy(item.suggestedTemplate, idx)}
                    className="flex items-center gap-1 text-[10px] text-primary-300 hover:text-white transition-colors"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed font-mono">
                  {item.suggestedTemplate}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">Instruction:</span>
              <span>{item.instruction}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextualBulletOptimizer;
