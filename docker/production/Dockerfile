FROM reshub:latest AS builder

ENV NODE_ENV=dev

RUN npm install --prefer-offline --no-audit && npm run build

FROM node:16

WORKDIR /app

COPY ./app/package.json ./package.json

COPY ./app/tsconfig.json ./tsconfig.json

COPY ./app/prisma ./prisma

COPY ./app/@types ./@types

COPY --from=builder ./app/dist/ ./

COPY ./scripts/production /scripts

RUN chmod +x /scripts/*

ENTRYPOINT [ "/scripts/entrypoint.sh" ]
