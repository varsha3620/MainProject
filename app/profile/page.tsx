"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Upload, CheckCircle, Loader } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [summary, setSummary] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState("");
  const [jobPreferences, setJobPreferences] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setEmail(currentUser.email || "");
        
        // Fetch existing profile
        const profileRef = doc(db, "userProfiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setFullName(data.fullName || "");
          setPhone(data.phone || "");
          setExperience(data.experience || "");
          setSkills(data.skills || "");
          setSummary(data.summary || "");
          setJobPreferences(data.jobPreferences || "");
          setResumeName(data.resumeName || "");
          setProfileCompleted(!!data.fullName);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
      setResumeName(file.name);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!fullName || !experience || !skills || !summary) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const profileRef = doc(db, "userProfiles", user.uid);
      await setDoc(profileRef, {
        userId: user.uid,
        email: user.email,
        fullName,
        phone,
        experience,
        skills: skills.split(",").map((s: string) => s.trim()),
        summary,
        jobPreferences,
        resumeName: resumeName || "Not uploaded",
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      setProfileCompleted(true);
      alert("Profile saved successfully!");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">
            Tell us about yourself to get personalized job recommendations
          </p>
        </div>

        {profileCompleted && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} className="text-green-500" />
            <span className="text-green-500">Profile already set up</span>
          </div>
        )}

        <div className="bg-[#111118] border border-white/10 rounded-2xl p-8">
          {/* BASIC INFO */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/40 text-white border border-white/10 focus:border-indigo-500 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Email (Auto-filled)
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-3 rounded-xl bg-black/40 text-gray-500 border border-white/10 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/40 text-white border border-white/10 focus:border-indigo-500 outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Years of Experience *
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/40 text-white border border-white/10 focus:border-indigo-500 outline-none"
                >
                  <option value="">Select experience</option>
                  <option value="Fresher (0-1 years)">Fresher (0-1 years)</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
            </div>
          </div>

          {/* SKILLS & EXPERIENCE */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Skills & Background</h2>

            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">
                Skills (comma-separated) *
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/40 text-white border border-white/10 focus:border-indigo-500 outline-none"
                placeholder="e.g., JavaScript, React, Node.js, Python, Data Analysis"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-2">
                Enter your skills separated by commas
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">
                Professional Summary *
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/40 text-white border border-white/10 focus:border-indigo-500 outline-none"
                placeholder="Tell us about your professional background, achievements, and career goals..."
                rows={4}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">
                Job Preferences
              </label>
              <textarea
                value={jobPreferences}
                onChange={(e) => setJobPreferences(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/40 text-white border border-white/10 focus:border-indigo-500 outline-none"
                placeholder="e.g., Remote work, Startups, Fortune 500 companies, Specific industries..."
                rows={3}
              />
            </div>
          </div>

          {/* RESUME UPLOAD */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Resume Upload</h2>
            
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-indigo-500 transition cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleResumeUpload}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer block">
                <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                <p className="text-white font-semibold mb-1">
                  {resumeName ? `📄 ${resumeName}` : "Upload your resume"}
                </p>
                <p className="text-sm text-gray-400">
                  PDF, DOC, DOCX or TXT (optional)
                </p>
              </label>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader size={20} className="animate-spin" />}
              {saving ? "Saving..." : "Save Profile"}
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:border-indigo-500 transition"
            >
              Skip for Now
            </button>
          </div>

          {/* LOGOUT */}
          <div className="mt-6 pt-6 border-t border-white/10">
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
      </div>
    </main>
  );
}
