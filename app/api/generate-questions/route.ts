import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { history, jobRole } = await req.json();

    const messages = [
      {
        role: "system",
        content: `You are a professional AI interviewer conducting a live voice interview for the role of ${jobRole}.
Ask one question at a time. Ask the next question based on the user's previous answer.
Do not repeat questions. Keep it conversational.`,
      },
      ...history.map((h: any) => ({
        role: h.role,
        content: h.parts[0].text,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const question = response.choices[0].message.content;

    return NextResponse.json({ question });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
