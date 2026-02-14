"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/onboarding");
    } catch {
      alert("Invalid email or password");
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
      <div className="bg-[#111118] p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-white text-xl mb-6">Login</h1>

        <input
          placeholder="Email"
          className="w-full mb-4 p-3 rounded bg-black/40 text-white"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 rounded bg-black/40 text-white"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-indigo-600 rounded-xl text-white mb-4"
        >
          Login
        </button>

        {/* SIGN IN LINK (THIS WAS MISSING) */}
        <p className="text-sm text-gray-400 text-center">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/signin")}
            className="text-indigo-400 cursor-pointer hover:underline"
          >
            Sign In
          </span>
        </p>

      </div>
    </main>
  );
}