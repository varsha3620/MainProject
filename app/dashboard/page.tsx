"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsub();
  }, [router]);

  const jobs = [
    "Chartered Accountant (CA)",
    "Accountant",
    "HR Executive",
    "Office Manager",
    "Sales Executive",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack developer",
    "Data Analyst",
    "Pharmacist",
    "Medical coder",
    "Pharmacist",
    "Scool Teacher",
    "Assistant Professor",
    "Bank Clerk",
    "Financial Advisor",
  ];

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Available Jobs</h1>
        <p className="text-gray-400 mb-10">
          Choose a role to start interview practice.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job, i) => (
            <div
              key={i}
              onClick={() =>
                router.push(`/interview?role=${encodeURIComponent(job)}`)
              }
              className="bg-[#111118] border border-white/10 p-8 rounded-3xl hover:border-indigo-500 cursor-pointer transition group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                💼
              </div>
              <h3 className="text-xl font-bold mb-4">{job}</h3>
              <div className="text-indigo-400 font-bold group-hover:translate-x-2 transition-transform">
                Start Practice →
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
