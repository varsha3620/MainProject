"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsub();
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#0B0B0F] px-6 py-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10">
        <p className="text-gray-400 text-sm">Welcome</p>
        <h1 className="text-2xl font-semibold text-white">
          Choose Your Interview Role
        </h1>
      </div>

      {/* Role Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div
            key={role}
            onClick={() => router.push(`/interview?role=${role}`)}
            className="cursor-pointer rounded-2xl border border-white/10 bg-[#111118] p-6 hover:border-indigo-500 transition"
          >
            <h2 className="text-lg font-semibold text-white mb-2">
              {role}
            </h2>
            <p className="text-sm text-gray-400">
              Practice interview questions for {role}
            </p>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="max-w-5xl mx-auto mt-10">
        <button
          onClick={async () => {
            await signOut(auth);
            router.push("/login");
          }}
          className="text-sm text-gray-400 hover:text-white"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
