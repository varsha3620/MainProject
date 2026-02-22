"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interviewId");

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateFeedback = async () => {
      const user = auth.currentUser;

      if (!user || !interviewId) {
        setFeedback("Interview not found.");
        setLoading(false);
        return;
      }

      try {
        // ✅ 1. Get interview document from Firestore
        const interviewRef = doc(
          db,
          "users",
          user.uid,
          "interviews",
          interviewId
        );

        const snap = await getDoc(interviewRef);

        if (!snap.exists()) {
          setFeedback("Interview not found.");
          setLoading(false);
          return;
        }

        const interviewData = snap.data();

        // ✅ 2. If feedback already exists → just show it
        if (interviewData.feedback) {
          setFeedback(interviewData.feedback);
          setLoading(false);
          return;
        }

        // ✅ 3. Generate feedback using transcript from Firestore
        const res = await fetch("/api/generate-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: interviewData.role,
            transcript: interviewData.transcript,
          }),
        });

        if (!res.ok) throw new Error("API request failed");

        const data = await res.json();

        setFeedback(data.feedback);

        // ✅ 4. Save feedback back to Firestore
        await updateDoc(interviewRef, {
          feedback: data.feedback,
        });

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