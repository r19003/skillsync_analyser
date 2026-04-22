import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Search, Upload, GitCompare, ChevronRight, Award, Trophy, ListChecks, CheckCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { getMyResumes } from '../api/resumeApi';
import { runMultiComparison } from '../api/multiCompareApi';
import toast from 'react-hot-toast';

const MultiCompare = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data } = await getMyResumes();
        setResumes(data.resumes || []);
      } catch (err) {
        toast.error('Failed to load resumes');
      } finally {
        setFetching(false);
      }
    };
    fetchResumes();
  }, []);

  const toggleResume = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 3) {
        toast.error('You can compare a maximum of 3 resumes at once.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return toast.error('Select at least 2 resumes to compare');
    if (jobDescription.trim().length < 50) return toast.error('Please enter a valid job description');

    setLoading(true);
    setResult(null);
    try {
      const { data } = await runMultiComparison({ resumeIds: selectedIds, jobDescription });
      setResult(data);
      toast.success('Simulation complete!');
    } catch(err) {
      toast.error(err.response?.data?.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <>
      <Navbar />
      <PageContainer>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <GitCompare size={20} color="#06b6d4" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Multi-Resume Analysis</h1>
          </div>
          <p style={{ color: 'var(--color-muted)' }}>Find out which resume version performs best against a specific job.</p>
        </div>

        {!result ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            
            {/* Step 1: Resumes */}
            <div className="glass" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff' }}>1</span>
                Select Resumes (2-3)
              </h2>
              {fetching ? <Loader text="Loading resumes..." /> : resumes.length < 2 ? (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 12, textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: 12 }}>You need at least 2 uploaded resumes to run a comparison.</p>
                  <Button size="sm" onClick={() => window.location.href='/upload'}><Upload size={14}/> Go to Uploads</Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {resumes.map(r => (
                    <div 
                      key={r._id} 
                      onClick={() => toggleResume(r._id)}
                      style={{ 
                        padding: 16, borderRadius: 12, border: '1px solid',
                        borderColor: selectedIds.includes(r._id) ? 'var(--color-primary)' : 'var(--color-border)',
                        background: selectedIds.includes(r._id) ? 'rgba(99,102,241,0.1)' : 'var(--color-surface)',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.originalFileName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Uploaded {new Date(r.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ 
                        width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                        borderColor: selectedIds.includes(r._id) ? 'var(--color-primary)' : 'var(--color-muted)',
                        background: selectedIds.includes(r._id) ? 'var(--color-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                       }}>
                         {selectedIds.includes(r._id) && <CheckCircle size={12} color="#fff" />}
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: JD & Submit */}
            <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff' }}>2</span>
                Paste Job Description
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting here..."
                style={{ 
                  flex: 1, minHeight: 200, padding: 16, borderRadius: 12, 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', 
                  color: 'var(--color-text)',fontFamily: 'inherit', resize: 'vertical'
                }}
              />
              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <Button loading={loading} onClick={handleCompare} disabled={selectedIds.length < 2 || !jobDescription.trim()}>
                  <Search size={16} /> Run Comparison Engine
                </Button>
              </div>
            </div>

          </div>
        ) : (
          /* Results View */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Comparison Results for: <span style={{ color: 'var(--color-secondary)' }}>{result.jobRole || 'Target Role'}</span></h2>
              <Button variant="ghost" size="sm" onClick={() => setResult(null)}>Run Another</Button>
            </div>

            <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 24 }}>
              {result.results.map((res, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  key={res.resumeId} 
                  className="glass" 
                  style={{ 
                    flex: 1, minWidth: 320, padding: 24, position: 'relative',
                    borderColor: i === 0 ? '#10b981' : 'var(--color-border)',
                    boxShadow: i === 0 ? '0 0 30px rgba(16,185,129,0.15)' : 'none'
                  }}
                >
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #10b981, #059669)', padding: '4px 16px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, color: '#fff', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
                      <Trophy size={14} /> BEST MATCH
                    </div>
                  )}

                  <div style={{ textAlign: 'center', paddingBottom: 20, borderBottom: '1px solid var(--color-border)', marginBottom: 20, marginTop: i === 0 ? 10 : 0 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4, color: i === 0 ? '#10b981' : 'var(--color-text)' }}>{res.resumeName}</h3>
                    <div style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      Rank: {res.rank}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>ATS Score</p>
                      <p style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor(res.atsScore) }}>{res.atsScore}</p>
                    </div>
                    <div style={{ width: 1, background: 'var(--color-border)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Alignment</p>
                      <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>{res.matchPercentage}%</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ListChecks size={14} color="#10b981" /> Strengths
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {res.strengths?.slice(0, 3).map((s, idx) => (
                        <li key={idx} style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'flex', gap: 6 }}><CheckCircle size={12} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} /> {s}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Target size={14} color="#ef4444" /> Missing Key Skills
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {res.missingSkills?.length > 0 ? res.missingSkills.slice(0, 5).map(skill => (
                        <span key={skill} style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 4 }}>
                          {skill}
                        </span>
                      )) : <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>None - Excellent Coverage!</span>}
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>

          </motion.div>
        )}
      </PageContainer>
    </>
  );
};

export default MultiCompare;
