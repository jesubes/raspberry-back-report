FROM node:18-alpine

# Instalar dependencias necesarias para Chromium en el contenedor
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# copia los archivos necesarios 
COPY package*.json ./

#evitar descarga 
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Instala las dependencias
RUN npm install

# copiar el resto del código
COPY . .

# Configurar Puppeteer para usar Chromium del sistema
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Expone el puerto en el que corre tu aplicacion 
EXPOSE 4040

# Comando para ejecutar la aplicacion
CMD ["npm", "start"]