## memos-claude
memosに特定のタグを含むmemoを投稿すると、claudeがそのmemosに適切な応答をcommentします

## setup

### ディレクトリ作成
```bash
mkdir -p memos-claude
```

### .env ファイル作成
以下の様式を参考にしてください

- `CLAUDDE_CODE`: https://platform.claude.com/dashboard からクレジットを購入し、キーを取得してください
- `MEMOS_HOST`: memosを動かしてるURL
- `MEMOS_TOKEN`: 返答するアカウントのAPI、BOT用のアカウント作成がおすすめ

### dockerイメージを取得
```bash
docker pull ghcr.io/mitsuijao/memos2claude:latest
```

### 起動
```bash
  docker run -d \
    --name memos-claude \
	--restart unless-stopped \
    --env-file .env \
    -p 3000:3000 \
    -v $(pwd)/data:/app/data \
    ghcr.io/mitsuijao/memos-claude:latest
```

### 更新
```bash
docker pull ghcr.io/<username>/memos-claude:latest
docker stop memos-claude && docker rm memos-claude
```

そのあと起動コマンドを実行してください
