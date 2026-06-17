FROM node:24-alpine

WORKDIR /app

RUN npm install -g pnpm@11.1.1

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["./node_modules/.bin/tsx", "src/server.ts"]
