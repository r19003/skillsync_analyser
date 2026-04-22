import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { uploadResume } from '../api/resumeApi';
import { createAnalysis } from '../api/analysisApi';

// ── Step indicator ────────────────────────────────────────────────────────────
const StepBar = ({ current }) => {
  const steps = ['Upload PDF', 'Paste Job Description', 'Analyzing...'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '36px' }}>
      {steps.map((label, i) => {
        const done = current > i;
        const active = current === i;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#22c55e' : active ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : 'rgba(255,255,255,0.06)',
                border: active ? 'none' : done ? 'none' : '1px solid rgba(255,255,255,0.1)',
                fontWeight: 700, fontSize: '0.85rem', color: done || active ? '#fff' : 'var(--color-muted)',
                transition: 'all 0.3s',
              }}>
                {done ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.72rem', color: active ? 'var(--color-primary-light)' : done ? '#22c55e' : 'var(--color-muted)', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#22c55e' : 'rgba(255,255,255,0.06)', margin: '0 8px', marginBottom: '22px', transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Drag-and-drop upload box ──────────────────────────────────────────────────
const UploadBox = ({ file, onFile, onRemove }) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') onFile(dropped);
    else toast.error('Please drop a PDF file only.');
  }, [onFile]);

  const handleChange = (e) => {
    const picked = e.target.files[0];
    if (picked) onFile(picked);
  };

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '16px', padding: '28px', display: 'flex', alignItems: 'center', gap: '16px',
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={22} color="#22c55e" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>{(file.size / 1024).toFixed(0)} KB · PDF</p>
        </div>
        <button onClick={onRemove} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '7px', color: '#ef4444', cursor: 'pointer', display: 'flex' }}>
          <X size={14} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.label
      htmlFor="resume-upload"
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      animate={{ borderColor: dragging ? '#6366f1' : 'rgba(255,255,255,0.12)', background: dragging ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)' }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '14px', padding: '48px 32px', borderRadius: '16px', cursor: 'pointer',
        border: '2px dashed rgba(255,255,255,0.12)', transition: 'all 0.2s',
      }}
    >
      <motion.div
        animate={{ y: dragging ? -6 : 0 }} transition={{ type: 'spring', stiffness: 300 }}
        style={{ width: 60, height: 60, borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Upload size={26} color="#818cf8" />
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: '4px' }}>
          {dragging ? 'Release to upload' : 'Drag & drop your resume'}
        </p>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>or <span style={{ color: '#818cf8', fontWeight: 600 }}>browse files</span> · PDF only · max 5MB</p>
      </div>
      <input id="resume-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleChange} />
    </motion.label>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const UploadResume = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [jdError, setJdError] = useState('');

  // Step 0 → upload file
  const handleUpload = async () => {
    if (!file) { toast.error('Please select a PDF file first.'); return; }
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const { data } = await uploadResume(fd);
      setResumeId(data.resume.id);
      toast.success('Resume uploaded and parsed! 🎉');
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Step 1 → analyze
  const handleAnalyze = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      setJdError('Job description must be at least 50 characters.'); return;
    }
    setJdError('');
    setAnalyzeLoading(true);
    setStep(2);
    try {
      const { data } = await createAnalysis({ resumeId, jobDescription });
      toast.success('Analysis complete! 🚀');
      navigate(`/analysis/${data.analysis._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Try again.');
      setStep(1);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <PageContainer>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {/* Page heading */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '6px' }}>
              Analyze Your Resume
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              Upload your PDF and paste a job description to get your ATS score and personalized feedback.
            </p>
          </motion.div>

          {/* Step indicator */}
          <StepBar current={step} />

          {/* Card */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '32px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={17} color="#818cf8" />
                  </div>
                  <h2 style={{ color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: 700 }}>Upload Resume PDF</h2>
                </div>
                <UploadBox file={file} onFile={setFile} onRemove={() => setFile(null)} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <Button onClick={handleUpload} loading={uploadLoading} disabled={!file}>
                    Continue <ArrowRight size={15} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '32px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={17} color="#06b6d4" />
                  </div>
                  <h2 style={{ color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: 700 }}>Paste Job Description</h2>
                </div>

                {/* Uploaded file reminder */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', marginBottom: '20px' }}>
                  <CheckCircle size={15} color="#22c55e" />
                  <p style={{ color: '#22c55e', fontSize: '0.82rem', fontWeight: 500 }}>Resume uploaded: {file?.name}</p>
                </div>

                <Input
                  label="Job Description"
                  textarea
                  rows={10}
                  placeholder="Paste the full job description here. Include the required skills, responsibilities, and qualifications sections for best results. Minimum 50 characters required."
                  value={jobDescription}
                  onChange={e => { setJobDescription(e.target.value); if (jdError) setJdError(''); }}
                  error={jdError}
                />
                <p style={{ color: 'var(--color-muted)', fontSize: '0.78rem', marginTop: '6px' }}>
                  {jobDescription.length} characters {jobDescription.length < 50 && `(need ${50 - jobDescription.length} more)`}
                </p>

                {/* Tip */}
                <div style={{ display: 'flex', gap: '8px', padding: '12px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', marginTop: '16px' }}>
                  <AlertCircle size={15} color="#818cf8" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ color: '#818cf8', fontSize: '0.8rem' }}>
                    Tip: Include the full JD with required skills and responsibilities for the most accurate ATS score.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
                  <Button onClick={handleAnalyze} loading={analyzeLoading}>
                    Run Analysis <ArrowRight size={15} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '60px 32px', textAlign: 'center' }}
              >
                <Loader size={52} text="Analyzing your resume against the job description..." />
                <p style={{ color: 'var(--color-muted)', fontSize: '0.82rem', marginTop: '16px' }}>
                  Parsing skills · Computing ATS score · Generating feedback
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageContainer>
    </>
  );
};

export default UploadResume;
