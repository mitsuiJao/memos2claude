#!/bin/bash
set -e

mkdir -p claude4memos/data && cd claude4memos
curl -fsSL https://raw.githubusercontent.com/mitsuijao/claude4memos/main/docker-compose.yml -o docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/mitsuijao/claude4memos/main/.env.example -o .env.example
curl -fsSL https://raw.githubusercontent.com/mitsuijao/claude4memos/main/data/prompts.json -o data/prompts.json
cp .env.example .env
echo "Done. Edit .env and run: docker compose up -d"
