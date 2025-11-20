"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// 修复点：引入 Button 组件
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Clock, BookOpen, Calendar, ArrowRight, Sparkles, Bot } from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const assessmentMeta: Record<string, { title: string; category: string }> = {
  "logic-01": { title: "批判性思维与逻辑推理", category: "认知能力" },
  "national-survey": { title: "全国中小学生发展情况调查", category: "综合调查" },
  "psy-01": { title: "大五人格职业倾向分析", category: "心理测评" },
};

// --- 1. 定义四大核心维度 (Key -> 中文名) ---
const MAIN_CATEGORIES = {
  "social_emotional": "社会情感能力",
  "health_wellbeing": "健康与幸福",
  "relationships": "关系连接",
  "school_experience": "学校体验"
};

// --- 2. 定义细分维度到主维度的映射关系 ---
const dimensionMapping: Record<string, string> = {
  // 社会情感能力
  "optimism": "social_emotional",
  "sadness_absence": "social_emotional", 
  "resilience": "social_emotional",
  "resilience_ext": "social_emotional",
  "empathy": "social_emotional",
  "social_anxiety": "social_emotional", 
  "cooperation": "social_emotional",
  "social_resp": "social_emotional",
  "decision": "social_emotional",
  "grit": "social_emotional",
  "grit_consistency": "social_emotional",
  "meaning_presence": "social_emotional",
  
  // 健康与幸福
  "health": "health_wellbeing",
  "health_general": "health_wellbeing",
  "body_image": "health_wellbeing",
  "life_satisfaction": "health_wellbeing",
  "flourishing": "health_wellbeing",
  "sleep_quality": "health_wellbeing",
  "energy": "health_wellbeing",
  
  // 关系连接
  "peer_support": "relationships",
  "friendship": "relationships",
  "friendship_intimacy": "relationships",
  "peer_belonging": "relationships",
  "parent_rel": "relationships",
  "parent_relationship": "relationships",
  "family_support": "relationships",
  "parent_comm": "relationships",
  "teacher_rel": "relationships",
  "teacher_care": "relationships",
  "teacher_understanding": "relationships",
  "teacher_support": "relationships",

  // 学校体验
  "school_climate": "school_experience",
  "school_belonging": "school_experience",
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [realRadarData, setRealRadarData] = useState<any[]>([]); 

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('assessment_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRecords(data);
        processRadarData(data); 
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // --- 核心：聚合计算逻辑 ---
  const processRadarData = (data: any[]) => {
    if (!data || data.length === 0) return;

    const surveyRecord = data.find(r => r.assessment_id === 'national-survey');
    const recordToUse = surveyRecord || data.find(r => r.ai_analysis);
    
    if (recordToUse && recordToUse.ai_analysis) {
      try {
        const scores = JSON.parse(recordToUse.ai_analysis);
        
        const categoryScores: Record<string, { total: number; count: number }> = {
          "social_emotional": { total: 0, count: 0 },
          "health_wellbeing": { total: 0, count: 0 },
          "relationships": { total: 0, count: 0 },
          "school_experience": { total: 0, count: 0 }
        };

        Object.entries(scores).forEach(([dimKey, score]) => {
          const mainCategory = dimensionMapping[dimKey];
          if (mainCategory && typeof score === 'number') {
            categoryScores[mainCategory].total += score;
            categoryScores[mainCategory].count += 1;
          }
        });

        const chartData = Object.entries(MAIN_CATEGORIES).map(([key, label]) => {
          const { total, count } = categoryScores[key];
          const avg = count > 0 ? total / count : 0;
          // 简单的归一化处理
          const normalizedScore = Math.min(Math.round((avg / 5) * 100), 100); 
          
          return {
            subject: label,
            A: normalizedScore || 20, 
            fullMark: 100
          };
        });
        
        setRealRadarData(chartData);

      } catch (e) {
        console.error("解析分数出错:", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const trendData = records.map((r, index) => ({
    name: `第${records.length - index}次`,
    score: r.score || 0, 
  })).reverse().slice(0, 10); 

  // --- 默认雷达图 (空状态) ---
  const defaultRadarData = [
    { subject: '社会情感能力', A: 0, fullMark: 100 },
    { subject: '健康与幸福', A: 0, fullMark: 100 },
    { subject: '关系连接', A: 0, fullMark: 100 },
    { subject: '学校体验', A: 0, fullMark: 100 },
  ];

  const radarDataToUse = realRadarData.length > 0 ? realRadarData : defaultRadarData;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            你好，{user?.user_metadata?.display_name || "同学"} 👋
          </h1>
          <p className="text-slate-500 mt-2">
            这是你的学习档案。你已经完成了 <span className="font-bold text-indigo-600">{records.length}</span> 次认知测评。
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">累计参与调查</CardTitle>
              <Clock className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {records.length} <span className="text-sm font-normal text-slate-400">次</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">最近一次得分</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{records[0]?.score || 0}</div>
              <p className="text-xs text-slate-400 mt-1">总积分</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">覆盖维度</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">4 <span className="text-sm font-normal text-slate-400">大类</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- 左侧：图表区 --- */}
          <div className="lg:col-span-2 space-y-8">
            
            <Card>
              <CardHeader>
                <CardTitle>得分趋势</CardTitle>
                <CardDescription>历次测评总分变化</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {records.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        itemStyle={{color: '#4f46e5', fontWeight: 'bold'}}
                      />
                      <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <p>暂无趋势数据，快去完成第一次测评吧！</p>
                    <Link href="/assessments" className="mt-4">
                      <Button variant="outline">去测评</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>详细测评记录</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {records.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <p className="mb-4">暂无作答记录</p>
                      <Link href="/assessments" className="text-indigo-600 hover:underline text-sm font-medium">去测评广场看看 →</Link>
                    </div>
                  ) : (
                    records.map((record) => {
                      const meta = assessmentMeta[record.assessment_id] || { title: "未知测评", category: "其他" };
                      const date = new Date(record.created_at).toLocaleDateString('zh-CN');
                      return (
                        <div key={record.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all group">
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm md:text-base">{meta.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium">{meta.category}</span>
                                <span>• {date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="text-right hidden sm:block">
                                <div className="text-xl font-bold text-indigo-600">{record.score || 0}</div>
                                <div className="text-xs text-slate-400">得分</div>
                             </div>
                            <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                              <ArrowRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- 右侧：雷达图 + AI 入口 --- */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>学生综合发展画像</CardTitle>
                <CardDescription>
                  基于 4 大核心维度的能力分布 (分值 0-100)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarDataToUse}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} tick={false} axisLine={false} domain={[0, 100]} />
                      <Radar
                        name="我的能力"
                        dataKey="A"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                 </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              onClick={() => router.push('/ai-lab')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors"></div>
              
              <CardHeader>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm border border-white/10">
                   <Sparkles className="w-5 h-5 text-indigo-100" />
                </div>
                <CardTitle className="text-xl">进入 AI 实验室</CardTitle>
                <CardDescription className="text-indigo-100">
                  有问题想问？进入全屏沉浸式对话空间，获取更详细的学情分析。
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                 <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center gap-3 text-sm text-indigo-100 hover:bg-white/20 transition-colors group-hover:text-white">
                    <Bot className="w-4 h-4" />
                    <span>点击这里，开始深度咨询 →</span>
                 </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}