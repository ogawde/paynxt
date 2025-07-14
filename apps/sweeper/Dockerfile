FROM node:22

RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY packages ./packages
COPY apps/sweeper ./apps/sweeper

RUN pnpm install --frozen-lockfile

RUN pnpm build --filter=@paynxt/sweeper

WORKDIR /app/apps/sweeper

CMD ["npx", "tsx", "src/index.ts"]



