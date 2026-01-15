"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";

export default function InterviewPage() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") || "Job";

  const [userName, setUserName] = useState("User");
  const [aiText, setAiText] = useState("");
  const [listening, setListening] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  const questions = [
    "Tell me about yourself.",
    "What are your strengths?",
    "What is your biggest weakness?",
    "Why should we hire you?",
  ];

  // 🔐 Get logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        const name = user.displayName || user.email || "User";
        setUserName(name);

        const intro = `Hello ${name}. Welcome to your ${role} interview. ${questions[0]}`;
        setAiText(intro);
        speak(intro);
      }
    });

    return () => unsub();
  }, [router]);

  // 🔊 AI SPEAKS
  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
  };

  // 🎤 USER SPEAKS
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = () => {
      setListening(false);
      nextQuestion();
    };

    recognition.onend = () => setListening(false);
  };

  // 🔁 NEXT QUESTION
  const nextQuestion = () => {
    const next = questionIndex + 1;

    if (next < questions.length) {
      setQuestionIndex(next);
      setAiText(questions[next]);
      speak(questions[next]);
    } else {
      const endText = "Interview completed. Thank you.";
      setAiText(endText);
      speak(endText);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-6xl grid grid-cols-2 gap-8">

        {/* 🤖 AI INTERVIEWER */}
        <div className="bg-[#111118] rounded-2xl p-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl">
            🤖
          </div>
          <h2 className="mt-4 font-semibold">AI Interviewer</h2>
        </div>

        {/* 👤 USER */}
        <div className="bg-[#111118] rounded-2xl p-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
            👤
          </div>
          <h2 className="mt-4 font-semibold">{userName}</h2>
        </div>

        {/* 🎙️ BOTTOM VOICE BAR */}
        <div className="col-span-2 bg-[#0F0F14] rounded-xl p-6 flex items-center justify-between">
          <p className="text-gray-300 max-w-3xl">{aiText}</p>

          <button
            onClick={startListening}
            className={`px-6 py-3 rounded-full font-semibold ${
              listening ? "bg-red-600" : "bg-indigo-600"
            }`}
          >
            {listening ? "Listening..." : "Speak"}
          </button>
        </div>

      </div>
    </main>
  );
}