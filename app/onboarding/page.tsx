"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

export default function OnboardingPage() {
  const [fullName, setFullName] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Ensure user is logged in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !resume) return;

    setLoading(true);
    try {
      // 1. Upload Resume to Firebase Storage
      const storageRef = ref(storage, `resumes/${auth.currentUser.uid}/${resume.name}`);
      await uploadBytes(storageRef, resume);
      const resumeUrl = await getDownloadURL(storageRef);

      // 2. Save Profile to Firestore (Universal Job Site Logic)
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name: fullName,
        resumeUrl: resumeUrl,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      });

      // 3. Redirect to Dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding Error:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-[#111118] border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold mb-2">Setup Your Profile</h1>
        <p className="text-gray-400 mb-8">This helps us tailor the AI interview to your career field.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Varsha Prabhakaran"
              className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none transition"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Upload Resume (PDF)</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-indigo-500/50 transition cursor-pointer relative">
              <input
                required
                type="file"
                accept=".pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
              />
              <p className="text-indigo-400 font-medium">
                {resume ? resume.name : "Click to upload resume"}
              </p>
              <p className="text-xs text-gray-500 mt-2">Support: PDF only</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? "Analyzing Profile..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </main>
  );
}