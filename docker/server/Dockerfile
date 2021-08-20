FROM node:14

WORKDIR /app

COPY ./app/config .
COPY ./app/config .
COPY ./app/prisma .
COPY ./app/seedFiles .
COPY ./app/src .
COPY ./app/main.ts .
COPY ./app/nodemon.json .
COPY ./app/package* ./
COPY ./app/test.js .
COPY ./app/tsconfig.json .

COPY ./scripts/server /scripts

RUN chmod +x /scripts/*

ENTRYPOINT [ "/scripts/entrypoint.sh" ]