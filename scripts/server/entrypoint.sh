#!/bin/bash
echo "Running in NODE_ENV=$NODE_ENV COMMAND=$COMMAND"

echo "Running npm install ..."
npm install --prefer-offline --no-audit

echo "Running npm run $COMMAND ..."
npm run $COMMAND