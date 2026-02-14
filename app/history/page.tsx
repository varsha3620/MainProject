"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">My Interviews</h1>

      {loading ? (
        <p className="text-purple-400">Loading interviews...</p>
      ) : interviews.length === 0 ? (
        <p className="text-gray-400">No interviews found.</p>
      ) : (
        <div className="space-y-6">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="bg-[#0f0f14] p-6 rounded-xl border border-white/10"
            >
              <p className="text-lg font-semibold text-indigo-400">
                {item.role}
              </p>

              <p className="text-sm text-gray-400 mb-4">
                {item.createdAt?.toDate?.().toLocaleString() || "Date unknown"}
              </p>

              <button
                onClick={() =>
                  router.push(
                    `/feedback?interviewId=${item.id}`
                  )
                }
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-semibold"
              >
                View Feedback
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
