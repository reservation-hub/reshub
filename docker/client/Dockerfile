FROM node:14

WORKDIR /app

COPY ./app/client .

COPY ./scripts/client /scripts

RUN chmod +x /scripts/*

ENTRYPOINT [ "/scripts/entrypoint.sh" ]