# ============================================================
# BUILD
# ============================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ============================================================
# NGINX
# ============================================================
FROM nginx:1.29-alpine


RUN apk update && apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*

ENV TZ=America/La_Paz

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 