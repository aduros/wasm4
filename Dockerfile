FROM node:16.19.1-alpine3.17 as web

RUN npm i -g rimraf typescript
WORKDIR /app
COPY . .

WORKDIR /app/devtools/web

RUN npm ci
RUN npm run build

WORKDIR /app/runtimes/web

RUN npm ci
RUN npm run build

FROM node:16.19.1-alpine3.17

WORKDIR /app
COPY . .
WORKDIR /app/site

COPY --from=web /app/runtimes/web/dist/slim /app/site/static/embed

RUN npm ci
RUN npm run build

EXPOSE 3030
ENTRYPOINT ["npm", "run", "serve"]
