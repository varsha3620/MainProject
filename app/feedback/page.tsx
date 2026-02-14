"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FeedbackPage() {
  const router = useRouter();

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateFeedback = async () => {
      try {
        const transcript =
          typeof window !== "undefined"
            ? localStorage.getItem("interviewTranscript")
            : null;

        const role =
          typeof window !== "undefined"
            ? localStorage.getItem("interviewRole")
            : null;

        if (!transcript || !role) {
          setFeedback("No interview transcript found.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/generate-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            transcript,
          }),
        });

        if (!res.ok) {
          throw new Error("API request failed");
        }

        const data = await res.json();
        setFeedback(data.feedback);

      } catch (error) {
        console.error("Feedback Error:", error);
        setFeedback("Error generating feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    generateFeedback();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="bg-[#0f0f14] p-12 rounded-3xl border border-white/10 w-full max-w-4xl shadow-xl">

        <h1 className="text-3xl font-bold mb-8 text-white">
          Interview Feedback Report
        </h1>

        {loading ? (
          <p className="text-purple-400 animate-pulse">
            Analyzing your interview...
          </p>
        ) : (
          <div className="text-gray-300 whitespace-pre-line leading-relaxed space-y-4">
            {feedback}
          </div>
        )}

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-10 bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-xl font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}
