"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Trophy,
  ArrowLeft,
  ChevronRight,
  Calendar,
  History,
  Search,
  TrendingUp,
  LayoutGrid,
  Clock,
  Award
} from "lucide-react";

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
      } else {
        setUser(currentUser);

        // Fetch interview history from Supabase
        const { data, error } = await supabase
          .from("interviews")
          .select("*")
          .eq("user_id", currentUser.uid)
          .order("created_at", { ascending: false });

        if (!error) setInterviews(data || []);
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // Filter history based on search input
  const filteredInterviews = interviews.filter((item) =>
    item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate high-level stats for the header
  const averageScore = interviews.length
    ? Math.round(
        interviews.reduce((acc, curr) => acc + (curr.score || 0), 0) /
          interviews.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 font-sans pb-20">
      {/* Background Glows to match Dashboard */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-black/60 backdrop-blur-xl px-6 h-16 flex justify-between items-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </button>
        
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Records</span>
        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-6 pt-16">
        {/* Page Header & Stats Section */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold text-white tracking-tight flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <History className="text-indigo-400" size={32} />
                </div>
                History
              </h1>
              <p className="text-slate-400 text-lg">Review your past interview performances and analytics.</p>
            </div>

            {/* Quick Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-white/[0.02] border border-white/10 px-6 py-3 rounded-2xl flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
                <span className="text-xl font-bold text-white">{interviews.length}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/10 px-6 py-3 rounded-2xl flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Score</span>
                <span className="text-xl font-bold text-emerald-400">{averageScore}%</span>
              </div>
            </div>
          </div>
        </header>

        {/* Search Toolbar */}
        <div className="relative mb-8 group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by job role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Interview List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-24 text-slate-500">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium animate-pulse">Retrieving your journey...</p>
            </div>
          ) : filteredInterviews.length > 0 ? (
            filteredInterviews.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/feedback?interviewId=${item.id}`)}
                className="group relative bg-[#0D0D0F] border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.03] hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between overflow-hidden"
              >
                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                    <Award size={26} />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.role}
                    </h3>
                    <div className="flex items-center gap-5 mt-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Calendar size={14} className="text-slate-600" />
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="h-1 w-1 rounded-full bg-white/10" />
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${
                        (item.score || 0) >= 70 ? "text-emerald-500" : "text-amber-500"
                      }`}>
                        <TrendingUp size={14} />
                        Score: {item.score || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                   <div className="hidden sm:flex flex-col items-end mr-2">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600 group-hover:text-slate-400 transition-colors">Performance</span>
                      <span className="text-[10px] font-bold text-indigo-500/60 group-hover:text-indigo-400">View Report</span>
                   </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:translate-x-1 transition-all">
                    <ChevronRight size={20} className="text-slate-600 group-hover:text-white" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem]">
              <LayoutGrid size={48} className="mx-auto text-slate-800 mb-5" />
              <h3 className="text-2xl font-bold text-slate-400 italic">No history found</h3>
              <p className="text-slate-600 mt-2 mb-8">You haven't completed any interview sessions yet.</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                Start Your First Session
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}