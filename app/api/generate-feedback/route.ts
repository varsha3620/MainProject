import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { role, transcript } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a senior technical interview evaluator.

Evaluate this interview for the role of ${role}.

Return feedback STRICTLY in this format:

Feedback on the Interview - ${role}

Overall Impression: <score>/100
Date: ${new Date().toLocaleString()}

Summary:
(Professional summary paragraph.)

Breakdown of the Interview:

1. Communication Skills (score/100)
(Explanation)

2. Technical Knowledge (score/100)
(Explanation)

3. Problem Solving (score/100)
(Explanation)

4. Cultural Fit (score/100)
(Explanation)

5. Confidence and Clarity (score/100)
(Explanation)

Strengths:
- Bullet points

Areas for Improvement:
- Bullet points

Transcript:
${transcript}
`
                }
              ]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error("Gemini API failed");
    }

    const data = await response.json();

    const feedback =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No feedback generated.";

    return NextResponse.json({ feedback });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json(
      { feedback: "Server error generating feedback." },
      { status: 500 }
    );
  }
}
