import express from 'express';
import { SYSTEMPROMPT, callClaude, type Tag } from './claude_api.js';
import { checkAndUpdate } from './db.js';
import { postComment } from './memos_api.js';

const VALID_TAGS = Object.keys(SYSTEMPROMPT) as Tag[];

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  res.json({ ok: true });
  void handleWebhook(req.body);
});

async function handleWebhook(body: unknown): Promise<void> {
  if (!body || typeof body !== 'object') return;
  const b = body as Record<string, unknown>;

  if (b.activityType !== 'memos.memo.created') return;

  const memo = (b.payload as Record<string, unknown>)?.memo as
    | Record<string, unknown>
    | undefined;
  if (!memo) return;

  const memoName = memo.name as string | undefined;
  const content = memo.content as string | undefined;
  const creatorId = memo.creatorId as number | undefined;
  const tags = (memo.tags as string[] | undefined) ?? [];

  if (!memoName || !content || creatorId == null) return;

  const tag = VALID_TAGS.find((t) => tags.includes(t));
  if (!tag) return;

  const result = checkAndUpdate(creatorId, tag);
  if (!result.allowed) {
    await postComment(
      memoName,
      `レート制限中です。あと ${result.waitSeconds} 秒後に再試行してください。(#${tag})`
    );
    return;
  }

  try {
    const response = await callClaude(tag, content);
    await postComment(memoName, response);
  } catch (err) {
    console.error('Error processing webhook:', err);
    try {
      await postComment(
        memoName,
        `エラーが発生しました: ${err instanceof Error ? err.message : String(err)}`
      );
    } catch (postErr) {
      console.error('Failed to post error comment:', postErr);
    }
  }
}

app.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
