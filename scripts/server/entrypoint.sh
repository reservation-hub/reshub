#!/bin/bash
echo "Running in NODE_ENV=$NODE_ENV COMMAND=$COMMAND"

echo "Setting .env file"
if [[ $NODE_ENV = 'development' ]]; then
    cp /environment/.env.dev /environment/.env
else
    cp /environment/.env.production /environment/.env
fi
rm /environment/.env.dev
rm /environment/.env.production

echo "Running npm install ..."
npm install --prefer-offline --no-audit

echo "Running npm run $COMMAND ..."
npm run $COMMAND