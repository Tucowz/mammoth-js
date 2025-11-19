FROM node:20-alpine

# Cria diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock (se existir)
COPY package*.json ./

# Instala dependências (somente de produção)
RUN npm install --omit=dev

# Copia o restante do código
COPY . .

# Porta padrão da app
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
