## memos-claude
memosに特定のタグを含むmemoを投稿すると、claudeがそのmemosに適切な応答をcommentします

## setup

### ファイル作成
```bash
mkdir -p memos-claude
```

```bash
curl -O https://raw.githubusercontent.com/mitsuijao/memos_claude/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/mitsuijao/memos_claude/main/.env.example
```

- `CLAUDDE_CODE`: https://platform.claude.com/dashboard からクレジットを購入し、キーを取得してください
- `MEMOS_TOKEN`: 返答するアカウントのAPI、BOT用のアカウント作成がおすすめ


### 起動
```bash
docker compose up -d
```

### 更新
```bash
docker compose pull && docker compose up -d
```

### 
