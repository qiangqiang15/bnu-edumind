"use client";

import { useState, useEffect, use, useRef } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { ArrowRight, CheckCircle2, Loader2, Lock, AlertCircle, CornerDownLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 
import { toast } from "sonner"; 

export default function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: assessmentId } = use(params);

  const [questions, setQuestions] = useState<any[]>([]); 
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true); 
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({}); 
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textInput, setTextInput] = useState(""); 
  
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsCheckingAuth(false);
      if (user) loadQuestions();
    };
    init();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) setQuestions(data);
      else toast.error("该测评暂无题目");
    } catch (err: any) {
      toast.error("题目加载失败", { description: err.message });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // --- 核心逻辑：判断题目是否应该显示 ---
  const shouldShowQuestion = (question: any, currentAnswers: Record<string, any>) => {
    // 如果没有逻辑限制，直接显示
    if (!question.logic || !question.logic.dependency) return true;
    
    const { target_order_index, trigger_value } = question.logic.dependency;
    
    // 找到依赖的那道题 (比如 Q57)
    const targetQuestion = questions.find(q => q.order_index === target_order_index);
    if (!targetQuestion) return true; // 如果找不到依赖题，默认显示，防死锁

    // 找到用户对那道题的回答
    const targetAnswer = currentAnswers[targetQuestion.id];
    
    // 检查回答是否匹配 (比如 "B")
    // 注意：我们存的 answer 是一个对象 { label: "A", text: "...", ... }
    return targetAnswer?.label === trigger_value;
  };

  // --- 核心逻辑：计算下一题的索引 ---
  const getNextQuestionIndex = (startIndex: number, currentAnswers: Record<string, any>) => {
    let nextIndex = startIndex;
    while (nextIndex < questions.length) {
      if (shouldShowQuestion(questions[nextIndex], currentAnswers)) {
        return nextIndex;
      }
      nextIndex++;
    }
    return -1; // 没有题了，结束
  };

  useEffect(() => {
    if (questions.length === 0) return;
    const p = ((currentQuestionIndex + 1) / questions.length) * 100;
    setProgress(isFinished ? 100 : p - (100 / questions.length / 2)); 
    setTextInput("");
    if (questions[currentQuestionIndex]?.type === 'text') {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentQuestionIndex, isFinished, questions.length]);

  const calculateAndSave = async (finalAnswers: Record<string, any>) => {
    if (!user) return;
    setIsSaving(true);

    try {
      let totalScore = 0;
      const dimensionScores: Record<string, number> = {};

      questions.forEach(q => {
        const val = finalAnswers[q.id];
        if (q.type === 'choice' && val && typeof val === 'object') {
          const score = val.score || 0;
          const dim = val.dimension || 'general';
          totalScore += score;
          if (!dimensionScores[dim]) dimensionScores[dim] = 0;
          dimensionScores[dim] += score;
        }
      });

      const { error } = await supabase
        .from('assessment_records')
        .insert({
          user_id: user.id,
          assessment_id: assessmentId,
          answers: finalAnswers,
          score: totalScore,
          ai_analysis: JSON.stringify(dimensionScores) 
        });

      if (error) throw error;
      toast.success("测评完成！已保存。");
    } catch (error: any) {
      toast.error("保存失败，请检查网络");
    } finally {
      setIsSaving(false);
    }
  };

  const goNext = (answerValue: any) => {
    const currentQ = questions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQ.id]: answerValue };
    setAnswers(newAnswers);

    setTimeout(() => {
      // 使用智能跳转逻辑
      const nextIndex = getNextQuestionIndex(currentQuestionIndex + 1, newAnswers);
      
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        setIsFinished(true);
        calculateAndSave(newAnswers);
      }
    }, 300);
  };

  const handleOptionSelect = (option: any) => {
    goNext(option); 
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      toast.warning("请填写内容后再继续");
      return;
    }
    goNext(textInput);
  };

  if (isCheckingAuth) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  
  if (!user) return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
           <Lock className="w-12 h-12 mx-auto text-slate-300" />
           <p>访客无法参与测评</p>
           <Button onClick={() => router.push("/login")}>去登录</Button>
        </div>
      </div>
  );

  if (isLoadingQuestions) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center">未找到题目</div>;

  if (isFinished) return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{isSaving ? "正在保存..." : "测评完成！"}</h2>
          <p className="text-slate-500 mb-8 text-sm">感谢你的配合，数据已安全上传。</p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="w-full"><Button className="w-full bg-slate-900" disabled={isSaving}>查看我的报告</Button></Link>
          </div>
        </motion.div>
      </div>
  );

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="fixed top-0 left-0 w-full bg-white z-10 px-6 py-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>退出</Button>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-indigo-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
          </div>
          <div className="text-xs text-slate-400 w-12 text-right">{currentQuestionIndex + 1} / {questions.length}</div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 pt-20">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-4 text-sm uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Question {currentQuestionIndex + 1}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{currentQ.content}</h2>
              </div>
              
              {currentQ.type === 'text' ? (
                <div className="space-y-6">
                    <Input 
                        ref={inputRef}
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                        placeholder="请输入你的答案..."
                        className="text-xl p-6 h-16 border-2 border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleTextSubmit} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 text-lg h-14 rounded-xl">
                            确认 <CornerDownLeft className="w-4 h-4 ml-2" />
                        </Button>
                        <p className="text-xs text-slate-400 self-center">按 Enter 快速提交</p>
                    </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {currentQ.options?.map((option: any, index: number) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(241, 245, 249, 0.8)" }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleOptionSelect(option)}
                      className="group flex items-center gap-4 p-4 md:p-5 w-full text-left border-2 border-slate-100 rounded-xl hover:border-indigo-600 transition-colors duration-200 bg-white"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {option.label}
                      </span>
                      <span className="text-lg text-slate-700 font-medium group-hover:text-slate-900">
                        {option.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}