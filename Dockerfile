FROM node:21

RUN mkdir -p /containers/test-task

WORKDIR /containers/test-task

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]