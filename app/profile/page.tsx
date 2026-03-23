"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    User as UserIcon,
    FileText,
    Upload,
    LogOut,
    Calendar,
    Trophy,
    ArrowLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    Loader2,
    History,
    Sparkles 
} from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [resume, setResume] = useState<File | null>(null);
    const [interviews, setInterviews] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [hasResumeText, setHasResumeText] = useState(false); 
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.replace("/login");
            } else {
                setUser(currentUser);

                // Check if user already has resume_text in DB
                const { data: userData } = await supabase
                    .from("users")
                    .select("resume_text")
                    .eq("firebase_uid", currentUser.uid)
                    .single();
                
                if (userData?.resume_text) setHasResumeText(true);

                const { data, error } = await supabase
                    .from("interviews")
                    .select("*")
                    .eq("user_id", currentUser.uid)
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (!error) setInterviews(data || []);
            }
        });

        return () => unsub();
    }, [router]);

    const handleResumeUpload = async () => {
        if (!resume) {
            alert("Please select a resume file");
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        setUploading(true);

        try {
            const filePath = `${currentUser.uid}/${Date.now()}_${resume.name}`;

            // 1. Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("resume")
                .upload(filePath, resume);

            if (uploadError) throw uploadError;

            // 2. Get the Public URL
            const { data } = supabase.storage.from("resume").getPublicUrl(filePath);
            const resumeUrl = data.publicUrl;

            // 3. Parse PDF Text via our API Route
            const parseResponse = await fetch("/api/parse_resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: resumeUrl }),
            });
            
            const { text, error: parseError } = await parseResponse.json();
            if (parseError) throw new Error(parseError);

            // 4. Update the Users Table with URL and extracted Text
            await supabase
                .from("users")
                .update({
                    resume_url: resumeUrl,
                    resume_text: text 
                })
                .eq("firebase_uid", currentUser.uid);

            setHasResumeText(true);
            alert("Resume uploaded and processed successfully!");
        } catch (err) {
            console.error(err);
            alert("Error processing resume. Please try a different PDF.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] text-slate-200 font-sans pb-20">
            <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-black/60 backdrop-blur-xl px-6 h-16 flex justify-between items-center">
                <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-all">
                    <ArrowLeft size={18} /> Back
                </button>
                <button onClick={() => signOut(auth)} className="text-red-400 hover:text-red-300 transition-colors">
                    <LogOut size={19} />
                </button>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-12">
                <section className="relative mb-12 bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-indigo-500/20">
                        {user?.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-extrabold text-white mb-1">{user?.displayName || "Prep User"}</h1>
                        <p className="text-slate-400 font-medium mb-4">{user?.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                                {interviews.length} Sessions Completed
                            </span>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-[#0D0D0F] border border-white/5 p-6 rounded-3xl">
                            <div className="flex items-center gap-2 mb-6">
                                <FileText size={18} className="text-indigo-400" />
                                <h2 className="font-bold text-white">Your Resume</h2>
                            </div>

                            <label className="group relative block w-full aspect-[4/5] border-2 border-dashed border-white/10 rounded-2xl hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden mb-4">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                    <Upload size={32} className="text-slate-600 mb-2 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                                    <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-300">
                                        {resume ? resume.name : "Tap to upload PDF"}
                                    </p>
                                </div>
                            </label>

                            <button
                                onClick={handleResumeUpload}
                                disabled={!resume || uploading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 mb-3"
                            >
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                {uploading ? "Processing..." : "Update Resume"}
                            </button>

                            {/* CORRECTED: Now redirects directly to Dashboard with resume mode enabled */}
                            {hasResumeText && (
                                <button
                                    onClick={() => router.push(`/dashboard?mode=resume`)} 
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2"
                                >
                                    <Sparkles size={16} />
                                    Personalized Interview
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <History size={18} className="text-indigo-400" />
                                <h2 className="font-bold text-white uppercase text-xs tracking-widest">Recent Performance</h2>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {interviews.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => router.push(`/feedback?interviewId=${item.id}`)}
                                    className="group bg-[#0D0D0F] border border-white/5 p-5 rounded-2xl hover:border-white/20 transition-all cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                            <Trophy size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{item.role}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                    <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                                <span className={`text-[10px] font-bold ${item.score >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    Score: {item.score || 'N/A'}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}