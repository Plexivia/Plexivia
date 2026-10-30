# Stage 1: build the Vite React app
# Debian (glibc) base: the lockfile pins the linux-x64-gnu native bindings for rolldown, lightningcss and tailwind oxide
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=optional

COPY . .

# Empty = same-origin: nginx proxies /api (REST + WebSocket) to the backend container
ARG VITE_API_BASE_URL=""
ARG VITE_WS_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# Stage 2: static files served by nginx
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
