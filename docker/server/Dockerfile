FROM node:14

WORKDIR /app

COPY ./app/server .

COPY ./.env* /environment/

COPY ./scripts/server /scripts

RUN chmod +x /scripts/*

ENTRYPOINT [ "/scripts/entrypoint.sh" ]