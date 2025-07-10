FROM node:22

RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile

RUN pnpm build --filter=@paynxt/api

WORKDIR /app/apps/api

CMD ["node", "dist/index.js"]