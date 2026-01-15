"use client";

import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold mb-2">
          AI Interview Practice
        </h1>
        <p className="text-gray-400 mb-10">
          Select a job role to start the interview
        </p>

        {/* JOB ROLES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div
              key={role}
              onClick={() =>
                router.push(`/interview?role=${role}`)
              }
              className="cursor-pointer bg-[#111118] border border-white/10 rounded-xl p-6 hover:border-indigo-500 transition"
            >
              <h2 className="text-lg font-semibold mb-2">
                {role}
              </h2>
              <p className="text-sm text-gray-400">
                Practice AI-based interview questions for this role
              </p>
            </div>
          ))}
        </div>

        {/* LOGOUT */}
        <button
          onClick={async () => {
            await signOut(auth);
            router.push("/login");
          }}
          className="mt-12 text-sm text-gray-400 hover:text-white"
        >
          Logout
        </button>

      </div>
    </main>
  );
}