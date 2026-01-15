"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      router.push("/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
      <div className="bg-[#111118] p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-white text-xl mb-6">Create Account</h1>

        <input
          placeholder="Name"
          className="w-full mb-4 p-3 rounded bg-black/40 text-white"
          onChange={(e) => setName(e.target.value)}
        />
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
          onClick={handleSignIn}
          className="w-full py-3 bg-indigo-600 rounded-xl text-white"
        >
          Sign In
        </button>
      </div>
    </main>
  );
}