import { NextResponse } from "next/server";
import pdf from "pdf-parse-fork";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // 1. Fetch the PDF from Supabase
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    // 2. Get the buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Parse with error handling for empty files
    if (buffer.length === 0) {
      throw new Error("PDF file is empty.");
    }

    const data = await pdf(buffer);

    // 4. Clean the extracted text (remove extra spaces/newlines)
    const cleanText = data.text.replace(/\s+/g, ' ').trim();

    if (!cleanText || cleanText.length < 10) {
      return NextResponse.json({ error: "Could not extract readable text." }, { status: 422 });
    }

    return NextResponse.json({ text: cleanText });

  } catch (error: any) {
    console.error("PDF Parse Server Error:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}