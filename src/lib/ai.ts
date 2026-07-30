import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAiHint(code: string, problem: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a coding mentor. Give a concise hint (2-3 sentences) to help the user solve the problem without giving away the full solution.",
      },
      {
        role: "user",
        content: `Problem: ${problem}\n\nCurrent code:\n${code}`,
      },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? "No hint available.";
}

export async function getCodeReview(
  code: string,
  problem: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a code reviewer. Analyze the solution and provide brief feedback on correctness, efficiency, and style. Keep it under 5 sentences.",
      },
      {
        role: "user",
        content: `Problem: ${problem}\n\nSolution:\n${code}`,
      },
    ],
    max_tokens: 300,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content ?? "No review available.";
}
