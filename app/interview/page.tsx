"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function InterviewPage() {
  const params = useSearchParams();
  const router = useRouter();
  const role = params.get("role");
  const [answer, setAnswer] = useState("");

  return (
    <main className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-[#111118] border border-white/10 rounded-2xl p-8">

        <p className="text-sm text-gray-400 mb-2">
          Interview for {role}
        </p>

        <h2 className="text-xl font-semibold text-white mb-6">
          Tell me about yourself
        </h2>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full h-36 p-4 rounded-xl bg-black/40 text-white border border-white/10 mb-6"
        />

        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
          Submit Answer
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 mt-3 rounded-xl border border-white/10 text-gray-300"
        >
          End Interview
        </button>

      </div>
    </main>
  );
}
