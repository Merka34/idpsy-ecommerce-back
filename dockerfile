# 1. Usamos una imagen ligera de Node.js
FROM node:20-alpine

# 2. Creamos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de dependencias
COPY package*.json ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos el resto del código
COPY . .

# 6. CREAMOS LA CARPETA DE UPLOADS explícitamente y damos permisos
# Esto asegura que la ruta sea /app/uploads/products
RUN mkdir -p uploads/products && chmod -R 777 uploads

# 7. Exponemos el puerto que usa tu servidor (ej. 5000)
EXPOSE 5000

# 8. Comando para arrancar
CMD ["npm", "start"]