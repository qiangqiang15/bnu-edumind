"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Loader2, Lock, User, School, Users, IdCard } from "lucide-react"; 
import { toast } from "sonner"; 

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); 
  const [agreed, setAgreed] = useState(false); 

  const [loginId, setLoginId] = useState(""); 
  const [password, setPassword] = useState("");

  const [school, setSchool] = useState("");
  const [clazz, setClazz] = useState(""); 
  const [realName, setRealName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const formatEmail = (id: string) => {
    const cleanId = id.trim(); 
    if (cleanId.includes("@")) return cleanId; 
    return `${cleanId}@example.com`; 
  };

  const translateError = (errorMsg: string) => {
    if (errorMsg.includes("Invalid login credentials")) return "学号或密码错误，请重试。";
    if (errorMsg.includes("User already registered")) return "该学号已被注册，请直接登录。";
    if (errorMsg.includes("Password should be at least")) return "密码长度至少需要 6 位。";
    if (errorMsg.includes("invalid claim")) return "登录会话已过期，请刷新页面重试。";
    if (errorMsg.includes("Unable to validate email address") || errorMsg.includes("invalid")) {
      return "学号格式有误（请勿包含空格或特殊字符）。";
    }
    return errorMsg;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return toast.warning("请先勾选同意用户协议");
    
    setIsLoading(true);
    try {
      const finalEmail = formatEmail(loginId);
      const { error } = await supabase.auth.signInWithPassword({ 
        email: finalEmail, 
        password 
      });
      if (error) throw error;

      toast.success("欢迎回来！正在进入测评中心...");
      router.push("/"); 
      router.refresh(); 
    } catch (err: any) {
      toast.error("登录失败", { description: translateError(err.message) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return toast.warning("请先勾选同意用户协议");

    setIsLoading(true);
    try {
      const finalEmail = formatEmail(studentId);
      const { error } = await supabase.auth.signUp({ 
        email: finalEmail, 
        password: regPassword,
        options: {
          data: { 
            display_name: realName, 
            school_name: school,    
            class_name: clazz,      
            student_id: studentId,  
            role: 'student' 
          } 
        }
      });
      if (error) throw error;

      toast.success("注册成功！", { 
        description: `你好，${realName}同学！账号已创建，请使用学号登录。`,
        duration: 5000,
      });
      
      setLoginId(studentId);
      setActiveTab("login");
    } catch (err: any) {
      toast.error("注册失败", { description: translateError(err.message) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* --- 左侧：品牌展示 --- */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Brain className="w-6 h-6" />
          </div>
          {/* 修改点：品牌升级 */}
          <span>BNU EduMind | 京师智测</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <blockquote className="text-3xl font-medium leading-snug mb-6">
            “数据不是冰冷的数字，而是学生成长的足迹。我们要做的，就是读懂这些足迹。”
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
              W
            </div>
            <div>
              <div className="font-semibold">Wukeyang</div>
              <div className="text-slate-400 text-sm">Education Economics Researcher</div>
            </div>
          </div>
        </div>
        {/* 修改点：版权信息 */}
        <div className="relative z-10 text-xs text-slate-500">© 2025 Faculty of Education, BNU · 严谨学术 · 数据驱动</div>
      </div>

      {/* --- 右侧：表单区域 (保持不变) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-8">
          
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {activeTab === 'login' ? '学生登录' : '新学生注册'}
            </h1>
            <p className="text-slate-500 text-sm">
              {activeTab === 'login' ? '使用学号登录以开始测评' : '完善班级信息，建立你的学习档案'}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg mb-6">
              <TabsTrigger value="login" className="rounded-md transition-all">登录</TabsTrigger>
              <TabsTrigger value="register" className="rounded-md transition-all">注册</TabsTrigger>
            </TabsList>

            {/* 登录面板 */}
            <TabsContent value="login" className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-id">学号</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      key="l-id" 
                      id="login-id" 
                      placeholder="请输入学号" 
                      className="pl-10 h-11" 
                      value={loginId} 
                      onChange={e => setLoginId(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      key="l-pass" 
                      id="login-password" 
                      type="password" 
                      placeholder="请输入密码" 
                      className="pl-10 h-11" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 py-1">
                  <Checkbox id="terms-login" checked={agreed} onCheckedChange={(c) => setAgreed(c as boolean)} className="mt-1 data-[state=checked]:bg-indigo-600" />
                  <Label htmlFor="terms-login" className="text-xs text-slate-500 cursor-pointer leading-tight">
                    我已阅读并同意 <span className="text-indigo-600">《用户协议》</span>
                  </Label>
                </div>

                <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  进入测评
                </Button>
              </form>
            </TabsContent>

            {/* 注册面板 */}
            <TabsContent value="register" className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school">学校</Label>
                    <div className="relative">
                      <School className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input id="school" placeholder="例如: 实验中学" className="pl-9" value={school} onChange={e => setSchool(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">班级</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input id="class" placeholder="例如: 高一(3)班" className="pl-9" value={clazz} onChange={e => setClazz(e.target.value)} required />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input id="name" placeholder="真实姓名" className="pl-9" value={realName} onChange={e => setRealName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-id">学号</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input id="student-id" placeholder="例如: 2024001" className="pl-9" value={studentId} onChange={e => setStudentId(e.target.value)} required />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pass">设置密码</Label>
                  <Input 
                    key="r-pass" 
                    id="reg-pass" 
                    type="password" 
                    placeholder="至少 6 位字符" 
                    value={regPassword} 
                    onChange={e => setRegPassword(e.target.value)} 
                    required 
                    minLength={6} 
                  />
                </div>
                <div className="flex items-start gap-2 py-1">
                  <Checkbox id="terms-reg" checked={agreed} onCheckedChange={(c) => setAgreed(c as boolean)} className="mt-1 data-[state=checked]:bg-indigo-600" />
                  <Label htmlFor="terms-reg" className="text-xs text-slate-500 cursor-pointer leading-tight">
                    注册即代表同意 <span className="text-indigo-600">《用户协议》</span>，所有信息仅用于生成个人测评报告。
                  </Label>
                </div>
                <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  创建学习档案
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}