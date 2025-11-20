"use client"; 

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Brain, ArrowRight, Bot, LineChart, Layers, Trophy } from "lucide-react";
import { motion, Variants } from "framer-motion"; 
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils"; 

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 }, 
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] as const }
  },
};

export default function Home() {
  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-indigo-100 relative overflow-hidden bg-white">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-200/30 blur-[120px] animate-blob mix-blend-multiply"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-200/30 blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full bg-purple-200/30 blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}></div>
      </div>

      <Navbar />

      <section className="pt-48 pb-24 px-6 relative">
        <motion.div 
          className="max-w-5xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4 fill-indigo-200" />
              {/* 修改点：学术化文案 */}
              <span>北京师范大学教育学部 · 智慧测评研究成果</span>
            </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 leading-[1.1]">
            BNU EduMind
            <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
              京师智见 · 认知未来
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            融合 <strong>Item Response Theory (项目反应理论)</strong> 与大语言模型技术。
            <br />
            为基础教育阶段学生提供精准的<span className="text-slate-800 font-semibold">认知能力诊断与个性化发展建议</span>。
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link 
              href="/assessments" 
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-lg shadow-xl shadow-indigo-200 transition-transform hover:scale-105 cursor-pointer"
              )}
            >
              开始测评探索 <ArrowRight className="ml-2 w-5 h-5" />
            </Link>

            <Link 
              href="/assessments" 
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "h-14 px-10 rounded-full text-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              )}
            >
              了解研究方法
            </Link>
          </motion.div>

        </motion.div>
      </section>

      <section className="py-12 px-6 pb-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            
            {/* AI 实验室入口 */}
            <Link href="/ai-lab" className="md:col-span-1 md:row-span-2 group cursor-pointer">
              <Card className="h-full bg-slate-900 text-white border-slate-800 overflow-hidden relative flex flex-col shadow-2xl shadow-slate-300 hover:shadow-xl transition-all duration-500 hover:ring-2 hover:ring-indigo-500/50">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
                <CardHeader className="relative z-10">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-3 border border-slate-700 group-hover:border-indigo-500/50 transition-colors">
                    <Bot className="w-6 h-6 text-indigo-400" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-indigo-300 transition-colors">AI 智能导师</CardTitle>
                  <CardDescription className="text-slate-400">
                    点击进入实验室，基于通义大模型(Qwen-Max)，提供24h学情诊断。
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow relative p-4">
                  <div className="absolute inset-x-4 bottom-4 top-0 bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-800 p-4 flex flex-col gap-4 overflow-hidden">
                    <div className="self-start bg-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-200 max-w-[85%] leading-relaxed">
                        我的“逻辑推理”得分较低，该怎么提升？
                    </div>
                    <div className="self-end bg-indigo-600/90 rounded-2xl rounded-tr-none px-4 py-2.5 text-xs text-white max-w-[90%] shadow-lg leading-relaxed">
                        根据你的作答记录...
                    </div>
                    <div className="mt-auto h-10 bg-slate-900 rounded-full border border-slate-700 flex items-center px-4 gap-2">
                        <span className="text-xs text-indigo-400 font-medium">点击立即体验 →</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 可视化卡片 */}
            <Card className="md:col-span-2 bg-white/60 backdrop-blur-md border-white/60 shadow-lg hover:shadow-xl transition-all group overflow-hidden cursor-pointer">
              <div className="flex h-full flex-col md:flex-row">
                <div className="p-8 flex-1 flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-3 text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full">
                      <LineChart className="w-4 h-4" />
                      <span className="font-bold text-xs uppercase tracking-wider">Visualization</span>
                   </div>
                   <CardTitle className="text-2xl mb-3 font-bold text-slate-800">多维能力画像</CardTitle>
                   <CardDescription className="text-slate-500 text-base leading-relaxed">
                     我们不只给出一个总分。系统会生成包含逻辑、数理、语言等六个维度的雷达图，帮你精准定位最近发展区 (ZPD)。
                   </CardDescription>
                </div>
                <div className="flex-1 relative flex items-center justify-center min-h-[240px] bg-gradient-to-br from-slate-50 to-indigo-50/30">
                   <div className="absolute w-48 h-48 rounded-full border border-indigo-100"></div>
                   <div className="absolute w-32 h-32 rounded-full border border-indigo-200"></div>
                   <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                      <polygon points="50,10 90,35 80,80 20,80 10,35" fill="rgba(79, 70, 229, 0.1)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2"/>
                      <polygon points="50,20 80,40 75,70 25,75 15,40" fill="rgba(79, 70, 229, 0.6)" stroke="#4f46e5" strokeWidth="2" />
                      <circle cx="50" cy="20" r="2" className="fill-indigo-600" />
                      <circle cx="80" cy="40" r="2" className="fill-indigo-600" />
                      <circle cx="75" cy="70" r="2" className="fill-indigo-600" />
                   </svg>
                </div>
              </div>
            </Card>

            {/* 测评库卡片 */}
            <Card className="bg-gradient-to-br from-indigo-50/80 to-white/80 backdrop-blur-sm border-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer group">
              <CardHeader>
                <Layers className="w-8 h-8 text-indigo-600 mb-3 group-hover:-translate-y-1 transition-transform" />
                <CardTitle className="text-indigo-900 font-bold">精选测评库</CardTitle>
                <CardDescription className="text-indigo-700/70">
                  涵盖教育学原理、心理学量表与通用认知能力测试。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 成就卡片 */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/60 shadow-sm hover:border-orange-200 transition-colors group cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <Trophy className="w-6 h-6 text-orange-500 group-hover:rotate-12 transition-transform" />
                  </div>
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">New</span>
                </div>
                <CardTitle className="text-slate-800 font-bold">成就徽章</CardTitle>
                <CardDescription>
                  可视化的成长路径，记录每一次思维的跃迁。
                </CardDescription>
              </CardHeader>
            </Card>

          </motion.div>
        </div>
      </section>

      {/* 修改点：版权更新 */}
      <footer className="border-t border-slate-200 bg-white/40 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <div className="bg-slate-200 p-1 rounded">
              <Brain className="w-4 h-4" />
            </div>
            <span>BNU EduMind</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Designed by Faculty of Education, BNU. © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}