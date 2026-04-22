import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Loader from '../components/ui/Loader';
import { generateReport } from '../api/reportApi';

const Report = () => {
  const { id } = useParams(); // analysisId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    executiveSummary: "Pending generation...",
    atsEvaluation: "Pending evaluation...",
    strengths: [],
    weaknesses: [],
    resumeQualityReview: "Pending review...",
    jdAlignmentReview: "Pending alignment...",
    recommendedImprovements: [],
    suggestedActionPlan: []
  });

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data } = await generateReport(id);
        setReportData(data);
      } catch (err) {
        console.error("Failed to generate report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  return (
    <>
      <Navbar />
      <PageContainer>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
             <Loader text="Generating Gemini AI Report..." />
          </div>
        ) : (
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: 16 }}>
                <Sparkles size={14} /> AI Generated Report
              </div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 16, color: 'var(--color-text)' }}>
                Deep Analysis Report
              </h1>
              <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 800 }}>
                {reportData.executiveSummary}
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
              <SectionCard title="ATS Evaluation" content={reportData.atsEvaluation} delay={0.1} />
              <SectionCard title="Quality & Alignment" content={`${reportData.resumeQualityReview} \n\n${reportData.jdAlignmentReview}`} delay={0.2} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
              <ListCard title="Identified Strengths" items={reportData.strengths} icon={<CheckCircle2 color="#10b981" size={18} />} delay={0.3} />
              <ListCard title="Identified Weaknesses" items={reportData.weaknesses} icon={<AlertTriangle color="#ef4444" size={18} />} delay={0.4} />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass" style={{ padding: 32 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text)' }}>
                <Lightbulb color="#f59e0b" /> Recommended Action Plan
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reportData.suggestedActionPlan.map((plan, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 16, padding: 20, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <span style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>{plan}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </PageContainer>
    </>
  );
};

const SectionCard = ({ title, content, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass" style={{ padding: 28 }}>
    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>{title}</h3>
    <p style={{ color: 'var(--color-muted)', whiteSpace: 'pre-line', lineHeight: 1.65, fontSize: '0.95rem' }}>{content}</p>
  </motion.div>
);

const ListCard = ({ title, items, icon, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass" style={{ padding: 28 }}>
    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24, color: 'var(--color-text)' }}>{title}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ marginTop: 2 }}>{icon}</div>
          <span style={{ color: 'var(--color-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{item}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

export default Report;
