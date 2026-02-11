"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

// UNIVERSAL JOB CATEGORIES
const interviews = [
  {
    title: "Professional Skills",
    description: "Ideal for Management, Admin, or General Office roles.",
    image: "/images/professional.png", 
  },
  {
    title: "Healthcare & Science",
    description: "Practice interviews for Nursing, Lab Tech, or Pharmacy.",
    image: "/images/healthcare.png",
  },
  {
    title: "Customer & Client Relations",
    description: "Focus on Hospitality, Sales, and Retail excellence.",
    image: "/images/service.png",
  },
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
    <main className="min-h-screen bg-[#0B0B0F] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HERO SECTION */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl p-8 mb-12 border border-white/5">
          <h1 className="text-3xl font-bold mb-3">
            Welcome back, {user.displayName || "Candidate"}
          </h1>
          <p className="text-gray-300">
            Based on your resume, here are the best interview simulations for you.
          </p>
        </div>

        {/* TAKE INTERVIEWS SECTION */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Choose Your Interview Field</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {interviews.map((item, index) => (
              <div
                key={index}
                onClick={() => router.push(`/interview?role=${item.title}`)}
                className="group cursor-pointer bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-indigo-500 hover:bg-[#161620] transition-all"
              >
                <div className="bg-indigo-600/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <span className="text-2xl">💼</span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                
                <span className="text-indigo-400 text-sm font-medium group-hover:underline">
                  Start Practice →
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* LOGOUT */}
        <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
          <p className="text-xs text-gray-500">Universal Career AI v1.0</p>
          <button
            onClick={async () => {
              await signOut(auth);
              router.push("/login");
            }}
            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm transition"
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}