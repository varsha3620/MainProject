"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  RefreshCcw,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("interviews")
          .select("*")
          .eq("user_id", user.uid)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          return;
        }

        setInterviews(data || []);
      } catch (error) {
        console.error("Firestore error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 font-sans selection:bg-indigo-500/30">

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">History Log</span>
          </div>
        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Archives</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Review your past performances and track your growth over time.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-500 animate-pulse text-sm font-medium uppercase tracking-widest">Retrieving sessions...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-16 text-center shadow-xl">
            <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Clock size={40} className="text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No history found</h3>
            <p className="text-slate-500 mb-10 max-w-xs mx-auto">
              Your completed interview sessions will appear here for review.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white transition-all px-10 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20"
            >
              Start Your First Session
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white/[0.02] border border-white/[0.06] p-8 rounded-[2rem] hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                  {/* Info Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                        Completed
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Calendar size={14} />
                        {/* Assuming a timestamp exists, otherwise use a placeholder */}
                        <span>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : "Recent"}
                        </span>                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.role}
                    </h2>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        router.push(`/interview?role=${encodeURIComponent(item.role)}`)
                      }
                      className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                    >
                      <RefreshCcw size={16} />
                      Retry
                    </button>

                    {item.feedback ? (
                      <button
                        onClick={() => router.push(`/feedback?interviewId=${item.id}`)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/10 transition-all"
                      >
                        <MessageSquare size={16} />
                        View Feedback
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-slate-800 text-slate-500 px-6 py-3 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed"
                      >
                        Analyzing...
                      </button>
                    )}
                  </div>

                </div>

                {/* Subtle Progress Bar Decoration */}
                <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}