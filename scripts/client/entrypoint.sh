#!/bin/bash
echo "Running in NODE_ENV=$NODE_ENV COMMAND=$COMMAND"

echo "Running npm install ..."
yarn install

echo "Running npm run $COMMAND ..."
yarn $COMMAND