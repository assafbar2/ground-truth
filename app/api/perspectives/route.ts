import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a neutral AI that generates ideologically diverse perspectives on news topics.
For a given topic, generate exactly 5 perspectives representing different political ideologies.
Return ONLY valid JSON, no markdown, no explanation.`;

const USER_PROMPT = (topic: string) => `Generate 5 ideological perspectives on the following news topic: "${topic}"

Return a JSON object with this exact structure:
{
  "perspectives": [
    {
      "ideology": "Left",
      "headline": "newspaper-style headline written from this ideology's lens",
      "tagline": "one sentence capturing the core framing",
      "body": "3-4 sentences. Substantive, not a caricature. Reads like a real editorial.",
      "keyValues": ["value 1", "value 2", "value 3"]
    },
    {
      "ideology": "Center-Left",
      "headline": "...",
      "tagline": "...",
      "body": "...",
      "keyValues": ["value 1", "value 2", "value 3"]
    },
    {
      "ideology": "Center",
      "headline": "...",
      "tagline": "...",
      "body": "...",
      "keyValues": ["value 1", "value 2", "value 3"]
    },
    {
      "ideology": "Center-Right",
      "headline": "...",
      "tagline": "...",
      "body": "...",
      "keyValues": ["value 1", "value 2", "value 3"]
    },
    {
      "ideology": "Right",
      "headline": "...",
      "tagline": "...",
      "body": "...",
      "keyValues": ["value 1", "value 2", "value 3"]
    }
  ]
}

Rules:
- Each perspective must be substantive and internally consistent with its ideology
- Headlines should sound like real newspaper headlines
- Body text should read like a real editorial, not a caricature
- Key values should be specific to this topic, not generic ideology labels
- Do NOT include any text outside the JSON object`;

interface Perspective {
  ideology: string;
  headline: string;
  tagline: string;
  body: string;
  keyValues: string[];
}

interface PerspectivesResponse {
  perspectives: Perspective[];
}

async function fetchPerspectives(topic: string): Promise<PerspectivesResponse> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY not configured");

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT(topic) },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`xAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from xAI");

  return JSON.parse(content) as PerspectivesResponse;
}

export async function POST(req: NextRequest) {
  let topic: string;

  try {
    const body = await req.json();
    topic = (body.topic || "").trim().slice(0, 500);
  } catch {
    return NextResponse.json({ error: "Please enter a topic." }, { status: 400 });
  }

  if (!topic) {
    return NextResponse.json({ error: "Please enter a topic." }, { status: 400 });
  }

  // Try once, retry on JSON parse failure
  let result: PerspectivesResponse;
  try {
    result = await fetchPerspectives(topic);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Retry once on parse errors
    if (msg.includes("JSON") || msg.includes("parse")) {
      try {
        result = await fetchPerspectives(topic);
      } catch {
        return NextResponse.json(
          { error: "Couldn't reach a perspective on that. Try again." },
          { status: 502 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Couldn't reach a perspective on that. Try again." },
        { status: 502 }
      );
    }
  }

  if (!result?.perspectives?.length) {
    return NextResponse.json(
      { error: "Couldn't reach a perspective on that. Try again." },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}
