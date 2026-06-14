import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Trophy } from "lucide-react";
import { QuizQuestion } from "../types";

interface QuizSectionProps {
  onEarnCredits: (amount: number) => void;
}

export default function QuizSection({ onEarnCredits }: QuizSectionProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  async function fetchQuizQuestions() {
    try {
      setLoading(true);
      setQuizDone(false);
      setCurrentIndex(0);
      setScore(0);
      setAnswered(false);
      setSelectedOption(null);

      const res = await fetch("/api/quiz");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error("Failed to load quiz module:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

  const handleSelectOption = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || answered) return;
    setAnswered(true);

    const q = questions[currentIndex];
    const isCorrect = selectedOption === q.correctIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
      // Earn credits immediately!
      onEarnCredits(100);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setQuizDone(true);
    }
  };

  return (
    <div className="bg-[#12141A] p-6 rounded-3xl border border-white/5 shadow-2xl min-h-[380px] flex flex-col justify-between">
      <div>
        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <HelpCircle className="h-5 w-5 animate-pulse" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">Climate CO₂ Quiz Arena</h2>
              <p className="text-xs text-slate-400">Answer ecological questions to learn and acquire funding.</p>
            </div>
          </div>

          <button
            onClick={fetchQuizQuestions}
            title="Reload questions"
            className="p-2 rounded-xl border border-white/5 bg-[#1A1D24] text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400">Generating dynamic questions with Gemini AI...</p>
          </div>
        ) : quizDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
              <Trophy className="h-8 w-8 animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-white">Quiz Completed!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                You correctly answered <b className="text-white">{score} out of {questions.length}</b> questions, claiming a total of <strong className="text-emerald-400 font-mono">+{score * 100} Credits</strong>!
              </p>
            </div>

            <div className="pt-4">
              <button
                id="retry-quiz-btn"
                onClick={fetchQuizQuestions}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-97 cursor-pointer uppercase tracking-wider"
              >
                Launch Brand New Quiz
              </button>
            </div>
          </motion.div>
        ) : questions.length > 0 ? (
          <div className="space-y-5">
            {/* Question Counter Header */}
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>QUESTION {currentIndex + 1} OF {questions.length}</span>
              <span className="text-emerald-400 font-bold">+100 Credits target Reward</span>
            </div>

            {/* Main Question Body */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <h3 className="font-sans text-xs md:text-sm font-light text-slate-100 leading-relaxed">
                {questions[currentIndex].question}
              </h3>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions[currentIndex].options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = questions[currentIndex].correctIndex === idx;
                
                let btnStyle = "border-white/5 bg-[#1A1D24] text-slate-300 hover:border-slate-700";
                if (isSelected) btnStyle = "border-amber-500 bg-amber-550/5 text-amber-300";
                
                if (answered) {
                  if (isCorrect) {
                     btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-350 text-emerald-350 pointer-events-none font-semibold";
                  } else if (isSelected) {
                    btnStyle = "border-rose-500 bg-rose-500/10 text-rose-350 pointer-events-none";
                  } else {
                    btnStyle = "border-white/5 bg-[#1A1D24]/40 text-slate-500 pointer-events-none";
                  }
                }

                return (
                  <button
                    key={idx}
                    id={`quiz-option-${currentIndex}-${idx}`}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {answered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                    {answered && isSelected && !isCorrect && <AlertCircle className="h-4 w-4 text-rose-450 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation explanation panel */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed space-y-1.5"
                >
                  <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Scientific Context:</span>
                  </div>
                  <p>{questions[currentIndex].explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="h-8 w-8 mx-auto text-red-400/80 mb-2" />
            <p className="text-sm">Questions were unable to be retrieved. Please check API connections.</p>
          </div>
        )}
      </div>

      {/* Nav footer inside card */}
      {!loading && !quizDone && questions.length > 0 && (
        <div className="mt-6 pt-3 border-t border-white/5 flex justify-end">
          {answered ? (
            <button
              id="quiz-next-question-btn"
              onClick={handleNext}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-97 cursor-pointer uppercase tracking-wider"
            >
              {currentIndex + 1 === questions.length ? "Finish Arena" : "Continue"}
            </button>
          ) : (
            <button
              id="quiz-submit-answer-btn"
              disabled={selectedOption === null}
              onClick={handleSubmitAnswer}
              className={`rounded-xl px-5 py-2.5 text-xs font-mono font-bold transition-all uppercase tracking-wider ${
                selectedOption === null
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-500 text-slate-950 hover:brightness-110 cursor-pointer shadow-md shadow-emerald-500/25"
              }`}
            >
              Unlock Answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
