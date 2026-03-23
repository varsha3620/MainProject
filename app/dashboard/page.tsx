"use client";

import { useEffect, useState, Suspense } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Briefcase, 
  History, 
  LogOut, 
  User as UserIcon, 
  Search, 
  Sparkles,
  ChevronRight,
  Settings2
} from "lucide-react";

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [questionLimit, setQuestionLimit] = useState(5); // Default to 5
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isResumeMode = searchParams.get("mode") === "resume";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.replace("/login");
      else setUser(currentUser);
    });
    return () => unsub();
  }, [router]);

  const handleConfirmLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const jobs = [
    "Chartered Accountant (CA)", "Accountant", "HR Executive", "Office Manager",
    "Sales Executive", "Frontend Developer", "Backend Developer", "Full Stack developer",
    "Data Analyst", "Pharmacist", "Medical coder", "School Teacher",
    "Assistant Professor", "Bank Clerk", "Financial Advisor",
  ];

  const filteredJobs = jobs.filter(job => 
    job.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // UPDATED: Now passes the questionLimit to the URL
  const handleJobSelect = (jobRole: string) => {
    const encodedRole = encodeURIComponent(jobRole);
    let url = `/interview?role=${encodedRole}&limit=${questionLimit}`;
    
    if (isResumeMode) {
      url += `&mode=resume`;
    }
    
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">AI.Prep</span>
          </div>

          <div className="flex items-center gap-1">
            <button 
  onClick={() => router.push("/history")} // 👈 This must match your folder name
  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-full transition-all"
>
  <History size={16} />
  <span>History</span>
</button>
            <div className="w-[1px] h-4 bg-white/10 mx-2" />
            <button onClick={() => router.push("/profile")} className="p-2 text-slate-400 hover:text-white transition-colors">
              <UserIcon size={19} />
            </button>
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
            >
              <LogOut size={19} />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest ${
              isResumeMode 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}>
              {isResumeMode ? <Sparkles size={12} /> : null}
              {isResumeMode ? "Personalized Mode Active" : "General Mode"}
            </div>
            
            <h2 className="text-5xl font-extrabold tracking-tight text-white">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.displayName?.split(' ')[0] || 'Candidate'}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl">
              {isResumeMode 
                ? "We've analyzed your resume. Select a role below to start an interview tailored to your experience." 
                : "Select a career path to begin a standard AI interview simulation."}
            </p>
          </div>

          {/* TOOLBAR: Search and Question Limit */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="relative sm:w-48 group">
              <Settings2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <select
                value={questionLimit}
                onChange={(e) => setQuestionLimit(Number(e.target.value))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none cursor-pointer text-slate-300 transition-all hover:bg-white/[0.06]"
              >
                <option value={3} className="bg-black">3 Questions</option>
                <option value={5} className="bg-black">5 Questions</option>
                <option value={8} className="bg-black">8 Questions</option>
                <option value={10} className="bg-black">10 Questions</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Job Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredJobs.map((job, i) => (
            <div
              key={i}
              onClick={() => handleJobSelect(job)}
              className="group relative bg-white/[0.02] border border-white/[0.06] p-8 rounded-[2rem] overflow-hidden hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 cursor-pointer flex flex-col justify-between min-h-[240px]"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
              <div>
                <div className="w-12 h-12 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-500">
                  <Briefcase size={22} className="text-slate-300 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight">
                  {job}
                </h3>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-300">
                    {isResumeMode ? "Start Custom Session" : "Start Practice"}
                  </span>
                  <span className="text-[10px] text-indigo-400/60 font-medium">Session: {questionLimit} Qs</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:translate-x-1 transition-all duration-300">
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0D0D0F] border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut size={28} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-2">Sign Out</h3>
            <p className="text-slate-400 text-center text-sm mb-8">Are you sure you want to leave?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={handleConfirmLogout} className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-500 transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <DashboardContent />
    </Suspense>
  );
}