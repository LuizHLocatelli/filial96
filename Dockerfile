# Usa uma imagem oficial do Node.js
FROM node:20-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (otimiza o cache)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe a porta que o Vite vai usar
EXPOSE 8080

# Comando para rodar o projeto
CMD ["npm", "run", "dev", "--", "--host", "--port", "8080"]
