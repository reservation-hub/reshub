FROM reshub-client:latest AS builder

RUN yarn install && yarn build

FROM reshub-server:latest

WORKDIR /app

COPY ./app/server .

COPY --from=builder /app/build/* ./src/public/

COPY ./scripts/production /scripts

RUN chmod +x /scripts/*

ENTRYPOINT [ "/scripts/entrypoint.sh" ]