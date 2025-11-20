import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json();
    const apiKey = process.env.DASHSCOPE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key 未配置" }, { status: 500 });
    }

    // 1. 检索增强 (RAG): 查学生最近记录
    let studentContext = "该学生暂时没有测评记录。";
    
    if (userId) {
      const { data: records } = await supabase
        .from('assessment_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (records && records.length > 0) {
        const lastRecord = records[0];
        studentContext = `
          该学生最近完成了一次测评（ID: ${lastRecord.assessment_id}）。
          作答详情 JSON: ${JSON.stringify(lastRecord.answers)}。
          (请结合教育测量学知识，分析其认知结构)
        `;
      }
    }

    // 2. 提示词工程 (Prompt Engineering)
    const systemPrompt = `
      你是由北京师范大学教育学部开发的智能教育诊断专家 (BNU EduMind)。
      你的核心能力是基于 IRT (项目反应理论) 和认知诊断模型 (CDM) 为学生提供建议。
      
      学生当前的测评状态：
      ${studentContext}

      回答原则：
      1. 身份认知：你是北师大的 AI 导师，语气要严谨、温暖且具有学术权威感。
      2. 证据导向：分析必须基于上述测评数据，不要泛泛而谈。
      3. 理论支撑：适当引用教育学理论（如最近发展区 ZPD、元认知策略、脚手架理论）。
      4. 简洁明了：回答控制在 300 字以内，分点陈述。
    `;

    // 3. 调用阿里云通义千问 MAX 模型
    const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen-max", // 修改点：使用最强模型 qwen-max
        input: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        },
        parameters: {
          result_format: "message"
        }
      })
    });

    const data = await response.json();

    if (data.code) {
      console.error("阿里云 API 报错:", data);
      throw new Error(data.message);
    }

    const aiReply = data.output.choices[0].message.content;
    return NextResponse.json({ reply: aiReply });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "服务器繁忙" }, { status: 500 });
  }
}