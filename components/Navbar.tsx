"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, LogOut, User, LayoutDashboard, Loader2, Sparkles } from "lucide-react"; 
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === 'SIGNED_IN') router.refresh();
      }
    );

    return () => {
      window.removeEventListener("scroll", handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("退出失败", { description: error.message });
    } else {
      toast.success("已安全退出");
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  const displayName = user?.user_metadata?.display_name || "同学";
  const displayId = user?.user_metadata?.student_id || user?.email?.split("@")[0] || "User";
  const avatarFallback = displayName[0]?.toUpperCase() || "S";

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50 transition-all duration-300 ${
      isScrolled ? "top-4 w-[96%] max-w-7xl" : "top-6"
    }`}>
      <div className={`
        px-6 py-3 flex items-center justify-between rounded-2xl transition-all duration-300
        ${isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-md border border-slate-200/50" 
          : "bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm hover:bg-white/80"
        }
      `}>
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-800 cursor-pointer group">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <Brain className="w-5 h-5" />
          </div>
          {/* 修改点：品牌升级 */}
          <span>BNU EduMind</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/assessments" className="hover:text-indigo-600 transition-colors cursor-pointer">测评广场</Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors cursor-pointer">学部概况</Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors cursor-pointer">研究团队</Link>
          
          {user && (
            <>
              <Link href="/dashboard" className="hover:text-indigo-600 transition-colors cursor-pointer">我的报告</Link>
              <Link href="/ai-lab" className="hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI 实验室
              </Link>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="outline-none">
                <div className="relative h-10 w-10 rounded-full hover:bg-indigo-50 cursor-pointer flex items-center justify-center transition-colors">
                  <Avatar className="h-9 w-9 border border-indigo-100">
                    <AvatarImage src="" alt={displayName} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {displayId}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>个人中心</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>账号设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 px-3 py-2 transition-colors cursor-pointer">
                登录
              </Link>
              <Link 
                href="/login" 
                className={cn(
                  buttonVariants({ variant: "default" }), 
                  "bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                )}
              >
                注册账号
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}