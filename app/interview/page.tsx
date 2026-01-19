"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Bot, Mic } from "lucide-react";

export default function InterviewPage() {
  const [userName, setUserName] = useState("User");
  const [question, setQuestion] = useState("");
  const [listening, setListening] = useState(false);

  // Get logged-in user's name
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.displayName) {
        setUserName(user.displayName);
      }
    });

    return () => unsub();
  }, []);

  // Speak AI question
  const speakAI = (text: string) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  };

  // Start Interview
  const startInterview = () => {
    const firstQuestion = `Hello ${userName}. Welcome to your Back End interview interview. Tell me about yourself.`;
    setQuestion(firstQuestion);
    speakAI(firstQuestion);
  };

  // User speaks
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = (event: any) => {
      const userAnswer = event.results[0][0].transcript;
      setListening(false);

      // TEMP next question (AI logic already exists in your API)
      const nextQuestion = "Thank you. Can you explain your backend experience?";
      setQuestion(nextQuestion);
      speakAI(nextQuestion);
    };

    recognition.onend = () => setListening(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-center px-10">
      
      {/* TOP INTERVIEW CARDS */}
      <div className="grid grid-cols-2 gap-8 mb-10">

        {/* AI INTERVIEWER */}
        <div className="bg-[#0f0f14] rounded-2xl h-64 flex flex-col items-center justify-center border border-white/10">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Bot size={36} />
          </div>
          <p className="font-semibold">AI Interviewer</p>
        </div>

        {/* USER */}
        <div className="bg-[#0f0f14] rounded-2xl h-64 flex flex-col items-center justify-center border border-white/10">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="font-semibold">{userName}</p>
        </div>
      </div>

      {/* QUESTION BAR */}
      <div className="bg-[#0f0f14] rounded-xl p-6 flex items-center justify-between border border-white/10">
        <p className="text-sm text-gray-200 max-w-4xl">
          {question || "Click Start Interview to begin"}
        </p>

        {!question ? (
          <button
            onClick={startInterview}
            className="bg-indigo-600 px-6 py-3 rounded-full font-semibold"
          >
            Start Interview
          </button>
        ) : (
          <button
            onClick={startListening}
            className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 ${
              listening ? "bg-red-600" : "bg-indigo-600"
            }`}
          >
            <Mic size={18} />
            {listening ? "Listening..." : "Speak"}
          </button>
        )}
      </div>
    </main>
  );
}
