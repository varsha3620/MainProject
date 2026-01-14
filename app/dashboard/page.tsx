"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

const interviews = [
  {
    title: "Front End Interview",
    image: "/images/frontend.png",
  },
  {
    title: "Back End Interview",
    image: "/images/backend.png",
  },
  {
    title: "Mobile Developer Interview",
    image: "/images/mobile.png",
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
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl p-8 mb-12">
          <h1 className="text-3xl font-bold mb-3">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </h1>
          <p className="text-gray-300">
            Practice real interview questions & get instant feedback
          </p>
        </div>

        {/* YOUR INTERVIEWS */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Your Interviews</h2>
          <p className="text-gray-400">
            You haven’t taken any interviews yet
          </p>
        </div>

        {/* TAKE INTERVIEWS */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Take Interviews</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {interviews.map((item, index) => (
              <div
                key={index}
                onClick={() =>
                  router.push(`/interview?role=${item.title}`)
                }
                className="cursor-pointer bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-indigo-500 transition"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={50}
                  height={50}
                  className="mb-4"
                />

                <h3 className="text-lg font-semibold mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-400">
                  You haven’t taken this interview yet. Take it now to
                  improve your skills.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* LOGOUT */}
        <div className="mt-12">
          <button
            onClick={async () => {
              await signOut(auth);
              router.push("/login");
            }}
            className="text-gray-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}
