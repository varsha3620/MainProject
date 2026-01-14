"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111118] p-8 shadow-xl text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          AI Interview
        </h1>

        <p className="text-gray-400 mb-8">
          Practice interviews with AI
        </p>

        <button
          onClick={login}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
