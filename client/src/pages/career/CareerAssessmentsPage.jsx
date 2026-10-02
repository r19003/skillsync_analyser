import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, ShieldCheck, Sparkles, AlertCircle, RefreshCw,
  HelpCircle
} from 'lucide-react';
import CareerWorkspaceLayout from '../../components/career/workspace/CareerWorkspaceLayout';
import careerWorkspaceApi from '../../api/careerWorkspaceApi';
import Button from '../../components/ui/Button';

const CareerAssessmentsPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [roleTrack, setRoleTrack] = useState('Software Engineer');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Available assessment tracks based on role
  const sweTopics = [
    { id: 'Data Structures and Algorithms', label: 'Data Structures & Algorithms', desc: 'Two Pointers, Hash Maps, Dynamic Programming, and Graph Traversals.' },
    { id: 'Operating Systems and Concurrency', label: 'Operating Systems & Concurrency', desc: 'Processes, Threads, Virtual Memory, Deadlocks, and Context Switching.' },
    { id: 'Database Management Systems', label: 'DBMS & Query Optimization', desc: 'ACID transactions, B-Tree indexing, Normalization, and Isolation Levels.' },
    { id: 'System Design & REST APIs', label: 'System Design & REST APIs', desc: 'Microservices, Caching strategies, Load balancing, and Idempotency.' },
  ];

  const baTopics = [
    { id: 'SQL', label: 'SQL Querying & Joins', desc: 'Multi-table JOINs, GROUP BY aggregations, Window functions, and Subqueries.' },
    { id: 'Requirements Gathering', label: 'Requirements Elicitation & BPMN', desc: 'User stories, Acceptance criteria, Process mapping, and Stakeholder alignment.' },
    { id: 'KPI Reporting & Dashboards', label: 'KPI Reporting & Analytics', desc: 'Metric definitions, Cohort analysis, Trend visualization, and Executive decks.' },
    { id: 'Agile and Scrum', label: 'Agile & Product Delivery', desc: 'Sprint rituals, Backlog grooming, Estimation techniques, and Velocity tracking.' },
  ];

  // Fetch initial role and default questions
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const res = await careerWorkspaceApi.getOverview(analysisId);
        if (isMounted && res.data?.success) {
          const role = res.data.targetRole || 'Software Engineer';
          setRoleTrack(role);
          const isSweTrack = role.toLowerCase().includes('software');
          const initialSkill = isSweTrack ? 'Data Structures and Algorithms' : 'SQL';
          setSelectedSkill(initialSkill);

          setIsLoadingQuestions(true);
          const qRes = await careerWorkspaceApi.getAssessmentQuestions(analysisId, initialSkill);
          if (isMounted && qRes.data?.success) {
            setQuestions(qRes.data.questions || []);
          }
        }
      } catch (err) {
        console.error('Fetch role for assessment error:', err);
        if (isMounted) setLoadError(err.response?.data?.message || 'Failed to load assessment questions.');
      } finally {
        if (isMounted) setIsLoadingQuestions(false);
      }
    };
    if (analysisId) fetchInitialData();
    return () => { isMounted = false; };
  }, [analysisId]);

  // Load questions when user clicks a topic
  const loadSkillAssessment = async (skill) => {
    setSelectedSkill(skill);
    setIsLoadingQuestions(true);
    setLoadError(null);
    setAssessmentResult(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const res = await careerWorkspaceApi.getAssessmentQuestions(analysisId, skill);
      if (res.data?.success) {
        setQuestions(res.data.questions || []);
      }
    } catch (err) {
      console.error('Load questions error:', err);
      setLoadError(err.response?.data?.message || 'Failed to load assessment questions.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    try {
      const res = await careerWorkspaceApi.submitAssessment(analysisId, {
        skill: selectedSkill,
        answers: userAnswers
      });
      if (res.data?.success) {
        setAssessmentResult(res.data.result);
      }
    } catch (err) {
      console.error('Submit assessment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSwe = roleTrack.toLowerCase().includes('software');
  const availableTopics = isSwe ? sweTopics : baTopics;

  const currentQ = questions[currentQuestionIndex];
  const allAnswered = questions.length > 0 && questions.every(q => userAnswers[q.id] !== undefined);

  return (
    <CareerWorkspaceLayout
      title="Diagnostic Skill Assessments"
      subtitle="Role-specific benchmark evaluations to replace unassessed proxies with calibrated evidence and interview readiness."
    >
      <div className="space-y-6">
        {/* Topic Selector Ribbon */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.06] gap-2">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                {isSwe ? 'Software Engineering Diagnostics' : 'Business Analysis Diagnostics'}
              </span>
              <span className="text-xs text-slate-400">
                Choose a competency area to evaluate your baseline mastery
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full font-medium w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deterministic Calibration Engine</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {availableTopics.map((topic) => {
              const isActive = selectedSkill === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => loadSkillAssessment(topic.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10'
                      : 'border-white/[0.07] bg-[#162033] hover:bg-[#1e2a42] hover:border-white/[0.15]'
                  }`}
                >
                  <div className={`text-sm font-bold mb-1 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {topic.label}
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoadingQuestions && (
          <div className="flex items-center justify-center min-h-[320px] bg-[#111827] rounded-2xl border border-white/[0.08] shadow-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Loading benchmark questions...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {loadError && !isLoadingQuestions && (
          <div className="p-8 rounded-2xl bg-[#111827] border border-rose-500/30 text-center space-y-3 shadow-lg">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Unable to load questions</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">{loadError}</p>
            <div className="pt-2">
              <Button size="sm" onClick={() => loadSkillAssessment(selectedSkill)}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Assessment In Progress */}
        {!isLoadingQuestions && !assessmentResult && questions.length > 0 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] gap-3">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Evaluating Competency:</span>
                <h3 className="text-lg font-bold text-white">{selectedSkill}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">
                  Question <span className="font-bold text-white text-sm">{currentQuestionIndex + 1}</span> of {questions.length}
                </span>
                <div className="flex items-center gap-1.5">
                  {questions.map((q, idx) => {
                    const answered = userAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <div
                        key={q.id}
                        className={`w-3 h-3 rounded-full transition-all ${
                          answered
                            ? 'bg-indigo-500'
                            : isCurrent
                              ? 'bg-indigo-500/40 ring-2 ring-indigo-500/30'
                              : 'bg-white/[0.08]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Question Body */}
            {currentQ && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {currentQ.category || 'Core Benchmark'}
                    </span>
                    {currentQ.difficulty && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                        currentQ.difficulty === 'advanced'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : currentQ.difficulty === 'intermediate'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {currentQ.difficulty}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                    {currentQ.questionText || currentQ.question || currentQ.prompt || currentQ.title}
                  </h4>

                  {/* Scenario context if present */}
                  {(currentQ.scenario || currentQ.description) && (
                    <div className="p-3.5 rounded-xl bg-[#162033]/60 border border-white/[0.08] text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-indigo-400 mr-1.5">Scenario:</span>
                      {currentQ.scenario || currentQ.description}
                    </div>
                  )}

                  {/* Code snippet or context block if present */}
                  {(currentQ.codeSnippet || currentQ.context || currentQ.snippet) && (
                    <pre className="p-4 rounded-xl bg-[#0a0f1e] border border-white/[0.08] text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
                      {currentQ.codeSnippet || currentQ.context || currentQ.snippet}
                    </pre>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {(currentQ.options || []).map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQ.id] === optIdx;
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 select-none ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-md shadow-indigo-500/10'
                            : 'border-white/[0.07] bg-[#162033] hover:bg-[#1e2a42] hover:border-white/[0.15] text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white/[0.05] border border-white/[0.1] text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="text-sm leading-relaxed pt-0.5">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="text-slate-400 hover:text-white"
                  >
                    Previous Question
                  </Button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!allAnswered || isSubmitting}
                      onClick={handleSubmitAssessment}
                      className="flex items-center gap-2 px-6 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      <span>{isSubmitting ? 'Evaluating...' : 'Submit Assessment'}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assessment Results Screen */}
        {assessmentResult && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-xl space-y-6">
            {/* Score Banner */}
            <div className="p-6 rounded-2xl bg-[#162033] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold shrink-0 shadow-lg ${
                  assessmentResult.scorePercentage >= 70
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/10'
                }`}>
                  {assessmentResult.scorePercentage}%
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">
                      {assessmentResult.scorePercentage >= 70 ? 'Proficiency Verified' : 'Practice Recommended'}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e2a42] text-slate-300 border border-white/[0.08]">
                      {assessmentResult.skill}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    {assessmentResult.feedback || 'Your score has been registered and directly updated your career skill mastery score.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSkillAssessment(selectedSkill)}
                  className="w-full sm:w-auto text-slate-300 hover:text-white border-white/[0.1]"
                >
                  Retake Test
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(`/career/${analysisId}/skills`)}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  View Updated Gaps
                </Button>
              </div>
            </div>

            {/* Mastery Gain Notice */}
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-xs text-slate-200">
                <span className="font-semibold text-indigo-400">Mastery Calibration Active: </span>
                This score directly increases your interview readiness calculation, replacing unassessed proxies with hard evidence.
              </div>
            </div>

            {/* Answer Breakdown & Explanations */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Detailed Review & Explanations</h4>
              {(assessmentResult.breakdown || []).map((item, idx) => {
                const isCorrect = item.isCorrect;
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-xl border ${
                      isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-white">
                          Question {idx + 1}: {item.prompt}
                        </div>
                        <div className="text-xs text-slate-300">
                          <span className="text-slate-400">Your Answer: </span>
                          <span className={isCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {item.userAnswerText || 'Option ' + (item.userAnswer + 1)}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="text-xs text-slate-300">
                            <span className="text-slate-400">Correct Answer: </span>
                            <span className="text-emerald-400 font-semibold">
                              {item.correctAnswerText || 'Option ' + (item.correctAnswer + 1)}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                          <span className="font-medium text-slate-300">Explanation: </span>
                          {item.explanation || 'Concepts tested directly evaluate role readiness and industry interview expectations.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state if no questions */}
        {!isLoadingQuestions && !assessmentResult && questions.length === 0 && (
          <div className="text-center py-16 bg-[#111827] rounded-2xl border border-white/[0.08] shadow-lg">
            <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No diagnostic questions found</h3>
            <p className="text-xs text-slate-400">Select another skill topic from the ribbon above.</p>
          </div>
        )}
      </div>
    </CareerWorkspaceLayout>
  );
};

export default CareerAssessmentsPage;
