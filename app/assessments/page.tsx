import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, BarChart, ArrowRight, Star, BookOpen, BrainCircuit, ClipboardList } from "lucide-react";

// --- 模拟数据库中的测评列表 ---
const assessments = [
  {
    id: "logic-01",
    title: "批判性思维与逻辑推理",
    description: "通过经典的归纳与演绎题目，深度评估你的逻辑闭环能力与论证分析水平。",
    time: "25 分钟",
    difficulty: "困难",
    category: "认知能力",
    participants: 1204,
    icon: <BrainCircuit className="w-6 h-6 text-purple-500" />,
    color: "bg-purple-50 border-purple-100",
  },
  {
    id: "national-survey",
    // 修改点：这里完全改成了调查问卷的形态
    title: "全国中小学生发展情况调查",
    description: "涵盖家庭背景、心理素质、创新能力等多维度的综合性发展状况调查，旨在全面了解学生成长环境与潜能。",
    time: "30 分钟",
    difficulty: "普适",
    category: "综合调查",
    participants: 5600, // 调查通常人数更多
    icon: <ClipboardList className="w-6 h-6 text-blue-500" />, // 换成调查问卷图标
    color: "bg-blue-50 border-blue-100",
  },
  {
    id: "psy-01",
    title: "大五人格职业倾向分析",
    description: "基于心理学大五人格模型，探索你的性格特质最适合哪种教学风格。",
    time: "10 分钟",
    difficulty: "轻松",
    category: "心理测评",
    participants: 3420,
    icon: <Star className="w-6 h-6 text-orange-500" />,
    color: "bg-orange-50 border-orange-100",
  },
];

export default function AssessmentLibrary() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* --- 头部区域 --- */}
      <header className="bg-white border-b border-slate-200 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600 mb-4 inline-block transition-colors">
            ← 返回首页
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            测评探索广场
          </h1>
          <p className="text-slate-500 text-lg">
            选择一个领域，开始你的自我发现之旅。
          </p>
        </div>
      </header>

      {/* --- 列表区域 --- */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* 筛选标签 (静态展示) */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="secondary" className="rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800">全部</Button>
          <Button variant="ghost" className="rounded-full text-slate-600 hover:bg-slate-100">认知能力</Button>
          <Button variant="ghost" className="rounded-full text-slate-600 hover:bg-slate-100">综合调查</Button>
          <Button variant="ghost" className="rounded-full text-slate-600 hover:bg-slate-100">心理测评</Button>
        </div>

        {/* 网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((item) => (
            <Link key={item.id} href={`/assessments/${item.id}`} className="block h-full">
              <Card className="h-full group hover:shadow-lg transition-all duration-300 border-slate-200 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1">
                
                {/* 卡片头部：图标与标题 */}
                <CardHeader className={`${item.color} pb-6`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      {item.icon}
                    </div>
                    <Badge variant="outline" className="bg-white/50 backdrop-blur-sm border-slate-200 text-slate-600 font-normal">
                      {item.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                
                {/* 卡片内容：描述 */}
                <CardContent className="pt-6 flex-grow">
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </CardContent>

                <Separator className="bg-slate-100" />

                {/* 卡片底部：信息与按钮 */}
                <CardFooter className="pt-4 flex items-center justify-between text-xs text-slate-400 bg-white">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart className="w-3 h-3" /> {item.difficulty}
                    </span>
                  </div>
                  
                  <div className="text-indigo-600 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    开始 <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}