"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interviewId");

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!interviewId) return;

    const generateFeedback = async () => {
      try {

        // 1️⃣ Get interview from Supabase
        const { data: interviewData, error } = await supabase
          .from("interviews")
          .select("*")
          .eq("id", interviewId)
          .single();

        if (error || !interviewData) {
          setFeedback("Interview not found.");
          return;
        }

        // 2️⃣ If feedback already exists → show it
        if (interviewData.feedback) {
          setFeedback(interviewData.feedback);
          return;
        }

        // 3️⃣ Generate feedback
        const res = await fetch("/api/generate-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: interviewData.role,
            transcript: interviewData.transcript,
          }),
        });

        if (!res.ok) throw new Error("Feedback API failed");

        const data = await res.json();

        const generatedFeedback = data.feedback || "No feedback generated.";
        const score = data.score ?? null;

        setFeedback(generatedFeedback);

        // 4️⃣ Save feedback + score
        const { error: updateError } = await supabase
          .from("interviews")
          .update({
            feedback: generatedFeedback,
            score: score
          })
          .eq("id", interviewId);

        if (updateError) {
          console.error("Supabase update error:", updateError);
        }

      } catch (error) {
        console.error("Feedback Error:", error);
        setFeedback("Error generating feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    generateFeedback();
  }, [interviewId]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="bg-[#0f0f14] p-12 rounded-3xl border border-white/10 w-full max-w-4xl shadow-xl">

        <h1 className="text-3xl font-bold mb-8 text-white">
          Interview Feedback Report
        </h1>

        {loading ? (
          <div className="space-y-4">
            <p className="text-purple-400 animate-pulse text-lg">
              Generating feedback...
            </p>
            <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
          </div>
        ) : (
          <div className="text-gray-300 whitespace-pre-line leading-relaxed space-y-4 font-mono text-sm">
            {feedback}
          </div>
        )}

        <button
          onClick={() => router.push("/onboarding")}
          className="mt-10 bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-xl font-semibold transition-all"
        >
          Back to History
        </button>

      </div>
    </main>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <FeedbackContent />
    </Suspense>
  );
}