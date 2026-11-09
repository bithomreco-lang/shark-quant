FROM node:20-slim

# Install latest Chromium for Puppeteer chart vision capture
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PORT=5000

WORKDIR /app

# Copy dependencies first for fast caching
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]

