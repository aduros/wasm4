FROM node:16.19.1-alpine3.17 as web

RUN npm i -g rimraf typescript
WORKDIR /app
COPY . .

RUN npm ci

EXPOSE 4445
ENTRYPOINT ["./start"]
