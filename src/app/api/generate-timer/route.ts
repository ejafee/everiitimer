import { NextResponse } from "next/server";
import { generateTimerFromPrompt } from "@/lib/gemini";

export const runtime = "nodejs";

interface GenerateRequest {
  prompt?: string;
  apiKey?: string;
}

export async function POST(req: Request): Promise<Response> {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }
  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 },
    );
  }
  if (prompt.length > 1000) {
    return NextResponse.json(
      { error: "Prompt too long (max 1000 chars)" },
      { status: 400 },
    );
  }
  const result = await generateTimerFromPrompt(prompt, body.apiKey);
  return NextResponse.json(result);
}

export function GET(): Response {
  return NextResponse.json({
    status: "ok",
    endpoint: "POST { prompt, apiKey? }",
  });
}
