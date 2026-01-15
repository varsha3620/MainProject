"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JobSelectionPage() {
  const router = useRouter();

  // Default role selected
  const [role, setRole] = useState("Frontend Developer");

  const startInterview = () => {
    router.push(`/interview?role=${role}`);
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
      <div className="w-full max-w-md bg-[#111118] border border-white/10 rounded-2xl p-8 shadow-xl">

        <h2 className="text-xl font-semibold text-white mb-6">
          Select Job Role
        </h2>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/40 text-white border border-white/10 mb-6"
        >
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="Full Stack Developer">Full Stack Developer</option>
          <option value="Data Analyst">Data Analyst</option>
        </select>

        <button
          onClick={startInterview}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold"
        >
          Start Interview
        </button>

      </div>
    </main>
  );
}
