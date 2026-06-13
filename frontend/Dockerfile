FROM node:22-alpine3.21

# Install pnpm directly rather than via `corepack enable`. The corepack bundled
# with this Node image ships outdated npm registry signing keys, so it fails to
# verify/fetch pnpm ("Cannot find matching keyid"). Installing pnpm with npm
# sidesteps that entirely.
RUN npm install -g pnpm@11.5.1

WORKDIR /app

# Install dependencies first for better layer caching. In docker-compose the
# source is bind-mounted over /app at runtime while node_modules lives in a
# named volume, so it survives the mount. pnpm-workspace.yaml carries our pnpm
# settings (notably the esbuild build-script approval Vite needs).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--", "--host", "0.0.0.0"]
