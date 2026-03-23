"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Bot, 
  Mic, 
  Square, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);

  const [userName, setUserName] = useState("Candidate");
  const [isCalling, setIsCalling] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const jobRole = searchParams.get("role") || "Software Developer";

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!key) return;

    const vapi = new Vapi(key);
    vapiRef.current = vapi;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.displayName) setUserName(user.displayName);
      else if (user?.email) setUserName(user.email.split("@")[0]);
    });

    vapi.on("call-start", () => {
      setIsCalling(true);
      setInterviewEnded(false);
      setFullTranscript("");
    });

    vapi.on("call-end", () => {
      setIsCalling(false);
      setInterviewEnded(true);
    });

    vapi.on("message", (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        if (message.role === "assistant") {
          setActiveSpeech(message.transcript);
          setFullTranscript(prev => prev + "\nInterviewer: " + message.transcript);
        }
        if (message.role === "user") {
          setFullTranscript(prev => prev + "\nCandidate: " + message.transcript);
        }
      }
    });

    return () => {
      vapi.stop();
      unsubscribe();
    };
  }, []);

  const startInterview = async () => {
    try {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      const mode = searchParams.get("mode");
      
      if (!assistantId || !vapiRef.current) return;
  
      let assistantOverrides: any = null; 
  
      // Fetching resume if in resume mode to pass as variables
      let resumeContent = "No resume provided.";
      if (mode === "resume" && auth.currentUser) {
        const { data } = await supabase
          .from("users")
          .select("resume_text")
          .eq("firebase_uid", auth.currentUser.uid)
          .single();
        if (data?.resume_text) {
          resumeContent = data.resume_text.replace(/[\n\r\t]/g, " ").slice(0, 2000);
        }
      }

      // We send the DATA, but let Vapi Dashboard handle the INSTRUCTIONS
      assistantOverrides = {
        variableValues: {
          jobRole: jobRole,
          resumeText: resumeContent,
          candidateName: userName
        }
      };
  
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Vapi uses the assistantId's instructions from the dashboard
      // and injects the variables above into your prompt.
      await vapiRef.current.start(assistantId, assistantOverrides);
  
    } catch (error) {
      console.error("Vapi Start Detailed Error:", error);
    }
  };

  const goToFeedback = async () => {
    if (!fullTranscript) return;
    setIsSaving(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      const { data: existingUser } = await supabase.from("users").select("*").eq("firebase_uid", user.uid).single();
      if (!existingUser) {
        await supabase.from("users").insert({ firebase_uid: user.uid, name: user.displayName, email: user.email });
      }

      const { data, error } = await supabase.from("interviews").insert({
        user_id: user.uid,
        role: jobRole,
        transcript: fullTranscript,
      }).select().single();

      if (!error) router.push(`/feedback?interviewId=${data.id}`);
    } catch (err) {
      alert("Failed to save interview.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans overflow-hidden flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[160px] rounded-full" />
      </div>

      <header className="relative z-10 px-8 py-6 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Exit Session
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-1">Live Interview</span>
          <h2 className="text-sm font-semibold text-slate-200">{jobRole}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={12} /> Encrypted
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className={`relative aspect-video rounded-[2.5rem] overflow-hidden border transition-all duration-700 ${isCalling ? 'border-indigo-500/50 bg-[#08080C] shadow-[0_0_40px_-10px_rgba(79,70,229,0.2)]' : 'border-white/5 bg-white/[0.02]'}`}>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isCalling ? 'bg-indigo-600 shadow-lg shadow-indigo-500/40' : 'bg-white/5'}`}>
                <Bot size={44} className={isCalling ? 'text-white' : 'text-slate-600'} />
              </div>
              <p className={`mt-6 text-xs font-bold uppercase tracking-widest ${isCalling ? 'text-indigo-400' : 'text-slate-500'}`}>AI Interviewer</p>
              {isCalling && (
                <div className="mt-8 flex items-end gap-1 h-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-3xl font-bold text-slate-400 shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-500">{userName} (You)</p>
          </div>
        </div>

        <div className="w-full max-w-3xl min-h-[120px] flex items-center justify-center text-center px-6">
          {activeSpeech ? (
            <p className="text-2xl md:text-3xl font-medium text-white leading-snug tracking-tight drop-shadow-sm">"{activeSpeech}"</p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="text-indigo-500/40" size={24} />
              <p className="text-slate-500 italic text-sm">
                {isCalling ? "Listening for AI response..." : "Initialize session to begin the conversation"}
              </p>
            </div>
          )}
        </div>
      </main>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pb-12">
        {!isCalling ? (
          <button
            onClick={startInterview}
            className="group flex items-center gap-3 bg-white text-black hover:bg-indigo-500 hover:text-white px-10 py-5 rounded-2xl font-bold transition-all duration-300 shadow-xl"
          >
            <Mic size={20} /> Start Session
          </button>
        ) : (
          <button
            onClick={() => vapiRef.current?.stop()}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-red-500/20"
          >
            <Square size={20} /> End Session
          </button>
        )}

        {interviewEnded && (
          <button
            onClick={goToFeedback}
            disabled={isSaving}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Generate Full Report"}
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}