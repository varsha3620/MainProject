"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Bot, Mic, Square } from "lucide-react";

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const vapiRef = useRef<Vapi | null>(null);
  
  const [userName, setUserName] = useState("User");
  const [status, setStatus] = useState("Idle");
  const [isCalling, setIsCalling] = useState(false);

  const jobRole = searchParams.get("role") || "Software Developer";

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!key) return;

    vapiRef.current = new Vapi(key);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.displayName) setUserName(user.displayName);
    });

    vapiRef.current.on("call-start", () => {
      setIsCalling(true);
      setStatus("Interview in progress...");
    });
    vapiRef.current.on("call-end", () => {
      setIsCalling(false);
      setStatus("Interview ended");
    });
    vapiRef.current.on("speech-start", () => setStatus("AI is speaking..."));
    vapiRef.current.on("speech-end", () => setStatus("AI is listening..."));

    return () => {
      vapiRef.current?.stop();
      unsub();
    };
  }, []);

  const startInterview = async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!vapiRef.current || !assistantId) return;

    // The 'model' object requires 'provider' and 'model' to satisfy the Type
    const assistantOverrides = {
      variableValues: {
        name: userName,
        role: jobRole,
      },
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert technical interviewer. You are interviewing ${userName} for a ${jobRole} position. 
            1. Greet them and start the ${jobRole} interview.
            2. Ask one question at a time.
            3. Make sure the questions are specific to ${jobRole} skills.
            4. Wait for their response before asking the next question.`
          }
        ],
      }
    };

    // Casting as any avoids the strict Discriminated Union error in the SDK
    await vapiRef.current.start(assistantId, assistantOverrides as any);
  };

  const stopInterview = () => vapiRef.current?.stop();

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-center px-10">
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-[#0f0f14] rounded-2xl h-64 flex flex-col items-center justify-center border border-white/10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isCalling ? 'bg-green-600 animate-pulse' : 'bg-indigo-600'}`}>
            <Bot size={36} />
          </div>
          <p className="font-semibold text-gray-400">AI Interviewer</p>
          <p className="text-sm text-indigo-400 mt-2">Targeting: {jobRole}</p>
        </div>

        <div className="bg-[#0f0f14] rounded-2xl h-64 flex flex-col items-center justify-center border border-white/10">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-xl font-bold">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <p className="font-semibold">{userName}</p>
        </div>
      </div>

      <div className="bg-[#0f0f14] rounded-xl p-6 flex items-center justify-between border border-white/10">
        <div>
          <p className="text-sm text-purple-400 font-medium mb-1">{status}</p>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{jobRole} INTERVIEW</p>
        </div>

        {!isCalling ? (
          <button onClick={startInterview} className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all">
            <Mic size={18} /> Start {jobRole} Interview
          </button>
        ) : (
          <button onClick={stopInterview} className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all">
            <Square size={18} /> Stop
          </button>
        )}
      </div>
    </main>
  );
}