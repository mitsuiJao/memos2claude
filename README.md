## claude4memos
Memos に特定のタグを含むメモを投稿すると、Claude が自動でコメントを返します。

## 対応タグ

| タグ | 動作 |
|------|------|
| `#expand` | アイデアを拡張・補足 |
| `#critique` | 批評・フィードバック |
| `#question` | 質問を生成 |
| `#summarize` | 要約 |
| `#action` | アクションアイテム抽出 |

---

## セットアップ

### 1. ファイルを取得

```bash
curl -fsSL https://raw.githubusercontent.com/mitsuijao/claude4memos/main/setup.sh | bash
cd claude4memos
```

### 2. Bot 用アカウントを作成（推奨）

他ユーザーのメモにも返信させる場合は、Memos に専用の Bot アカウントを用意します。

1. Memos 管理画面 → Users → Create User でアカウントを作成
2. Bot ユーザーでログイン → Settings → Access Tokens でトークンを発行

privateのmemoにも反応させるためには Bot アカウントを管理者にします。

### 3. .env を編集

```env
CLAUDE_API=sk-ant-api03-...      # https://console.anthropic.com でキー取得
MEMOS_TOKEN=memos_pat_...        # Bot ユーザーの Personal Access Token
BOT_USERNAME=claude              # Bot のユーザー名（自己レスループ防止用）
RATE_LIMIT_SECONDS=300           # 同タグの連続実行を制限する秒数（デフォルト: 300）
```

### 4. 起動

```bash
docker compose up -d
```

### 5. Webhook を登録

返信が必要な **各ユーザー**が Memos の Settings → Webhooks で以下を追加：

- URL: `http://claude4memos:3000/webhook`

docker compose を使うためホスト名はコンテナ名になります。

---

## プロンプトのカスタマイズ

`data/prompts.json` を編集することで、タグとシステムプロンプトを自由に追加・変更できます。
コンテナの再起動は不要で、次のwebhook受信時から反映されます。

```json
{
  "expand": "...",
  "mynewtag": "You are a ..."
}
```

---

## 更新

```bash
docker compose pull && docker compose up -d
```

## 停止

```bash
docker compose down
```

## トラブルシューティング

### ログ確認
```bash
docker compose logs claude4memos -f
```

### レート制限のリセット（同じタグで 5 分以内に再試行したい場合）
```bash
sqlite3 ./data/rate_limit.db "DELETE FROM rate_limits;"
```

### ユーザー一覧・ID 確認
```bash
sqlite3 ~/.memos/memos_prod.db "SELECT id, username, role FROM user;"
```
