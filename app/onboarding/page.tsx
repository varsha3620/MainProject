"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "interviews")
        );

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setInterviews(data);
      } catch (error) {
        console.error("Firestore error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-10">
        Your Interviews
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : interviews.length === 0 ? (
        <div className="space-y-6">
          <p className="text-gray-400">
            No interviews yet.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold"
          >
            Start Interview
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {interviews.map((item: any) => (
            <div
              key={item.id}
              className="bg-[#0f0f14] p-6 rounded-2xl border border-white/10 flex justify-between items-center"
            >
              {/* Interview Button */}
              <button
                onClick={() =>
                  router.push(
                    `/interview?role=${encodeURIComponent(item.role)}`
                  )
                }
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-semibold"
              >
                Interview
              </button>

              {/* Feedback Button */}
              {item.feedback ? (
                <button
                  onClick={() =>
                    router.push(
                      `/feedback?interviewId=${item.id}`
                    )
                  }
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-semibold"
                >
                  Feedback
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-700 px-4 py-2 rounded-md text-sm opacity-50"
                >
                  No Feedback
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
