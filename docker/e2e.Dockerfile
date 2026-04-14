FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

COPY package*.json ./
COPY packages/dino-ge/package*.json ./packages/dino-ge/
COPY packages/playground/package*.json ./packages/playground/
COPY packages/example/package*.json ./packages/example/

RUN npm install

COPY . .

# Build the engine first, as playground depends on it
RUN npm run build -w dino-ge
RUN npm run build -w dino-ge-playground

EXPOSE 3000

ENTRYPOINT ["npx", "playwright", "test", "-c", "packages/playground/playwright.config.ts"]
