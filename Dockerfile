#usar la imagen preconfigurada del puppeteer para ARM64
FROM node:18-bullseye-slim

#instalar dependecias necesaras para puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxi6 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libcups2 \
    libxshmfence1 \
    libgbm-dev \
    libgtk-3-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# copia los archivos necesarios 
COPY package*.json ./

#evitar descarga 
# ENV PUPPETEER_SKIP_DOWNLOAD=true

# Instala las dependencias
RUN npm install

# copiar el resto del código
COPY . .

# Configurar Puppeteer para usar Chromium del sistema
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Expone el puerto en el que corre tu aplicacion 
EXPOSE 4040

# Comando para ejecutar la aplicacion
CMD ["npm", "start"]