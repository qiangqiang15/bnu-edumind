import { createClient } from '@supabase/supabase-js'

// 确保你的 .env.local 文件里已经填好了这两个变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建并导出 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseKey)