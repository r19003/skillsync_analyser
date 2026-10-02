import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, Cell, CartesianGrid
} from 'recharts';
import { BarChart3, PieChart, Table, CheckCircle2, XCircle } from 'lucide-react';

const KeywordDistributionCharts = ({
  categoryBreakdown = [],
  sectionDistribution = []
}) => {
  const [viewMode, setViewMode] = useState('category'); // 'category' | 'section' | 'table'

  // Prepare data for Category chart
  const categoryData = categoryBreakdown.slice(0, 7).map(c => ({
    name: c.category.length > 16 ? c.category.slice(0, 14) + '...' : c.category,
    fullName: c.category,
    Matched: c.matched,
    Missing: c.missing,
    Total: c.total
  }));

  // Prepare data for Section chart
  const sectionData = sectionDistribution.map(s => ({
    name: s.section,
    Occurrences: s.count,
    idealShare: s.idealShare
  }));

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">Keyword Distribution Analytics</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical breakdown of matched and missing keywords across functional categories and document sections.
          </p>
        </div>

        {/* Chart View Toggles */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('category')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              viewMode === 'category' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>By Category</span>
          </button>
          <button
            onClick={() => setViewMode('section')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              viewMode === 'section' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>By Section</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Accessible Table</span>
          </button>
        </div>
      </div>

      {/* 1. Category Chart View */}
      {viewMode === 'category' && (
        <div className="space-y-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 15, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-semibold text-white">{data.fullName}</div>
                          <div className="text-emerald-400">Matched: {data.Matched}</div>
                          <div className="text-rose-400">Missing: {data.Missing}</div>
                          <div className="text-slate-400">Total: {data.Total}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Matched" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Missing" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Green bars indicate verified candidate coverage; red bars reflect missing requirements to target.
          </p>
        </div>
      )}

      {/* 2. Section Placement Chart View */}
      {viewMode === 'section' && (
        <div className="space-y-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionData} margin={{ top: 10, right: 15, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-semibold text-white">{data.name} Section</div>
                          <div className="text-cyan-400">Occurrences: {data.Occurrences}</div>
                          <div className="text-slate-400">Recommended share: {data.idealShare}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Occurrences" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                  {sectionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === 'Experience' ? '#3b82f6' : entry.name === 'Skills' ? '#06b6d4' : '#8b5cf6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Healthy resumes concentrate 40%+ of keywords in Experience and 20%+ in Projects rather than only in Skills lists.
          </p>
        </div>
      )}

      {/* 3. Accessible Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium">
              <tr>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3 text-center">Total Required</th>
                <th className="py-2 px-3 text-center">Matched</th>
                <th className="py-2 px-3 text-center">Missing</th>
                <th className="py-2 px-3 text-center">Coverage Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {categoryBreakdown.map((cat, idx) => {
                const rate = cat.total > 0 ? Math.round((cat.matched / cat.total) * 100) : 0;
                return (
                  <tr key={cat.category + idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-medium text-white">{cat.category}</td>
                    <td className="py-2 px-3 text-center font-mono">{cat.total}</td>
                    <td className="py-2 px-3 text-center font-mono text-emerald-400">{cat.matched}</td>
                    <td className="py-2 px-3 text-center font-mono text-rose-400">{cat.missing}</td>
                    <td className="py-2 px-3 text-center font-mono">
                      <span className={rate >= 70 ? 'text-emerald-400' : rate >= 40 ? 'text-amber-400' : 'text-rose-400'}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KeywordDistributionCharts;
