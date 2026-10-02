import { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ChevronRight, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

const priorityBadges = {
  Critical: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  High:     { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  Medium:   { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  Low:      { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e', border: 'rgba(34,197,94,0.3)' }
};

const evidenceBadges = {
  quantified: { label: 'Quantified', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  experience: { label: 'Experience', bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' },
  project:    { label: 'Project',    bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  mentioned:  { label: 'Mentioned',  bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  none:       { label: 'None',       bg: 'rgba(239,68,68,0.15)', color: '#ef4444' }
};

const SkillGapTable = ({ prioritizedSkills = [], onSelectForSimulation }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortField, setSortField] = useState('priorityScore');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(prioritizedSkills.map(s => s.category));
    return ['all', ...Array.from(set)];
  }, [prioritizedSkills]);

  const filteredSkills = useMemo(() => {
    return prioritizedSkills
      .filter(s => {
        const matchesSearch = s.skill.toLowerCase().includes(search.toLowerCase()) ||
                              s.category.toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
        const matchesPrio = priorityFilter === 'all' || s.priorityLabel === priorityFilter;
        return matchesSearch && matchesCat && matchesPrio;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [prioritizedSkills, search, categoryFilter, priorityFilter, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            Comprehensive Skill-Gap & Prioritization Ledger
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Deterministic ranking of role requirements against verified resume proof
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--color-text)',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {categories.map(c => (
              <option key={c} value={c} style={{ background: '#111827' }}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--color-text)',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all" style={{ background: '#111827' }}>All Priorities</option>
            <option value="Critical" style={{ background: '#111827' }}>Critical Only</option>
            <option value="High" style={{ background: '#111827' }}>High Only</option>
            <option value="Medium" style={{ background: '#111827' }}>Medium Only</option>
            <option value="Low" style={{ background: '#111827' }}>Low Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-muted)' }}>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => toggleSort('skill')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Skill <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '10px 12px' }}>Category</th>
              <th style={{ padding: '10px 12px' }}>Resume Evidence</th>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => toggleSort('roleImportance')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Importance <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => toggleSort('marketDemand')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Demand <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => toggleSort('priorityScore')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Priority <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '10px 12px' }}>Action & Evidence Target</th>
              <th style={{ padding: '10px 12px' }}>Effort</th>
              {onSelectForSimulation && <th style={{ padding: '10px 12px' }}>Simulate</th>}
            </tr>
          </thead>
          <tbody>
            {filteredSkills.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted)' }}>
                  No skills matched the active filter criteria.
                </td>
              </tr>
            ) : (
              filteredSkills.map(s => {
                const pStyle = priorityBadges[s.priorityLabel] || priorityBadges.Medium;
                const evStyle = evidenceBadges[s.currentEvidenceLevel] || evidenceBadges.none;

                return (
                  <tr
                    key={s.skill}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.15s'
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{s.skill}</span>
                        {s.expectedContribution > 0 && (
                          <span style={{ fontSize: '0.68rem', color: '#22c55e', fontWeight: 700 }}>
                            +{s.expectedContribution}pts
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-muted)' }}>{s.category}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700,
                        background: evStyle.bg, color: evStyle.color
                      }}>
                        {evStyle.label} ({s.currentEvidenceScore})
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{s.roleImportance}/100</td>
                    <td style={{ padding: '12px', color: 'var(--color-muted)' }}>{s.marketDemand}%</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
                        background: pStyle.bg, color: pStyle.text, border: `1px solid ${pStyle.border}`
                      }}>
                        {s.priorityLabel} ({s.priorityScore})
                      </span>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '240px', color: '#cbd5e1' }}>
                      <div style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.suggestedAction}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Proof: {s.evidenceToProduce}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                      {s.estimatedEffort}
                    </td>
                    {onSelectForSimulation && (
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => onSelectForSimulation(s.skill)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(99,102,241,0.4)',
                            background: 'rgba(99,102,241,0.15)',
                            color: '#818cf8',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          + Simulate
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkillGapTable;
