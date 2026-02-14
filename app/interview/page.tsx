"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Bot, Mic, Square } from "lucide-react";

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);

  const [userName, setUserName] = useState("Candidate");
  const [status, setStatus] = useState("Idle");
  const [isCalling, setIsCalling] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  const [interviewEnded, setInterviewEnded] = useState(false);

  const jobRole = searchParams.get("role") || "Software Developer";

  // 🔥 INIT VAPI ONLY ONCE
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!key) return;

    const vapi = new Vapi(key);
    vapiRef.current = vapi;

    // Get logged in user name
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.displayName) {
        setUserName(user.displayName);
      } else if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }
    });

    // Call started
    vapi.on("call-start", () => {
      setIsCalling(true);
      setInterviewEnded(false);
      setFullTranscript("");
      setStatus("Interview in progress...");
    });

    // Call ended
    vapi.on("call-end", () => {
      setIsCalling(false);
      setInterviewEnded(true);
      setStatus("Interview ended");
    });

    // Listen to messages
    vapi.on("message", (message: any) => {
      // Only process FINAL transcripts
      if (
        message.type === "transcript" &&
        message.transcriptType === "final"
      ) {
        // Show ONLY interviewer speech on screen
        if (message.role === "assistant") {
          setActiveSpeech(message.transcript);
          setFullTranscript(
            (prev) => prev + "\nInterviewer: " + message.transcript
          );
        }

        // Store candidate speech but DO NOT display
        if (message.role === "user") {
          setFullTranscript(
            (prev) => prev + "\nCandidate: " + message.transcript
          );
        }
      }
    });

    vapi.on("speech-start", () => {
      setStatus("AI is speaking...");
    });

    vapi.on("speech-end", () => {
      setStatus("AI is listening...");
    });

    return () => {
      vapi.stop();
      unsubscribe();
    };
  }, []);

  // ✅ START INTERVIEW
  const startInterview = async () => {
    try {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      if (!assistantId || !vapiRef.current) return;

      // Request mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start assistant (no override to avoid audio issue)
      await vapiRef.current.start(assistantId);

    } catch (error) {
      console.error("Start Error:", error);
      alert("Microphone permission required.");
    }
  };

  // ✅ STOP INTERVIEW
  const stopInterview = () => {
    vapiRef.current?.stop();
  };

  // ✅ GO TO FEEDBACK
  const goToFeedback = () => {
    if (!fullTranscript) {
      alert("No conversation recorded.");
      return;
    }

    localStorage.setItem("interviewTranscript", fullTranscript);
    localStorage.setItem("interviewRole", jobRole);

    router.push("/feedback");
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-center px-10">

      {/* FEEDBACK BUTTON */}
      <div className="flex justify-end mb-4">
        {interviewEnded && (
          <button
            onClick={goToFeedback}
            className="text-sm bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg font-semibold"
          >
            View Feedback
          </button>
        )}
      </div>

      {/* AI + USER CARDS */}
      <div className="grid grid-cols-2 gap-8 mb-10">

        <div className="bg-[#0f0f14] rounded-2xl h-48 flex flex-col items-center justify-center border border-white/10">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isCalling ? "bg-green-600 animate-pulse" : "bg-indigo-600"
            }`}
          >
            <Bot size={32} />
          </div>
          <p className="text-sm text-gray-400 font-bold uppercase">
            AI Interviewer
          </p>
        </div>

        <div className="bg-[#0f0f14] rounded-2xl h-48 flex flex-col items-center justify-center border border-white/10">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-gray-400 font-bold uppercase">
            {userName}
          </p>
        </div>

      </div>

      {/* SHOW ONLY INTERVIEWER TEXT */}
      <div className="bg-[#0f0f14] rounded-xl p-8 text-center min-h-[140px] flex items-center justify-center border border-white/10 mb-8 shadow-inner">
        {activeSpeech ? (
          <p className="text-xl font-medium text-indigo-100 leading-relaxed">
            {activeSpeech}
          </p>
        ) : (
          <p className="text-gray-600 italic text-sm">
            Interview text will appear here once the AI speaks...
          </p>
        )}
      </div>

      {/* CONTROLS */}
      <div className="bg-[#0f0f14] rounded-xl p-6 flex items-center justify-between border border-white/10">
        <div>
          <p className="text-xs text-purple-400 font-bold uppercase mb-1">
            {status}
          </p>
          <p className="text-[10px] text-gray-500 uppercase font-bold">
            {jobRole}
          </p>
        </div>

        {!isCalling ? (
          <button
            onClick={startInterview}
            className="bg-indigo-600 hover:bg-indigo-700 px-10 py-3 rounded-full font-bold flex items-center gap-2"
          >
            <Mic size={18} /> Start Session
          </button>
        ) : (
          <button
            onClick={stopInterview}
            className="bg-red-600 hover:bg-red-700 px-10 py-3 rounded-full font-bold flex items-center gap-2"
          >
            <Square size={18} /> Stop Interview
          </button>
        )}
      </div>

    </main>
  );
}
