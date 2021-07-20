FROM node:14

WORKDIR /app

COPY ./app .

COPY ./scripts/server /scripts

RUN chmod +x /scripts/*

ENTRYPOINT [ "/scripts/entrypoint.sh" ]