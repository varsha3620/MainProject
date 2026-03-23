import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingPage from "./onboarding/page"; // Or wherever your landing component lives

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  // 1. If the user is logged in, send them straight to the dashboard
  if (token) {
    redirect("/dashboard");
  }

  // 2. If NOT logged in, do NOT redirect to login. 
  // Instead, show the Landing/Intro content.
  return (
    <main>
       <OnboardingPage /> 
    </main>
  );
}