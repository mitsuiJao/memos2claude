import Anthropic from '@anthropic-ai/sdk';

export const SYSTEMPROMPT = {
  expand: "You are a creative thinking assistant.\nThe user has written a brief idea or note in Japanese.\nExpand on it in a few sentences — suggest related angles \nor directions they haven't considered.\nBe concrete. Do not use bullet points.\nRespond in Japanese.",
  critique: 'You are a critical reviewer.\nThe user has written an idea or plan in Japanese.\nPoint out weak points, assumptions, or risks as a bullet list.\nBe direct. No filler.\nRespond in Japanese.',
  question: 'You are a Socratic thinking partner.\nThe user has written a note or idea in Japanese.\nGenerate 3–5 sharp questions that would help them\nthink deeper or clarify their thinking.\nAvoid obvious questions. Use a numbered list.\nRespond in Japanese.',
  summarize: 'You are a summarization assistant.\nThe user has written a long note in Japanese.\nCondense it into key points only. Use bullet points.\nNo padding, no filler.\nRespond in Japanese.',
  action: "You are a productivity assistant.\nThe user has written a note containing thoughts or plans.\nExtract concrete next actions as a numbered to-do list.\nIgnore anything that isn't actionable.\nRespond in Japanese.",
} as const;

export type Tag = keyof typeof SYSTEMPROMPT;

const client = new Anthropic({ apiKey: process.env.CLAUDE_API });

export async function callClaude(tag: Tag, content: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEMPROMPT[tag],
    messages: [{ role: 'user', content }],
  });
  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}
