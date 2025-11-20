"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Lock, User, School, Badge } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 表单状态
  const [displayName, setDisplayName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [studentId, setStudentId] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 初始化加载用户数据
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      // 填充表单默认值
      setDisplayName(user.user_metadata?.display_name || "");
      setSchoolName(user.user_metadata?.school_name || "");
      setClassName(user.user_metadata?.class_name || "");
      setStudentId(user.user_metadata?.student_id || "");
      setLoading(false);
    };
    initUser();
  }, [router]);

  // 保存基本资料
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          school_name: schoolName,
          class_name: className,
          student_id: studentId
        }
      });

      if (error) throw error;
      toast.success("个人资料已更新！");
      router.refresh(); // 刷新以更新 Navbar 上的名字
    } catch (error: any) {
      toast.error("更新失败", { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("两次输入的密码不一致");
    }
    if (newPassword.length < 6) {
      return toast.error("密码长度至少需要 6 位");
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      toast.success("密码修改成功！下次登录请使用新密码。");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("修改失败", { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">账号设置</h1>
          <p className="text-slate-500 mt-2">管理你的个人信息与安全偏好</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto rounded-xl">
            <TabsTrigger value="profile" className="px-6 py-2 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <User className="w-4 h-4 mr-2" /> 基本资料
            </TabsTrigger>
            <TabsTrigger value="security" className="px-6 py-2 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Lock className="w-4 h-4 mr-2" /> 安全设置
            </TabsTrigger>
          </TabsList>

          {/* --- 基本资料面板 --- */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>学生档案</CardTitle>
                <CardDescription>这些信息将用于生成你的个性化班级报告。</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>姓名</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input className="pl-10" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>学号 (登录账号)</Label>
                      <div className="relative">
                        <Badge className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        {/* 学号通常不允许随意修改，这里设为只读或者给提示 */}
                        <Input className="pl-10 bg-slate-50 text-slate-500" value={studentId} disabled />
                      </div>
                      <p className="text-xs text-slate-400">如需修改学号请联系管理员</p>
                    </div>

                    <div className="space-y-2">
                      <Label>学校</Label>
                      <div className="relative">
                        <School className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input className="pl-10" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>班级</Label>
                      <Input value={className} onChange={e => setClassName(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      保存修改
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- 安全设置面板 --- */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>修改密码</CardTitle>
                <CardDescription>建议使用强密码以保护你的账户安全。</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>新密码</Label>
                    <Input 
                      type="password" 
                      placeholder="至少 6 位字符"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>确认新密码</Label>
                    <Input 
                      type="password" 
                      placeholder="再次输入新密码"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-start pt-4">
                    <Button type="submit" variant="outline" disabled={saving || !newPassword}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      更新密码
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}