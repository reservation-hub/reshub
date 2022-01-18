FROM node:14

WORKDIR /app

COPY ./app/@types ./@types
COPY ./app/prisma ./prisma
COPY ./app/seedFiles ./seedFiles
COPY ./app/src ./src
COPY ./app/main.ts .
COPY ./app/nodemon.json .
COPY ./app/package* ./
COPY ./app/test.ts .
COPY ./app/tsconfig.json .

COPY ./scripts/server /scripts

RUN chmod +x /scripts/*

ENTRYPOINT [ "/scripts/entrypoint.sh" ]
