"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
// 移除 Navbar，让页面全屏沉浸
// import { Navbar } from "@/components/Navbar"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, Send, User, Plus, MessageSquare, Trash2, Loader2, 
  PanelLeftClose, PanelLeftOpen, Sparkles, Brain, Home, ChevronLeft, ArrowRight 
} from "lucide-react"; // 修复点：这里加上了 ArrowRight
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// 定义类型
type Message = { id?: string; role: 'user' | 'ai'; content: string; };
type Session = { id: string; title: string; created_at: string; };

export default function AILabPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 核心数据
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // UI 状态
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 初始化
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      
      // 加载历史
      const { data: sessionData } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (sessionData) setSessions(sessionData);
      setLoading(false);
    };
    init();
  }, [router]);

  // 2. 滚动
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  // 3. 加载会话
  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setAiLoading(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data.map(m => ({ role: m.role as 'user'|'ai', content: m.content })));
    }
    setAiLoading(false);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  // 4. 新建
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  // 5. 删除
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm("确定删除？")) return;
    const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) handleNewChat();
      toast.success("已删除");
    }
  };

  // 6. 发送
  const handleSend = async () => {
    if (!input.trim() || aiLoading) return;
    const userMsgContent = input;
    setInput("");
    setAiLoading(true);
    const tempMsgs = [...messages, { role: 'user' as const, content: userMsgContent }];
    setMessages(tempMsgs);

    try {
      let sessionId = currentSessionId;
      if (!sessionId) {
        const { data: newSession, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user.id,
            title: userMsgContent.slice(0, 12) + (userMsgContent.length > 12 ? "..." : ""),
          })
          .select().single();
        
        if (error || !newSession) throw new Error("Session Error");
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        setSessions(prev => [newSession, ...prev]);
      }

      await supabase.from('chat_messages').insert({ session_id: sessionId, role: 'user', content: userMsgContent });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgContent, userId: user.id })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const aiReply = data.reply;

      await supabase.from('chat_messages').insert({ session_id: sessionId, role: 'ai', content: aiReply });
      setMessages(prev => [...prev, { role: 'ai', content: aiReply }]);

    } catch (err) {
      console.error(err);
      toast.error("发送失败");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="h-screen flex bg-[#f8f9fb] font-sans overflow-hidden selection:bg-indigo-100">
      
      {/* --- 左侧边栏 (柔和设计) --- */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 320 : 0, 
          opacity: isSidebarOpen ? 1 : 0,
          x: isSidebarOpen ? 0 : -20
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-shrink-0 flex flex-col h-full bg-[#f8f9fb] border-r border-slate-200/60 overflow-hidden relative z-20"
      >
         {/* 品牌区域：代替了原来的 Navbar */}
         <div className="h-20 flex items-center px-6 shrink-0">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/')}>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg tracking-tight">EduMind</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">AI Laboratory</p>
              </div>
            </div>
         </div>
         
         {/* 新建按钮区 */}
         <div className="px-6 mb-2">
            <Button 
              onClick={handleNewChat}
              className="w-full bg-white hover:bg-white/80 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md transition-all h-12 rounded-2xl justify-start px-4 gap-3 font-medium group"
            >
               <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Plus className="w-5 h-5" />
               </div>
               开启新对话
            </Button>
         </div>

         {/* 历史列表区 */}
         <ScrollArea className="flex-grow px-4 py-2">
            <div className="space-y-1 pb-4">
               {sessions.length > 0 && <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">历史记录</div>}
               
               {sessions.map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => loadSession(s.id)}
                    className={cn(
                      "group flex items-center justify-between px-4 py-3 rounded-xl text-sm cursor-pointer transition-all duration-200 border border-transparent",
                      currentSessionId === s.id 
                        ? "bg-white text-slate-900 font-medium shadow-sm border-slate-100" 
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
                    )}
                  >
                     <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare className={cn("w-4 h-4 shrink-0 transition-colors", currentSessionId === s.id ? "text-indigo-500" : "text-slate-300 group-hover:text-slate-400")} />
                        <span className="truncate">{s.title || "新对话"}</span>
                     </div>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all -mr-2"
                       onClick={(e) => handleDeleteSession(e, s.id)}
                     >
                       <Trash2 className="w-3 h-3" />
                     </Button>
                  </div>
               ))}
            </div>
         </ScrollArea>

         {/* 底部工具栏 */}
         <div className="p-4 mt-auto">
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500 hover:text-slate-900 hover:bg-white/60 rounded-xl h-12 px-4" onClick={() => router.push('/')}>
               <Home className="w-4 h-4" /> 返回首页
            </Button>
         </div>
      </motion.div>


      {/* --- 右侧：对话主视窗 (圆角大卡片风格) --- */}
      <div className="flex-grow h-full relative flex flex-col min-w-0 bg-white lg:m-4 lg:rounded-[32px] lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-100 overflow-hidden">
         
         {/* 顶部 Header (极简) */}
         <div className="h-16 flex items-center justify-between px-6 border-b border-slate-50 shrink-0 bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                 className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
               >
                 {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
               </Button>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                 <span className="text-sm font-medium text-slate-700">BNU EduMind</span>
                 <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Qwen-Max</span>
               </div>
            </div>
         </div>

         {/* 聊天内容区 */}
         <ScrollArea className="flex-grow bg-white">
            <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8 pb-32">
               
               {/* 欢迎空状态 */}
               {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col items-center justify-center mt-20 text-center"
                  >
                     <div className="w-20 h-20 bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-indigo-100/50">
                        <Bot className="w-10 h-10 text-indigo-600" />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-800 mb-2">很高兴见到你，{user?.user_metadata?.display_name || '同学'}</h2>
                     <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                        我是基于通义千问 Max 的教育智能助手。我可以根据你的测评数据，为你提供个性化的学业诊断与建议。
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                        {[
                           "分析我的逻辑推理能力", 
                           "如何缓解考试焦虑？", 
                           "我的优势学科是什么？", 
                           "制定一个提升计划"
                        ].map((q, i) => (
                           <button 
                             key={i}
                             onClick={() => { setInput(q); }}
                             className="text-left p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm transition-all group bg-white"
                           >
                              <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 block mb-1">{q}</span>
                              <span className="text-xs text-slate-400 group-hover:text-indigo-400">点击提问 →</span>
                           </button>
                        ))}
                     </div>
                  </motion.div>
               )}

               {/* 消息流 */}
               {messages.map((msg, idx) => (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     key={idx} 
                     className={cn(
                       "flex gap-5",
                       msg.role === 'user' ? "flex-row-reverse" : ""
                     )}
                  >
                     {/* 头像 */}
                     <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        msg.role === 'ai' ? "bg-white border border-slate-100" : "bg-indigo-600"
                     )}>
                        {msg.role === 'ai' 
                           ? <Sparkles className="w-5 h-5 text-indigo-600" /> 
                           : <User className="w-5 h-5 text-white" />
                        }
                     </div>

                     {/* 气泡 */}
                     <div className={cn(
                        "px-6 py-4 rounded-[24px] text-[15px] leading-7 shadow-sm max-w-[85%] lg:max-w-[75%]",
                        msg.role === 'user' 
                           ? "bg-indigo-600 text-white rounded-tr-sm" 
                           : "bg-[#f8f9fb] text-slate-700 rounded-tl-sm border border-slate-100"
                     )}>
                        {msg.content.split('\n').map((line, i) => (
                           <p key={i} className={cn("min-h-[1em]", i > 0 && "mt-2")}>{line}</p>
                        ))}
                     </div>
                  </motion.div>
               ))}

               {/* Loading 态 */}
               {aiLoading && (
                  <div className="flex gap-5">
                     <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                     </div>
                     <div className="px-6 py-4 rounded-[24px] rounded-tl-sm bg-[#f8f9fb] border border-slate-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></span>
                     </div>
                  </div>
               )}
               <div ref={scrollRef} />
            </div>
         </ScrollArea>

         {/* 底部悬浮输入框 (美化重点) */}
         <div className="absolute bottom-6 left-0 right-0 px-4 md:px-0 z-20">
            <div className="max-w-3xl mx-auto relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[28px] opacity-20 group-hover:opacity-30 transition duration-500 blur"></div>
               <div className="relative bg-white rounded-[26px] shadow-xl shadow-indigo-100/50 border border-slate-100 flex items-center p-2 pr-2">
                  <Input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="输入您的问题..."
                      className="flex-grow border-none shadow-none focus-visible:ring-0 bg-transparent px-4 py-3 h-auto text-base placeholder:text-slate-400"
                  />
                  <Button 
                      size="icon" 
                      onClick={handleSend}
                      disabled={!input.trim() || aiLoading}
                      className={cn(
                        "w-10 h-10 rounded-full shrink-0 transition-all duration-300",
                        input.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transform hover:scale-105" : "bg-slate-100 text-slate-300"
                      )}
                  >
                      {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </Button>
               </div>
            </div>
            <p className="text-center text-[10px] text-slate-300 mt-3 font-medium tracking-wide">
               Powered by AliYun Qwen-Max · BNU EduMind
            </p>
         </div>

      </div>
    </div>
  );
}