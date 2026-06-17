const MEMOS_HOST = process.env.MEMOS_HOST!;
const MEMOS_TOKEN = process.env.MEMOS_TOKEN!;

export async function postComment(memoName: string, content: string): Promise<void> {
  const res = await fetch(`${MEMOS_HOST}/api/v1/${memoName}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEMOS_TOKEN}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to post comment: ${res.status} ${body}`);
  }
}
