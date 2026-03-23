import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { role, transcript } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Missing Groq API Key");

    const trimmedTranscript = transcript.slice(0, 8000);

    const systemPrompt = `You are a senior technical interview evaluator. 
Evaluate the following interview transcript for the role of ${role}.`;

    const userPrompt = `
Return feedback STRICTLY in this format:

Feedback on the Interview - ${role}

Overall Impression: <score>/100
Date: ${new Date().toLocaleString()}

Summary:
(Professional summary paragraph.)

Breakdown of the Interview:
1. Communication Skills (score/100) - (Explanation)
2. Technical Knowledge (score/100) - (Explanation)
3. Problem Solving (score/100) - (Explanation)
4. Cultural Fit (score/100) - (Explanation)
5. Confidence and Clarity (score/100) - (Explanation)

Strengths:
- Bullet point
- Bullet point

Areas for Improvement:
- Bullet point
- Bullet point

Transcript:
${trimmedTranscript}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      throw new Error("Groq API failed");
    }

    const data = await response.json();

    const feedback =
      data.choices?.[0]?.message?.content ||
      "No feedback generated.";

    const scoreMatch = feedback.match(/Overall Impression:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    return NextResponse.json({
      feedback,
      score
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json(
      { feedback: "Server error generating feedback." },
      { status: 500 }
    );
  }
}
