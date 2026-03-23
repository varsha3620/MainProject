"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  RefreshCcw,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Rocket
} from "lucide-react";

// ... rest of your code

export default function OnboardingPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null); // Track auth state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const { data, error } = await supabase
            .from("interviews")
            .select("*")
            .eq("user_id", firebaseUser.uid)
            .order("created_at", { ascending: false });

          if (!error) setInterviews(data || []);
        } catch (err) {
          console.error("Fetch error:", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 2. LANDING / INTRO STATE (If not logged in)
  if (!user) {
  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* 1. ANIMATED BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full animate-bounce [animation-duration:10s]" />
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-indigo-400 text-sm font-medium backdrop-blur-md animate-fade-in">
            <Sparkles size={16} />
            <span className="tracking-wide">AI-Powered Interview Intelligence</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-tight">
            Crush your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
              Next Big Role
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Practice with an AI that simulates real technical rounds, 
            analyzes your speech, and gives you a roadmap to mastery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={() => router.push("/login")}
              className="group relative w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-2xl shadow-indigo-500/40 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started for Free <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-indigo-500 to-transparent"></div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (The "Catchy" Part) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <FeatureCard 
            icon={<MessageSquare className="text-indigo-400" />}
            title="Real-time Dialog"
            desc="Experience natural, back-and-forth technical conversations that mimic top-tier company interviews."
          />
          
          <FeatureCard 
            icon={<ShieldCheck className="text-purple-400" />}
            title="Instant Analysis"
            desc="Get detailed feedback on your logic, communication style, and technical depth immediately."
          />
          
          <FeatureCard 
            icon={<Rocket className="text-pink-400" />}
            title="Role-Specific"
            desc="Tailored scenarios for Frontend, Backend, DevOps, or Data Science. We speak your language."
          />

        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="bg-gradient-to-b from-white/[0.05] to-transparent border-t border-white/10 p-20 rounded-[4rem]">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to level up?</h2>
          <button 
            onClick={() => router.push("/signin")}
            className="text-indigo-400 font-bold hover:text-white transition-colors"
          >
            Create your account today →
          </button>
        </div>
      </section>
    </div>
  );
}

// Small sub-component for the features
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 transition-all duration-500">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}

  // 3. AUTHENTICATED STATE (Your original Dashboard/Archive code)
  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* ... Your existing Navbar and Main content ... */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
           <h2 className="font-bold text-xl text-white">InterviewApp</h2>
           <button onClick={() => auth.signOut()} className="text-xs text-slate-500 hover:text-white">Sign Out</button>
        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Welcome back, <span className="text-indigo-400">{user.displayName || 'Developer'}</span>
          </h1>
          <p className="text-slate-400 text-lg">Review your past performances.</p>
        </div>

        {/* List your interviews here as you did before */}
        {interviews.length === 0 ? (
            <p>No interviews yet!</p>
        ) : (
            <div className="grid gap-6">
                 {/* Map through interviews here */}
            </div>
        )}
      </main>
    </div>
  );
}