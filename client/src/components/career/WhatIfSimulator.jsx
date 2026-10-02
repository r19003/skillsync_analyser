import { useState } from 'react';
import { Sparkles, TrendingUp, ArrowRight, CheckCircle2, RotateCcw, Zap } from 'lucide-react';
import { runWhatIfSimulation } from '../../api/careerAnalyticsApi';
import toast from 'react-hot-toast';

const WhatIfSimulator = ({ analysisId, prioritizedSkills = [], onSimulationSuccess }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projection, setProjection] = useState(null);

  // Available skills to simulate (missing or weak)
  const candidateSkills = prioritizedSkills
    .filter(s => s.currentEvidenceScore < 85)
    .slice(0, 16);

  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      if (selectedSkills.length >= 8) {
        toast.error('You can simulate up to 8 skills at a time for realistic projections.');
        return;
      }
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleSimulate = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least 1 skill to simulate.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await runWhatIfSimulation(analysisId, { selectedSkills });
      setProjection(data.simulation);
      toast.success('What-If projection recalculated successfully!');
      if (onSimulationSuccess) onSimulationSuccess(data.simulation);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setSelectedSkills([]);
    setProjection(null);
  };

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '28px', border: '1px solid rgba(99,102,241,0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              What-If Readiness Simulator & Skill ROI Engine
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Select candidate skills to simulate verified project deliverable completion and forecast role fit uplift
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedSkills.length > 0 && (
            <button
              onClick={resetSimulation}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--color-muted)', fontSize: '0.78rem', cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}

          <button
            onClick={handleSimulate}
            disabled={loading || selectedSkills.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
              cursor: loading || selectedSkills.length === 0 ? 'not-allowed' : 'pointer',
              opacity: loading || selectedSkills.length === 0 ? 0.6 : 1
            }}
          >
            {loading ? 'Recalculating...' : `Forecast Uplift (${selectedSkills.length})`}
          </button>
        </div>
      </div>

      {/* Skill Chips Picker */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '0.76rem', color: 'var(--color-muted)', marginBottom: '8px', fontWeight: 600 }}>
          SELECT SKILLS TO LEARN OR DEMONSTRATE:
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {candidateSkills.map(skill => {
            const isSelected = selectedSkills.includes(skill.skill);
            return (
              <button
                key={skill.skill}
                onClick={() => toggleSkill(skill.skill)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                  border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  color: isSelected ? '#a5b4fc' : 'var(--color-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isSelected && <CheckCircle2 size={13} color="#22c55e" />}
                <span>{skill.skill}</span>
                <span style={{ fontSize: '0.68rem', color: isSelected ? '#818cf8' : '#64748b' }}>
                  +{skill.expectedContribution}pts
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projection Display */}
      {projection && (
        <div style={{
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '14px',
          padding: '20px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📊 Forecast Projection Summary
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
              *Deterministic simulation based on target project evidence
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* Role Fit Delta */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                Role Fit / JD Match
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem', color: '#94a3b8', fontWeight: 600 }}>
                  {projection.baselineRoleFit}
                </span>
                <ArrowRight size={14} color="#818cf8" />
                <span style={{ fontSize: '1.6rem', color: '#22c55e', fontWeight: 800 }}>
                  {projection.projectedRoleFit}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e' }}>
                  (+{projection.roleFitDelta} pts)
                </span>
              </div>
            </div>

            {/* Overall Readiness Delta */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                Overall Career Readiness
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem', color: '#94a3b8', fontWeight: 600 }}>
                  {projection.baselineReadiness}
                </span>
                <ArrowRight size={14} color="#818cf8" />
                <span style={{ fontSize: '1.6rem', color: '#06b6d4', fontWeight: 800 }}>
                  {projection.projectedReadiness}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4' }}>
                  (+{projection.readinessDelta} pts)
                </span>
              </div>
            </div>

            {/* Mandatory Coverage Delta */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                Mandatory Skill Coverage
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem', color: '#94a3b8', fontWeight: 600 }}>
                  {projection.coverageBefore}%
                </span>
                <ArrowRight size={14} color="#818cf8" />
                <span style={{ fontSize: '1.6rem', color: '#a855f7', fontWeight: 800 }}>
                  {projection.coverageAfter}%
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a855f7' }}>
                  (+{projection.coverageDelta}%)
                </span>
              </div>
            </div>
          </div>

          {/* Documented Assumptions */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <p style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Documented Methodological Assumptions:</p>
            <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: 1.5 }}>
              {projection.assumptions?.map((asmp, i) => (
                <li key={i}>{asmp}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfSimulator;
