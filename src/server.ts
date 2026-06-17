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
  console.log('[webhook] received:', JSON.stringify(body));

  if (!body || typeof body !== 'object') {
    console.log('[webhook] invalid body, skipping');
    return;
  }
  const b = body as Record<string, unknown>;

  if (b.activityType !== 'memos.memo.created') {
    console.log('[webhook] activityType is not memos.memo.created:', b.activityType);
    return;
  }

  const memo = (b.payload as Record<string, unknown>)?.memo as
    | Record<string, unknown>
    | undefined;
  if (!memo) {
    console.log('[webhook] no memo in payload');
    return;
  }

  const memoName = memo.name as string | undefined;
  const content = memo.content as string | undefined;
  const creatorId = memo.creatorId as number | undefined;
  const visibility = memo.visibility as number | undefined;
  const tags = (memo.tags as string[] | undefined) ?? [];

  console.log(`[webhook] memoName=${memoName} creatorId=${creatorId} tags=${JSON.stringify(tags)}`);

  if (!memoName || !content || creatorId == null) {
    console.log('[webhook] missing required fields, skipping');
    return;
  }

  const tag = VALID_TAGS.find((t) => tags.includes(t));
  if (!tag) {
    console.log(`[webhook] no valid tag found (valid: ${VALID_TAGS.join(', ')}), skipping`);
    return;
  }

  console.log(`[webhook] processing tag=${tag} for memo=${memoName}`);

  const result = checkAndUpdate(creatorId, tag);
  if (!result.allowed) {
    await postComment(
      memoName,
      `レート制限中です。あと ${result.waitSeconds} 秒後に再試行してください。(#${tag})`,
      visibility
    );
    return;
  }

  try {
    console.log(`[webhook] calling Claude API...`);
    const response = await callClaude(tag, content);
    console.log(`[webhook] Claude responded, posting comment to ${memoName}`);
    await postComment(memoName, response, visibility);
    console.log(`[webhook] done`);
  } catch (err) {
    console.error('Error processing webhook:', err);
    try {
      await postComment(
        memoName,
        `エラーが発生しました: ${err instanceof Error ? err.message : String(err)}`,
        visibility
      );
    } catch (postErr) {
      console.error('Failed to post error comment:', postErr);
    }
  }
}

app.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
