FROM node:22-bookworm-slim AS builder

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./

COPY src ./src

RUN npm run build


FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=America/La_Paz

COPY package*.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Assets necesarios para los reportes
COPY --from=builder /app/src/assets ./dist/assets

# Fuentes para PDFMake
COPY --from=builder /app/src/fonts ./dist/fonts

RUN useradd \
    --system \
    --uid 1001 \
    --create-home \
    nodeapp \
    && mkdir -p /app/uploads \
    && chown -R nodeapp:nodeapp /app

USER nodeapp

EXPOSE 3000

CMD ["node", "dist/app.js"]
