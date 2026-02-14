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
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0f0f14] to-black text-white px-6 py-16">

      {/* Page Header */}
      <div className="max-w-5xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Your Interview History
        </h1>
        <p className="text-gray-400 text-lg">
          Practice, improve, and review your AI interview performance.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">

        {loading ? (
          <div className="flex justify-center">
            <p className="text-gray-400 animate-pulse text-lg">
              Loading interviews...
            </p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-[#111118] border border-white/10 rounded-3xl p-12 text-center shadow-xl">
            <p className="text-gray-400 mb-6 text-lg">
              You haven’t completed any interviews yet.
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="bg-indigo-600 hover:bg-indigo-700 transition-all px-8 py-3 rounded-full font-semibold text-sm tracking-wide shadow-lg"
            >
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {interviews.map((item: any) => (
              <div
                key={item.id}
                className="bg-[#111118] border border-white/10 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 text-indigo-400">
                    {item.role}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Review or retry your interview session.
                  </p>
                </div>

                <div className="flex justify-between items-center gap-4">

                  {/* Interview Button */}
                  <button
                    onClick={() =>
                      router.push(
                        `/interview?role=${encodeURIComponent(item.role)}`
                      )
                    }
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition-all py-2 rounded-full text-sm font-semibold"
                  >
                    Interview Again
                  </button>

                  {/* Feedback Button */}
                  {item.feedback ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/feedback?interviewId=${item.id}`
                        )
                      }
                      className="flex-1 bg-purple-600 hover:bg-purple-700 transition-all py-2 rounded-full text-sm font-semibold"
                    >
                      View Feedback
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-700 py-2 rounded-full text-sm opacity-50 cursor-not-allowed"
                    >
                      Feedback
                    </button>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
